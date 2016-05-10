var ipc = require("../ipc");
var events = require("../util/events");
var Vue = require("vue");
var view = new Vue({
  el: ".section-lists",
  data: { loaded: false, first: {}, posts: [] },
  methods: {
    getImage: function(post, size) {
      if (!post.teaser_image || !post.teaser_image.sizes || !post.teaser_image.sizes[size]) return "";
      return imageURLs[post.teaser_image.sizes[size]];
    },
    loadArticle: function(id) {
      events.emit("loadArticle", { id });
    }
  }
});

events.on("articleUpdated", function(update) {
  console.log("got update");
  view.data.posts = view.data.posts.map(function(item) {
    if (item.id == update.id) return update;
    return item;
  });
});

var imageURLs = {};

var container = document.querySelector("section.section-lists");
var content = container.querySelector(".content");

container.addEventListener("click", function(e) {
  var up = e.target.closest("[article-id]");
  if (up) {
    events.emit("loadArticle", { id: up.getAttribute("article-id") * 1 });
  }
});

var sections = [
  { type: "zone", slug: "editors-picks-homepage", label: "Editors' picks" },
  { type: "zone", slug: "home-page-centerpiece-top-stories", label: "Top stories" },
  // { type: "section", slug: "nation-world", label: "Nation/World" }
];

//Chrome apps have a super-strict CSP for images
//We can remove this when it's deployed as a web app.
var loadImage = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
    xhr.onload = function() {
      ok({ url, blob: URL.createObjectURL(xhr.response) });
    }
  });
};

var loadSection = function(data) {
  var first = data.posts.shift();
  var images = data.posts.filter(p => p.teaser_image && p.teaser_image.sizes).map(p => loadImage(p.teaser_image.sizes.square_x_small));
  if (first.teaser_image && first.teaser_image.sizes) images.push(loadImage(first.teaser_image.standard_large));
  Promise.all(images).then(function(blobs) {
    blobs.forEach(def => imageURLs[def.url] = def.blob);
    view.first = first;
    view.posts = data.posts;
    view.loaded = true;
  });
};

var wait = function() {};

module.exports = { loadSection, wait }