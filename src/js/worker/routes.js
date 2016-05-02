var api = require("./seatimes");

module.exports = {
  getArticle: function(data, respond) {
    api.getArticle(data.id).then(function(data) {
      respond(data);
    });
  },
  getSection: function(data, respond) {

  }
}