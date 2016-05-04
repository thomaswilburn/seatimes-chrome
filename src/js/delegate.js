module.exports = function(event, selector, callback) {
  document.body.addEventListener(event, function(e) {
    if (e.target.matches(selector)) {
      callback(e);
    }
  });
}