var less = require("less");
var fs = require("fs");

var seeds = {
  "./src/less/seed.less": "build/style.css"
};

var options = {
  paths: ["src/less"],
  filename: "seed.less"
};

for (var src in seeds) {
  var dest = seeds[src];
  var code = fs.readFileSync(src, "utf8");
  less.render(code, options, function(err, result) {
    fs.writeFileSync(dest, result.css);
  });
}