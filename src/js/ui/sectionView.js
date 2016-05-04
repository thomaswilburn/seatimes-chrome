var ipc = require("../ipc");

var element = document.querySelector("section.section-lists");
var tabs = element.querySelector(".tabs");
var lists = element.querySelector(".lists");

var sections = [
  { type: "zone", slug: "editors-picks-homepage", label: "Editors' picks" },
  { type: "zone", slug: "home-page-centerpiece-top-stories", label: "Top stories" },
  // { type: "section", slug: "nation-world", label: "Nation/World" }
];

sections.forEach(function(section) {
  var tab = document.createElement("li");
  tab.innerHTML = section.label;
  tab.setAttribute("slug", section.slug);
  tabs.appendChild(tab);
  section.tab = tab;

  var list = document.createElement("div");
  list.setAttribute("slug", section.slug);
  lists.appendChild(list);
  section.list = list;

  ipc.request(section.type == "zone" ? "getZone" : "getSection", { slug: section.slug }, function(response) {
    var html = response.posts.map(function(post) {
      return `<li> <a class="view-post" data-id="${post.id}">${post.title}</a></li>`;
    });
    section.list.innerHTML = html.join("\n");
  })
});

