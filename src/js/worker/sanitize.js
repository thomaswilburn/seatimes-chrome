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

var escapes = {
  "“": "&ldquo;",
  "”": "&rdquo;",
  "’": "&rsquo;",
  "‘": "&lsquo;",
  "—": "&mdash;"
};

var escapeRegex = new RegExp("(" + Object.keys(escapes).join("|") + ")", "g");
var unicodeRegex = /[\u00A0-\u2666]/g;

var escapeString = function(s) {
  return s.replace(escapeRegex, c => escapes[c]).replace(unicodeRegex, c => `&#${c.charCodeAt(0)};`);
};

var scrub = function(html) {
  var dom = parser.parseDOM(html);
  walk(dom, function(node) {
    if (node.type == "text") {
      node.data = escapeString(node.data);
    }
    if (node.attribs && node.attribs["data-src-x-small"] && !node.attribs.src) {
      node.attribs.src = node.attribs["data-src-x-small"];
    }
  });
  return serialize(dom);
};


module.exports = { scrub, escapeString };