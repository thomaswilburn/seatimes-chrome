var routes = require("./routes");
var events = require("../util/events");

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
  } else {
    events.emit(message.type, message.data);
  }
};

console.log("Worker is listening...");
self.postMessage({ type: "workerReady" });