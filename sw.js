/* Game Night service worker v2 (open-play, Nov 27): the page always comes from the network first, so a new version shows on the next open.
   The phone's copy is only used when the network is slow (3 s) or offline. Icons and the manifest still load from the copy. */
const C='gn-v2';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./icon-180.png','./icon-192.png','./icon-512.png','./manifest.webmanifest']).catch(()=>{})));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const ks=await caches.keys();const had=ks.includes('gn-v1');
  await Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)));await self.clients.claim();
  /* a phone that was on the old helper is still showing its old saved copy: its page already knows this message and shows "New version ready / Reload" */
  if(had){const cl=await self.clients.matchAll({type:'window'});cl.forEach(c=>{try{c.postMessage('gn-updated')}catch(_){}})}})())});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(isPage){e.respondWith(caches.open(C).then(c=>{const net=fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok)c.put('./',res.clone());return res});
      const slow=new Promise(ok=>setTimeout(ok,3000)).then(()=>c.match('./'));
      return Promise.race([net.catch(()=>c.match('./')),slow.then(h=>h||net)]).then(x=>x||net)}));return}
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r);const net=fetch(r).then(res=>{if(res&&res.ok)c.put(r,res.clone());return res}).catch(()=>hit);return hit||net}))});
