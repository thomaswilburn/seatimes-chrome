Seattle Times for Chrome
========================

This is an experimental client for The Seattle Times using only web technologies (it loads as a Chrome app solely to get around CORS). It makes heavy use of Web Workers for caching, parsing, and processor-intensive work, keeping the UI thread fast and responsive.

How to build/install this app
-----------------------------

1. Clone this repo.
2. Install dependencies with ``npm install``.
3. Start the build process with ``npm start``. You can also run individual build steps by using ``npm run x``, where "x" is "copy", "bundle", or "less".
4. Open ``chrome://extensions`` in Chrome, and click "Load unpacked extension". Choose the ``build`` folder that was generated in this folder.

Architecture notes
------------------

The app is mostly built in two parts: a main script that runs on the page and handles UI interactions and rendering, and a worker script that covers everything else. This structure is heavily influenced by `Pokedex.org <http://www.pocketjavascript.com/blog/2015/11/23/introducing-pokedex-org>`_, as well as work being done on AMP and Angular 2.

Main process
~~~~~~~~~~~~

The main thread marshals data between the web worker and two views (article lists and article view), with views translating UI interaction into messages on a common event bus for the main thread to handle. Views never communicate directly with the worker.

The section view is rendered using Mithril, which lets us progressively render the list, adding thumbnails at a later date without wiping the DOM. Since getting the thumbnail is a second request, we put those in the slow queue in order to surface headlines first, instead of waiting for both requests to return before rendering.

The article view contains a webview tag, which is the Chrome app equivalent to an iframe. Article HTML is injected into a simple document template, including JS and CSS, then passed to the webview as a base64-encoded data URI. An earlier version of the app used blobs and object URLs, but the webview has a tendency to crash on larger blobs, so it's base64 for now.

Worker process
~~~~~~~~~~~~~~

It's helpful to think of the worker as an embedded server, and whenever possible it has been written as such. Although the worker does broadcast some messages without a prior request (such as the "articleUpdated" events when the cache is invalidated), most of its communication happens on request from the main thread. Messages arriving in the worker are dispatched to route handler functions based on the message's ``route`` property, along with a response callback that they can use to reply. Internally, handlers (and most other worker modules) are promise-based.

Retrieving an article invokes the most complicated handler in the worker, which does the following work:

1. The worker makes three requests for the article content: one to IndexedDB for cached data, one on the network's immediate channel for article text, and one on the "slow" network queue for the thumbnail.
2. We assume that the database is always faster than the network. If there's no cached content, we resolve with the network promise instead.
3. Asynchronously, after all three requests have settled, we check to see whether the network content is newer than the cache. If so, we update the database and dispatch an "articleUpdated" message back to the main thread so that it can update accordingly.
4. The route handler runs the article content through the HTML sanitizer, which cleans up things like bad picture elements and unescaped text. It also escapes any Unicode in the title.
5. Finally, processing all complete, the handler responds with the article, which is then routed back to the main thread for display.

Although this process is complicated, it is surprisingly fast. Articles that have been cached (which is usually all of them, once a section list has loaded) are returned to the main thread within 150ms on a mobile-class CPU.