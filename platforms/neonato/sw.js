const CACHE_NAME = "neo-aula1-v1";

const FILES = [
  "./",
  "./index.html",
  "./offline.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/app.js",
  "./data/transcricao.txt",
  "./assets/illustrations/hero-generated.png",
  "./assets/illustrations/favicon.svg",
  "./assets/illustrations/hero-neonatologia.svg",
  "./assets/illustrations/classificacao-rn.svg",
  "./assets/illustrations/vias-infeccao.svg",
  "./assets/illustrations/fluxo-sifilis.svg",
  "./assets/illustrations/caso-joao.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match("./offline.html"));
    })
  );
});
