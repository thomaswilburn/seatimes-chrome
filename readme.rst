Seattle Times for Chrome
========================

This is an experimental client for The Seattle Times using only web technologies (it loads as a Chrome app solely to get around CORS). It makes heavy use of Web Workers for caching, parsing, and processor-intensive work, keeping the UI thread fast and responsive.

How to build/install this app
-----------------------------

1. Clone this repo.
2. Install dependencies with ``npm install``.
3. Start the build process with ``npm start``. You can also run individual build steps by using ``npm run x``, where "x" is "copy", "bundle", or "less".
4. Open ``chrome://extensions`` in Chrome, and click "Load unpacked extension". Choose the ``build`` folder that was generated in this folder. 