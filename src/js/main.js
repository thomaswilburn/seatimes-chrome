var ipc = require("./ipc");

ipc.request("getArticle", { id: 9993327 }, message => console.log(message));