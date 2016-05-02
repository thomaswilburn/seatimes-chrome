/*

This module implements two queues for network requests--one that's high-
priority, to be used by anything that's user-visible, and one that's low-
priority for caching processes and so-on. 

*/

var storage = require("./storage");

var outbound = {};

var xhr = function(url) {
  if (url in outbound) return outbound[url];
  console.log("Network request: " + url);
  var req = new Promise(function(ok, fail) {
    var x = new XMLHttpRequest();
    x.open("GET", url);
    x.onload = x.onerror = function(e) {
      delete outbound[url];
      if (x.readyState != 4 || x.status >= 400) {
        return fail(e);
      }
      var data = x.responseText;
      try {
        data = JSON.parse(data);
      } catch (err) {
        return fail("Unable to parse JSON")
      }
      ok(data);
    };
    x.send();
  });
  outbound[url] = req;
  return req;
};


var slow = {
  limit: 3,
  queue: [],
  running: [],
  next: function() {
    while(slow.running.length < slow.limit) {
      var f = slow.queue.shift();
      if (!f) return;
      var req = f();
      slow.running.push(req);
      //remove this from the running list when done
      var done = function() {
        slow.running = slow.running.filter(item => item != req);
        slow.next();
      };
      req.then(done, done);
    }
  }
};

var facade = {
  fast: function(url) {
    var request = xhr(url);
    return request;
  },
  slow: function(url) {
    return new Promise(function(ok, fail) {
      //this function actually fires the request when called
      slow.queue.push(function() {
        console.log("requesting " + url);
        var req = xhr(url);
        req.then(ok, fail);
        return req;
      });
      slow.next();
    });
  }
}

module.exports = facade;