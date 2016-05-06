var ipc = require("./ipc");
var metrics = require("./metrics");
var articleView = require("./ui/articleView");
var sectionView = require("./ui/sectionView");
var menu = require("./ui/slideMenu");
var events = require("./util/events");

/*

coordinating views:
- SectionView
  - updateList(section, data) - sets content
  - setTabs(sections)
- ArticleView
  - showArticle(data) - does sanitization before loading into the webview and triggering slide
- MetricsView
  - show(metrics) - Pass the object to template into the page

handling events--let's dispatch similar to Caret

*/

var webview = document.querySelector("webview");
var zoneTimer = new metrics.Timer("UI", "Loaded initial zone");
ipc.request("getZone", { slug: "home-page-centerpiece-top-stories" }, function(data) {
  sectionView.loadSection(data);
  zoneTimer.end();
});

events.on("loadArticle", function(def) {
  var articleTimer = new metrics.Timer("UI", "Loaded article");
  ipc.request("getArticle", def, function(data) {
    articleView.loadArticle(data);
    articleTimer.end();
  });
});

events.on("loadSection", function(def) {
  var sectionTimer = new metrics.Timer("UI", "Loaded section list");
  ipc.request("getSection", def, function(data) {
    sectionView.loadSection(data);
    sectionTimer.end();
  });
});

events.on("loadChallenges", function() {
  ipc.request("getChallenges", sectionView.loadSection);
});

events.on("showMetrics", function() {
  var report = metrics.report();
  var section = document.querySelector(".section-lists .content");
  var html = "<ul>";
  for (var key in report) {
    html += `<li> ${key} <ul>`;
    var items = report[key];
    for (var line in items) {
      html += `<li> ${line}: ${items[line]}ms`;
    }
    html += "</ul>";
  }
  html += "</ul>";
  section.innerHTML = html;
});

var menuButton = document.querySelector(".menu-icon");
menuButton.addEventListener("click", () => events.emit("openMenu"));