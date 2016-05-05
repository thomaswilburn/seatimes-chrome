var api = require("./seatimes");
var sanitizer = require("./sanitize.js");

module.exports = {
  getArticle: function(data, respond) {
    api.getArticle(data.id).then(function(data) {
      data.content = sanitizer.scrub(data.content);
      respond(data);
    });
  },
  getSection: function(data, respond) {
    api.getSection(data.slug).then(respond);
  },
  getZone: function(data, respond) {
    api.getZone(data.slug).then(respond);
  },
  getChallenges: function(data, respond) {
    api.getChallenges().then(respond);
  }
};