console.log("hello from the worker");

self.onmessage = function(e) {
  console.log(JSON.stringify(e.data), self);
  var message = e.data;
  setTimeout(function() {
    self.postMessage({
      type: "answer",
      id: message.id,
      data: "ping"
    });
  }, 100);
}