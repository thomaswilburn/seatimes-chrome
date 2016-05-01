var shell = require("shelljs");

shell.mkdir("-p", "build");

shell.cp("src/index.html", "build");