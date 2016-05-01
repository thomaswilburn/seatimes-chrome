var ipc = require("./ipc");

setTimeout(() => ipc.request("echo", { time: Date.now() }, data => console.log(data)), 3000);