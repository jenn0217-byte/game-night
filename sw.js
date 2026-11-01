/* Game Night service worker: opens instantly from the phone's copy, then fetches the newest version in the background. */
const C='gn-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./icon-180.png','./icon-512.png','./manifest.webmanifest']).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');const key=isPage?'./':r;
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(key);
    const net=fetch(r,{cache:'no-store'}).then(async res=>{if(res&&res.ok){const old=hit?await hit.clone().text().catch(()=>''):'';const copy=res.clone();await c.put(key,copy);
        if(isPage&&hit){const nu=await res.clone().text().catch(()=>'');if(nu&&old&&nu.length!==old.length){const cl=await self.clients.matchAll();cl.forEach(x=>x.postMessage('gn-updated'))}}}return res}).catch(()=>hit);
    return hit||net}))});
