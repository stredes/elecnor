const CACHE_NAME = "elecnor-sections-v12";
const CACHEABLE_API = /^\/api\/(dashboard|analytics|findings|inspections(?:\/|$)|logs|metrics(?:\/|$)|procedures(?:\/|$)|reporting|unknowns|elecnor\/comparison(?:\/|$))/u;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames
      .filter((name) => name.startsWith("elecnor-sections-") && name !== CACHE_NAME)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_ELECNOR_SECTION_CACHE") {
    event.waitUntil(clearSectionCache());
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.method !== "GET") {
    event.respondWith(handleMutation(request));
    return;
  }

  if (isCacheableRequest(request, url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

function isCacheableRequest(request, url) {
  return request.method === "GET" && CACHEABLE_API.test(url.pathname);
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const update = fetch(request, { cache: "no-store" }).then(async (response) => {
    if (response.ok) await cache.put(request, response.clone());
    return response;
  });
  if (cached) {
    void update.catch(() => undefined);
    return cached;
  }
  return update;
}

async function handleMutation(request) {
  const response = await fetch(request);
  if (response.ok) await clearSectionCache();
  return response;
}

async function clearSectionCache() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames
    .filter((name) => name.startsWith("elecnor-sections-"))
    .map((name) => caches.delete(name)));
}
