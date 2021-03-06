//This module loads and communicates with the primary worker thread.
var channel = require("./util/events");

var metrics = require("./metrics");

//When compiled, the worker script lives at ./worker.js
var startup = new metrics.Timer("App", "Worker startup");
var worker = new Worker("./worker.js");
console.log("Worker process started");
console.log(worker);

//Keep track of round-trip messages using a unique ID for each
var guid = 0;
var registry = {};
var ipc = {
  request: function(route, data, callback) {
    if (typeof data == "function") {
      callback = data;
      data = null;
    }
    var id = guid++;
    worker.postMessage({ type: "request", id, route, data });
    registry[id] = callback;
  }
};

worker.onmessage = function(e) {
  var message = e.data;
  if (message.type == "response") {
    var callback = registry[message.id];
    if (!callback) return console.error("Undeliverable message: ", message.data);
    callback(message.data);
    delete registry[message.id]
  } else {
    channel.emit(message.type, message.data);
  }
};

channel.on("workerReady", () => startup.end());

module.exports = ipc;