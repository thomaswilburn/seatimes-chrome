var ipc = require("../ipc");
var events = require("../util/events");
var m = require("mithril");

var contentDiv = document.querySelector(".section-lists .content");

//Chrome apps have a super-strict CSP for images
//We can remove this when it's deployed as a web app.
var imageURLs = {};

var loadImage = function(url) {
  if (!url) return Promise.resolve({});
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
    xhr.onload = function() {
      var blob = URL.createObjectURL(xhr.response);
      imageURLs[url] = blob;
      ok({ url, blob });
    }
  });
};

var getImage = function(post, size) {
  if (!post.teaser_image || !post.teaser_image.sizes || !post.teaser_image.sizes[size]) return "";
  return imageURLs[post.teaser_image.sizes[size]];
};

var loadArticle = id => events.emit("loadArticle", { id });

var section = {
  data: {
    first: m.prop(false),
    posts: m.prop([])
  },
  view: function() {
    if (!section.data.first()) {
      return m("img.backdrop", { src: "backdrop.png" });
    }
    var firstImage = getImage(section.data.first(), "standard_large") || "placeholder.png";
    return [
      m("div.top-item", [
        m("a.article-link", { onclick: loadArticle.bind(null, section.data.first().id) }, [
          m("img", { src: firstImage }),
          m("h1", m.trust(section.data.first().title))
        ])
      ]),
      m("ul.remaining", section.data.posts().map(function(post) {
        var postImage = getImage(post, "square_x_small");
        return m("li", [
          m("a.article-link", { onclick: loadArticle.bind(null, post.id) }, [
            m("span.label", m.trust(post.title)),
            postImage ? m("img", { src: postImage }) : null
          ])
        ]);
      }))
    ];
  }
};

events.on("articleUpdated", function(update) {
  var updateFound = false;
  var first = section.data.first();
  if (first.id == update.id) {
    section.data.first(update);
    if (!getImage(first, "standard_large") && update.teaser_image.sizes) {
      loadImage(update.teaser_image.sizes.standard_large).then(() => m.render(contentDiv, section.view()));
    }
    updateFound = true;
  } else {
    section.data.posts(section.data.posts().map(function(item) {
      if (item.id == update.id) {
        if (!getImage(item, "square_x_small") && update.teaser_image.sizes) {
          loadImage(update.teaser_image.sizes.square_x_small).then(() => m.render(contentDiv, section.view()));
        }
        updateFound = true;
        return update;
      }
      return item;
    }));
  }
  if (updateFound) m.render(contentDiv, section.view());
});

var sections = [
  { type: "zone", slug: "editors-picks-homepage", label: "Editors' picks" },
  { type: "zone", slug: "home-page-centerpiece-top-stories", label: "Top stories" },
  // { type: "section", slug: "nation-world", label: "Nation/World" }
];


var loadSection = function(data) {
  var first = data.posts.shift();
  section.data.first(first);
  section.data.posts(data.posts);
  m.render(contentDiv, section.view());
  var images = data.posts
    .filter(p => p.teaser_image && p.teaser_image.sizes)
    .map(p => loadImage(p.teaser_image.sizes.square_x_small));
  if (first.teaser_image && first.teaser_image.sizes) images.push(loadImage(first.teaser_image.standard_large));
  Promise.all(images).then(function() {
    section.data.first(first);
    section.data.posts(data.posts);
    m.render(contentDiv, section.view());
  });
};

var wait = function() {
  section.data.first(false);
  m.render(contentDiv, section.view());
};

module.exports = { loadSection, wait }