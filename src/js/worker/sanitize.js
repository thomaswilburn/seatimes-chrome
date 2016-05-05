var parser = require("htmlparser2");
var serialize = require("dom-serializer");

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
  walk(dom, function(node) {
    //fix protocol-agnostic links
    // if (node.attribs && node.attribs.src) {
    //   console.log(node.attribs.src);
    //   node.attribs.src = node.attribs.src.replace(/^\/\//, "http://");
    //   console.log(node.attribs.src);
    // }
    //fix picturefill elements
    if (node.attribs && node.attribs["data-src-x-small"] && !node.attribs.src) {
      node.attribs.src = node.attribs["data-src-x-small"];
    }
  });
  return serialize(dom);
}

module.exports = { scrub };