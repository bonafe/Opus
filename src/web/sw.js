const filesToCache = [
'/bibliotecas/jspanel/jspanel.min.js',
'/bibliotecas/jspanel/jspanel.min.css',
'/bibliotecas/tabulator/css/tabulator.min.css',
'/bibliotecas/tabulator/css/tabulator.scss',
'/bibliotecas/tabulator/js/tabulator.min.js',
'/bibliotecas/visjs/vis-network.min.js',
'/bibliotecas/visjs/vis.timeline-graph2d.min.js',
'/bibliotecas/humanize-duration.js',
'/modulos/atividades/atividades_view.js',
'/modulos/atividades/atividades_dao.js',
'/modulos/cpf/CPF.js',
'/modulos/pessoas/usuario_dao.js',
'/modulos/processos_trabalho/base/2021_05_02_processos_trabalho_rfb.js',
'/modulos/processos_trabalho/competencias_view.js',
'/modulos/processos_trabalho/processos_trabalho_dao.js',
'/modulos/processos_trabalho/processos_trabalho_view.js',
'/TrabalhoRFB.html',
'/trabalho_rfb.js'
];

const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.add(filesToCache);
    })
  );
});



self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});