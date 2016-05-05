var ipc = require("../ipc");
var events = require("../util/events");

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

var getImage = function(post, size) {
  if (!post.teaser_image || !post.teaser_image.sizes || !post.teaser_image.sizes[size]) return null;
  return post.teaser_image.sizes[size];
};

var loadSection = function(data) {
  var first = data.posts.shift();
  var images = data.posts.filter(p => p.teaser_image && p.teaser_image.sizes).map(p => loadImage(p.teaser_image.sizes.square_x_small));
  if (getImage(first, "standard_large")) images.push(loadImage(getImage(first, "standard_large")));
  Promise.all(images).then(function(blobs) {
    var urlMap = blobs.reduce(function(map, value) {
      map[value.url] = value.blob;
      return map;
    }, {});
    var listHTML = data.posts.map(function(post) {
      var thumbnail = "";
      if (getImage(post, "square_x_small")) {
        thumbnail = `<img src="${urlMap[getImage(post, "square_x_small")]}">`;
      }
      return `
        <li>
          <a article-id="${post.id}">
            <span class="label">${post.title}</span>
            ${thumbnail}
          </a>
        </li>
      `;
    }).join("");
    content.innerHTML = `
  <div class="top-item">
    <a article-id="${first.id}">
      <img src="${urlMap[getImage(first, "standard_large")]}">
      <h1>${first.title}</h1>
    </a>
    <ul class="remaining">
      ${listHTML}
    </ul>
  </div>
    `;
  });
}

module.exports = { loadSection }