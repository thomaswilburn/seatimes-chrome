var shell = require("shelljs");

shell.mkdir("-p", "build");

shell.cp("src/*.html", "build");
shell.cp("src/*.png", "build");
shell.cp("src/*.js", "build");
shell.cp("src/manifest.json", "build"); //replace with a task that can mangle the manifest for the store
