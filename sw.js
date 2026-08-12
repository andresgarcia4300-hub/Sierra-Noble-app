/* ══════════════════════════════════════════════════════════
   Sierra Noble · trabajador de servicio
   Guarda la app en el teléfono para que abra sin internet.
   IMPORTANTE: sube el número de VERSION cada vez que subas
   una versión nueva del index.html, o los teléfonos seguirán
   viendo la vieja.
   ══════════════════════════════════════════════════════════ */
const VERSION = "sierra-noble-v10-cruce-notas-caja";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icono-192.png",
  "./icono-512.png"
];

self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open(VERSION)
      .then(c=>c.addAll(ARCHIVOS))
      .then(()=>self.skipWaiting())
      .catch(()=>self.skipWaiting())   // si un archivo falla, no bloquear la instalación
  );
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys()
      .then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch", e=>{
  const req = e.request;

  // Las llamadas de sincronización NUNCA se guardan en caché:
  // deben ir siempre a la red o fallar limpio.
  if(req.method !== "GET") return;

  const url = new URL(req.url);
  if(url.origin !== location.origin) return;   // fuentes y demás: que las maneje el navegador

  // Primero la red, para que una versión nueva se note enseguida;
  // si no hay señal, se sirve lo guardado.
  e.respondWith(
    fetch(req)
      .then(res=>{
        const copia = res.clone();
        caches.open(VERSION).then(c=>c.put(req, copia)).catch(()=>{});
        return res;
      })
      .catch(()=>caches.match(req).then(r=>r || caches.match("./index.html")))
  );
});
