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
    // var hubContent = network.fast(hub);
    fromNetwork = network.fast(hub);
    // var rawContent = network.fast(raw);
    // var fromNetwork = Promise.all([hubContent, rawContent]).then(function(results) {
    //   var [hub, raw] = results;
    //   raw.teaser_image = hub.teaser_image || {};
    //   return Promise.resolve(raw);
    // });
    var fromStorage = db.get("articles", id);
    //compare results when both are in
    Promise.all([fromNetwork, fromStorage]).then(function(both) {
      var [netted, stored] = both;
      //TODO: if the network is newer, fire an update event with it
      //either way, if it's valid, store it in the DB
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
  }
};

module.exports = api;