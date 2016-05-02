/*

This module is a callback-based shim around IndexedDb, so that it doesn't completely suck.

It's very crude: just get/put/remove/each. You can use the `ready` promise to get to the DB if you need more power.

*/

var noop = function() {};

var getStore = function(db, storeName, write) {
  return db.transaction([storeName], write ? "readwrite" : undefined).objectStore(storeName);
};

//upgradeCallback must return a promise to signal completion
var Database = function(dbName, version, upgradeCallback) {
  this.db_ = null; //do not use, only for createObjectStore convenience
  this.ready = new Promise((ok, fail) => {
    var request = self.indexedDB.open(dbName, version || 1);
    request.onsuccess = () => ok(request.result);
    request.onupgradeneeded = () => {
      var db = this.db_ = request.result;
      if (upgradeCallback) upgradeCallback(db).then(() => ok(db));
    };
    request.onerror = fail;
  });
};

Database.prototype = {
  createStore: function(storeName, keyPath) {
    var db = this.db_;
    return new Promise(function(ok) {
      var store = db.createObjectStore(storeName, { keyPath: keyPath });
      store.transaction.oncomplete = ok;
    });
  },
  get: function(storeName, key) {
    return this.ready.then(db => new Promise(function(ok, fail) {
      var store = getStore(db, storeName);
      var request = store.get(key);
      request.onsuccess = () => ok(request.result);
      request.onerror = fail;
    }));
  },
  set: function(storeName, value) {
    return this.ready.then(db => new Promise(function(ok, fail) {
      var store = getStore(db, storeName, true);
      var request = store.put(value);
      request.onsuccess = ok;
      request.onerror = fail;
    }));
  },
  remove: function(storeName, key) {
    return this.ready.then(db => new Promise(function(ok, fail) {
      var store = getStore(db, storeName, true);
      var request = store.delete(key);
      request.onsuccess = ok;
      request.onerror = fail;
    }));
  },
  each: function(storeName, fn) {
    return this.ready.then(db => new Promise(function(ok, fail) {
      var store = getStore(db, storeName);
      var request = store.openCursor();
      request.onsuccess = function() {
        var cursor = request.result;
        if (cursor) {
          fn(cursor.value, cursor.key);
          cursor.continue();
        } else ok();
      };
      request.onerror = fail;
    }));
  }
}

module.exports = Database;