var api = require("./seatimes");

module.exports = {
  getArticle: function(data, respond) {
    api.getArticle(data.id).then(respond);
  },
  getSection: function(data, respond) {
    api.getSection(data.slug).then(respond);
  },
  getZone: function(data, respond) {
    api.getZone(data.slug).then(respond);
  }
};