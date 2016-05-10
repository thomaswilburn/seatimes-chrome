/*

This module handles loading content, either from the network or the database cache. It's effectively our internal API gateway, which hopefully provides adequate abstraction should the underlying API endpoint change.

Request flow:
- App asks for content X
- Check the database to see if we have it AND fire off a network request for it
- Don't wait for the network if the database already has it
- If it was cached, but the network had a newer copy, fire an "update" event for the app.
- Cache the result of the network call in the database for next request.

*/

var network = require("./network");
var config = require("./config.json");
var events = require("../util/events");

var Database = require("./idb");

var db = new Database("seatimes", 1, function() {
  return db.createStore("articles", "id");
});

self.db = db;

var getCollection = function(slug, urlSegment) {
  var url = config.endpoint + urlSegment + slug;
  return network.fast(url).then(function(data) {
    var ids = data.posts.map(api.getArticle);
    return Promise.all(ids).then(function(results) {
      data.posts = results;
      return Promise.resolve(data);
    });
  });
};

var api = {
  getArticle: function(id) {
    var hub = config.endpoint + "hub/post/" + id;
    var raw = config.endpoint + "posts/" + id;
    var fromNetwork = network.fast(raw);
    var fromStorage = db.get("articles", id);
    var hubUpdate = network.fast(hub);
    //Send an update when the hub returns with teasers
    Promise.all([hubUpdate, fromNetwork, fromStorage]).then(function(results) {
      var [hubContent, netContent, storedContent] = results;
      var wpContent = netContent || storedContent;
      wpContent.teaser_image = hubContent.teaser_image || {};
      db.set("articles", wpContent);
      events.emit("articleUpdated", wpContent);
    });
    //compare results when we have some content
    Promise.all([fromNetwork, fromStorage]).then(function(both) {
      var [netted, stored] = both;
      events.emit("articleUpdated", netted);
      netted.id = id;
      db.set("articles", netted);
    });
    //assume storage is faster, fall back on network
    return fromStorage.then(function(data) {
      // if (!data) console.log("Database miss for " + id);
      if (!data) return fromNetwork;
      return Promise.resolve(data);
    });
  },
  getSection: function(slug) {
    return getCollection(slug, "hub/section/");
  },
  getZone: function(slug) {
    return getCollection(slug, "hub/zone/");
  },
  getChallenges: function() {
    var data = {
      title: "Curated",
      slug: "challenges",
      posts: [9970675, 9989893, 10000169]
    };
    return Promise.all(data.posts.map(api.getArticle)).then(function(results) {
      data.posts = results;
      return Promise.resolve(data);
    })
  }
};

module.exports = api;