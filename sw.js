// Cache de l'appli : tout est servi depuis l'iPad, internet sert seulement à se mettre à jour.
const CACHE='oche-v9';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./apple-touch-icon-precomposed.png','./logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isPage=e.request.mode==='navigate';
  e.respondWith(caches.match(e.request,{ignoreSearch:isPage}).then(hit=>{
    const net=fetch(e.request).then(res=>{
      if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy))}
      return res;
    }).catch(()=>hit||(isPage?caches.match('./index.html'):undefined));
    return hit||net;
  }));
});
