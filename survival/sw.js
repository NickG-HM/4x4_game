/* Cache-first for repeat visits. Bump CACHE_BUST when you publish a new Unity WebGL build. */
var CACHE_BUST = "survival-2026-04-28-1";

function scopeBase() {
  var p = self.location.pathname;
  var i = p.lastIndexOf("/");
  return p.slice(0, i + 1);
}

function sameSurvivalScope(url) {
  try {
    var u = new URL(url);
    if (u.origin !== self.location.origin) return false;
    return u.pathname.indexOf(scopeBase()) === 0;
  } catch (e) {
    return false;
  }
}

function shouldCache(url) {
  return (
    url.indexOf("/Build/") !== -1 ||
    url.indexOf("/TemplateData/") !== -1 ||
    url.indexOf("/StreamingAssets/") !== -1 ||
    /\/index\.html($|\?)/.test(url) ||
    /manifest\.webmanifest/.test(url)
  );
}

self.addEventListener("install", function (event) {
  event.waitUntil(Promise.resolve().then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_BUST && k.indexOf("survival-") === 0; })
          .map(function (k) { return caches.delete(k); })
      );
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  var req = event.request;
  if (req.method !== "GET") return;
  var url = req.url;
  if (!sameSurvivalScope(url) || !shouldCache(url)) return;

  event.respondWith(
    caches.open(CACHE_BUST).then(function (cache) {
      return cache.match(req, { ignoreSearch: false }).then(function (cached) {
        if (cached) return cached;
        return fetch(req).then(function (network) {
          if (network && network.status === 200 && network.type === "basic") {
            try {
              cache.put(req, network.clone());
            } catch (e) {}
          }
          return network;
        });
      });
    })
  );
});
