// Cache de l'appli. La page elle-même est prise en ligne d'abord (un simple rafraîchissement montre la dernière
// version) ; sans internet ou si le réseau ne répond pas en 3 s, on sert la copie gardée sur l'appareil.
// Les autres fichiers (icônes, logo) viennent de la copie et sont mis à jour en arrière-plan.
const CACHE='oche-v13';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./apple-touch-icon-precomposed.png','./logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const garder=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res};
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){
    const copie=()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match('./index.html'));
    e.respondWith(new Promise(ok=>{
      let fini=false;
      const t=setTimeout(()=>copie().then(h=>{if(!fini&&h){fini=true;ok(h)}}),3000);
      fetch(e.request,{cache:'no-store'}).then(res=>{clearTimeout(t);garder(e.request,res);if(!fini){fini=true;ok(res)}})
        .catch(()=>{clearTimeout(t);copie().then(h=>{if(!fini){fini=true;ok(h||Response.error())}})});
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(res=>garder(e.request,res)).catch(()=>hit);
    return hit||net;
  }));
});
