chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create("index.html", {
    bounds: {
      width: 640,
      height: 800
    },
    minWidth: 480,
    minHeight: 400
  }, function(created) {
    
  })
})