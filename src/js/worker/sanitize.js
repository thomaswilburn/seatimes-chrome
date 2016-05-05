var parser = require("htmlparser2");

var walk = function(list, fn) {
  for (var i = 0; i < list.length; i++) {
    var node = list[i];
    var result = fn(node);
    if (result) list[i] = result;
    if (list[i].children) walk(list[i].children, fn);
  }
};

var scrub = function(html) {
  var dom = parser.parseDOM(html);
  // walk(dom, function(node) {
    // console.log(node);
  // });
  return html;
}

module.exports = { scrub };