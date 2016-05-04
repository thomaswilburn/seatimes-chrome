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

var api = {
  getArticle: function(id) {
    var url = config.endpoint + "posts/" + id;
    var fromNetwork = network.fast(url);
    var fromStorage = db.get("articles", id);
    //compare results when both are in
    Promise.all([fromNetwork, fromStorage]).then(function(both) {
      var [netted, stored] = both;
      //TODO: if the network is newer, fire an update event with it
      //either way, if it's valid, store it in the DB
      netted.id = netted.ID;
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
    var url = config.endpoint + "hub/section/" + slug;
    // start pre-caching sections when they load up
    return network.fast(url).then(function(data) {
      var ids = data.posts.map(api.getArticle);
      return Promise.all(ids).then(function(results) {
        data.posts = results;
        return Promise.resolve(data);
      });
    });
  },
  getZone: function(slug) {
    var url = config.endpoint + "hub/zone/" + slug;
    return network.fast(url).then(function(data) {
      var ids = data.posts.map(api.getArticle);
      return Promise.all(ids).then(function(results) {
        data.posts = results;
        return Promise.resolve(data);
      });
    });
  }
};

module.exports = api;