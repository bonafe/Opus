const id_cache = 'teste-cache-v1';
const urlsCache = ["/", "/teste.html"];

console.log('Service Worker iniciando...');

self.addEventListener('install', event => {
    debugger;
    console.log('Service Worker instalado!!!');

    event.waitUntil(
        caches.open(id_cache)
        .then(cache => {
            return cache.addAll(urlsCache);
        })
    );
});



self.addEventListener('activate', event => {
  console.log('Service Worker ativado!');
});



self.addEventListener('fetch', event => {
    console.log ('Service worker: FETCH');
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});



self.addEventListener('push', event => {
    event.waitUntil(
        self.registration.showNotification("Título", {
            body: "Você recebeu uma mensagem!",
            tag: "push-tag-exemplo"
        })
    );
});