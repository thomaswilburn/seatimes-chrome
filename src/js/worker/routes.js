var api = require("./seatimes");
var sanitizer = require("./sanitize.js");

module.exports = {
  getArticle: function(data, respond) {
    api.getArticle(data.id).then(function(data) {
      data.content = sanitizer.scrub(data.content);
      data.title = sanitizer.escapeString(data.title);
      respond(data);
    });
  },
  getSection: function(data, respond) {
    api.getSection(data.slug).then(function(data) {
      data.posts.forEach(p => p.title = sanitizer.escapeString(p.title));
      respond(data);
    });
  },
  getZone: function(data, respond) {
    api.getZone(data.slug).then(respond);
  },
  getChallenges: function(data, respond) {
    api.getChallenges().then(respond);
  }
};