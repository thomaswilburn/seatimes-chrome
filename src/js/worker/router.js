var log = require("./log");

var echoHandler = function(data, callback) {
  log(JSON.stringify(data));
  callback(data);
};

var routes = {
  "echo": echoHandler
};

module.exports = {
  route: function(request, respond) {
    var handler = routes[request.route];
    if (!handler) return console.error(`No handler for ${message.route}`);
    handler(request.data, function(response) {
      respond({
        id: request.id,
        type: "response",
        data: response
      });
    });
  }
}
