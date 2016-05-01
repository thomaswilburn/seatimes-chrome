var gaze = require("gaze");
var spawn = require("child_process").spawn;
var chalk = require("chalk");

var npm = process.platform == "win32" ? "npm.cmd" : "npm";

var watch = function(name, pattern, scripts) {
  console.log(chalk.bgBlue.white("Starting watch task: " + name));
  gaze(pattern, { debounceDelay: 200 }, function(err, watcher) {
    watcher.on("all", function() {
      console.log(chalk.bgBlue.white(name + " - file change detected"));
      var p = spawn(npm, ["run"].concat(scripts), { stdio: "inherit" });
      p.on("close", function() {
        console.log(chalk.bgBlue.white(name + " finished"));
      });
    });
  });
};

//Set watches
watch("Browserify", "src/js/**/*", ["bundle"]);
watch("Copy", "src/index.html", ["copy"]);
watch("LESS", "src/less/**/*", ["less"]);