var routes = require("./routes");

self.onmessage = function(e) {
  var message = e.data;
  if (message.type == "request") {
    var handler = routes[message.route];
    if (!handler) return console.error(`No handler for ${message.route}`);
    handler(message.data, function(response) {
      self.postMessage({
        id: message.id,
        type: "response",
        data: response
      });
    });
  }
}

