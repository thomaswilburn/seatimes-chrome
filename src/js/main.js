console.log("hello");

var ipc = require("./ipc");

ipc.ask("hello", { world: true }, data => console.log(data));