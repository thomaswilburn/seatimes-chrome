module.exports = function() {
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (typeof arg == "object") {
      console.log(JSON.stringify(arg, null, 2));
    } else {
      console.log(arg);
    }
  }
}