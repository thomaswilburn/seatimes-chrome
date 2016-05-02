/*

This module serves as a central event bus, which may be used to communicate between different modules.

*/

var EventEmitter = require("events");

var channel = new EventEmitter();

module.exports = channel;