var router = require("./router");
var log = require("./log");

self.onmessage = function(e) {
  var message = e.data;
  if (message.type == "request") {
    router.route(message, postMessage);
  }
}

