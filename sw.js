const SCOPE = new URL(self.registration.scope);
const PREFIX = 'chlomim:' + SCOPE.pathname + ':';
const CACHE = PREFIX + '2026-09-16';
const FILES = ["./", "./index.html", "./studio/", "./studio/index.html", "./studio/main.js", "./studio/command-builder.js", "./studio/styles.css", "./studio/prompt.html", "./studio/prompt.js", "./studio/assets/IMG_0511.jpeg", "./studio/identity/identity.css", "./studio/identity/icon.svg", "./studio/identity/icon-180.png", "./studio/identity/icon-192.png", "./studio/identity/icon-512.png", "./studio/identity.webmanifest"];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== SCOPE.origin || !url.pathname.startsWith(SCOPE.pathname)) return;
  const relative = './' + url.pathname.slice(SCOPE.pathname.length);
  if (!FILES.includes(relative)) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(url.origin + url.pathname);
    return cached || fetch(e.request);
  }));
});
