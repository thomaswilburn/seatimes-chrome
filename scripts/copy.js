var shell = require("shelljs");

shell.mkdir("-p", "build");

shell.cp("src/index.html", "build");
shell.cp("src/icon-60.png", "build");
shell.cp("src/background.js", "build");
shell.cp("src/manifest.json", "build"); //replace with a task that can mangle the manifest for the store
