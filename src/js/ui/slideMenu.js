var events = require("../util/events");
var menu = document.querySelector(".slide-menu");

events.on("openMenu", function() {
  menu.classList.add("prep");
  var reflow = menu.offsetWidth;
  menu.classList.add("activate");
});

menu.addEventListener("click", function(e) {
  var event = e.target.getAttribute("event-trigger");
  if (event) {
    events.emit(event);
  }
  var section = e.target.getAttribute("section-slug");
  if (section) {
    events.emit("loadSection", { slug: section });
  }
  menu.classList.remove("prep", "activate");
});