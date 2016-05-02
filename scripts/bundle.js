var browserify = require("browserify");
var fs = require("fs");

var seeds = {
  "src/js/worker/worker.js": "build/worker.js",
  "src/js/main.js": "build/app.js"
};

for (var src in seeds) {
  var dest = seeds[src];
  var b = browserify({ debug: true });
  b.add(src);

  var bundle = b.bundle();
  var out = fs.createWriteStream(dest);
  bundle.pipe(out);
}