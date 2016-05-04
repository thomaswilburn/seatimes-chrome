var ipc = require("./ipc");
var metrics = require("./metrics");

var req = metrics.Timer("UI", "Article request");
ipc.request("getArticle", { id: 9993327 }, message => { 
  console.log(message);
  req.end();
  console.log(metrics.report())
});