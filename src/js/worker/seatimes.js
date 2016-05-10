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

var getCollection = function(urlSegment, slug) {
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
    var fromNetwork = network.fast(raw).then(function(data) {
      data.id = id;
      db.set("articles", data);
      return Promise.resolve(data);
    });
    var fromStorage = db.get("articles", id);
    var hubUpdate = network.slow(hub);
    //Send an update when the hub returns with teasers
    Promise.all([hubUpdate, fromNetwork, fromStorage]).then(function(results) {
      var [hubContent, netContent, storedContent] = results;
      var wpContent = netContent || storedContent;
      wpContent.id = id;
      wpContent.teaser_image = hubContent.teaser_image || {};
      //save the merged article to the database
      db.set("articles", wpContent).then(function() {
        events.emit("articleUpdated", wpContent);
      });
    });
    //assume storage is faster, fall back on network
    return fromStorage.then(function(data) {
      // if (!data) console.log("Database miss for " + id);
      if (!data) return fromNetwork;
      return Promise.resolve(data);
    });
  },
  getSection: getCollection.bind(null, "hub/section/"),
  getZone: getCollection.bind(null, "hub/zone/"),
  getChallenges: function() {
    var data = {
      title: "Curated",
      slug: "challenges",
      posts: [9970675, 9989893, 10000169, 10003965]
    };
    return Promise.all(data.posts.map(api.getArticle)).then(function(results) {
      data.posts = results;
      return Promise.resolve(data);
    })
  }
};

module.exports = api;