/*

This module handles loading content, either from the network or the database cache. It's effectively our internal API gateway, which hopefully provides adequate abstraction should the underlying API endpoint change.

Request flow:
- App asks for content X
- Check the database to see if we have it.
- If we do, return that immediately.
- Also fire off a network request to check for updates.
- If the network had a newer copy, fire an "update" event for the app.
- If we didn't have this, return the new content to the app
- Cache the result of the network call in the database for next request.

*/

var network = require("./network");
var storage = require("./storage");
var config = require("./config.json");
