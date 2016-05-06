chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("index.html", {
    bounds: {
      width: 360,
      height: 580
    },
    minWidth: 360,
    minHeight: 400
  }, function(created) {
    
  })
})