var container = document.querySelector(".article-panel");
var webview = container.querySelector("webview");
webview.addEventListener("loadstop", () => container.classList.add("active"));
setTimeout(() => container.classList.add("ready"), 100);

container.querySelector(".back-button").addEventListener("click", () => container.classList.remove("active"));

var sanitize = function(html) {

};

var loadArticle = function(article) {
  console.log(article);
  var html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="http://www.seattletimes.com/wp-content/themes/st_refresh/css/styles.min.css?ver=1461861640"/>
    <style>
body {
  margin-top: 0;
  padding: 0 20px;
}

img, iframe, object, video {
  max-width: 100%;
}
    </style>
    <script>
window.SEATIMESCO = {
  payMeter: {},
  subscriptions: {},
  subscriptionSalePromo: {},
  comments: {},
  singleSignOn: { info: {} }
};
window.dataLayer = [{}];
Object.defineProperty(document, "cookie", { get: () => "", set: () => "" });
    </script>
  </head>
  <body>
    <h1>${article.title}</h1>
    <img src="${article.teaser_image.sizes ? article.teaser_image.sizes.standard_large : ""}">
    ${article.content}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js"></script>
    <script src="http://www.seattletimes.com/wp-content/themes/st_refresh/js/bundle.min.js?ver=1461861640"></script>
  </body>
</html>
  `;
  var dataURL = `data:text/html;base64,${self.btoa(unescape(encodeURIComponent(html)))}`;
  webview.src = dataURL;
};

module.exports = { loadArticle, webview }