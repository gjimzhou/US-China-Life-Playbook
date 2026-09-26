'use strict';
// Explicitly saved static pages only. Never cache analytics, API traffic or the SPA.
const prefix='playbook-offline-v1-';
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url),base=new URL(self.registration.scope);
 if(event.request.method!=='GET'||u.origin!==base.origin||!u.pathname.startsWith(base.pathname))return;
 const path=u.pathname.slice(base.pathname.length);
 if(!/^(read\/d-[a-f0-9]{12}\.html|offline\.html|offline\.js|style\.css|favicon\.svg)$/.test(path))return;
 event.respondWith((async()=>{
  try{const r=await fetch(event.request,{signal:AbortSignal.timeout(6000)});if(r.ok)return r;throw Error()}catch{
   const names=(await caches.keys()).filter(n=>n.startsWith(prefix)).reverse();
   for(const name of names){const cache=await caches.open(name);if(!await cache.match(new URL('offline-entry.json',base).href))continue;const r=await cache.match(new URL(path,base).href);if(r)return r}
   return new Response('此页未保存为离线副本。请联网后重试，或返回已保存的离线阅读中心。',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});
  }
 })());
});
