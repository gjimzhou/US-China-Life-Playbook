'use strict';
(async()=>{
 const prefix='playbook-offline-v1-',base=new URL(document.querySelector('#offline-choices')?'./':'../',location.href),status=document.getElementById('offline-status');
 const say=text=>{if(status)status.textContent=text},node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 const stable=document.getElementById('interactive-link'),interactiveBase=stable?.href;
 const syncSection=()=>{if(stable)stable.href=interactiveBase+(/^#s-[a-f0-9]{12}$/.test(location.hash)?'&at='+location.hash.slice(1):'')};syncSection();window.addEventListener('hashchange',syncSection);
 if(!('caches' in window)||!('serviceWorker' in navigator)){say('此浏览器不支持离线保存；仍可在线阅读或下载 PDF。');return}
 const meta=new URL('offline-entry.json',base).href;
 async function entries(){const result=[];for(const name of await caches.keys()){if(!name.startsWith(prefix))continue;const cache=await caches.open(name),r=await cache.match(meta);if(r){try{const d=await r.json();if(await cache.match(new URL(d.url,base).href))result.push({...d,cache:name})}catch{}}}return result}
 let saved;
 try{saved=await entries()}catch{say('无法读取离线缓存，浏览器可能限制了存储；仍可在线阅读。');return}
 if(!document.getElementById('offline-choices')){const item=saved.find(d=>new URL(d.url,base).pathname===location.pathname);say(item?'此章有离线副本，保存于 '+new Date(item.savedAt).toLocaleString('zh-CN')+'。离线时显示该副本；联网后可到离线阅读中心更新。':'此章尚未保存为离线副本。');return}
 let catalog=[],busy=false;
 const savedBox=document.getElementById('offline-saved'),choices=document.getElementById('offline-choices');
 async function save(d,b){if(busy)return;busy=true;b.disabled=true;say('正在下载章节与离线阅读组件…');let cacheName,committed=false;
  try{
   await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname});
   await Promise.race([navigator.serviceWorker.ready,new Promise((_,reject)=>setTimeout(()=>reject(Error('Timeout')),10000))]);
   const files=[d.url,'style.css','offline.js','offline.html','favicon.svg'];const responses=[];
   for(const file of files){const url=new URL(file,base).href,r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error();responses.push([url,r])}
   cacheName=prefix+d.contentId+'-'+Date.now();const cache=await caches.open(cacheName);
   for(const [url,r] of responses)await cache.put(url,r);
   await cache.put(meta,new Response(JSON.stringify({...d,savedAt:new Date().toISOString()}),{headers:{'Content-Type':'application/json'}}));
   committed=true;
   // Only retire a previous complete copy after the new copy is fully committed.
   for(const old of saved.filter(x=>x.contentId===d.contentId))await caches.delete(old.cache).catch(()=>{});
   saved=await entries();render();say('章节离线副本已保存。可打开验证；以后请联网手动更新。');
  }catch{if(cacheName&&!committed)await caches.delete(cacheName).catch(()=>{});say('离线保存失败。请检查网络、浏览器权限或空间；已有副本尽量保留。')}finally{busy=false;b.disabled=false}
 }
 function row(d,isSaved){const box=node('section');box.className='offline-row';box.append(node('h3',d.title));if(isSaved){const a=node('a','打开已保存章节');a.href=new URL(d.url,base);box.append(a,node('small','保存时间：'+new Date(d.savedAt).toLocaleString('zh-CN')+' · 正文版本 '+d.revision));const remove=node('button','删除副本');remove.onclick=async()=>{if(busy)return;remove.disabled=true;try{await caches.delete(d.cache);saved=await entries();render();say('已删除此章离线副本。')}catch{say('删除失败，请稍后重试。');remove.disabled=false}};box.append(remove)}
  const current=catalog.find(x=>x.contentId===d.contentId);if(!isSaved||current){const b=node('button',isSaved?'更新副本':'保存离线副本');b.onclick=()=>save(current||d,b);box.append(b);if(isSaved&&current.revision!==d.revision)box.append(node('small','线上正文已修订，可更新副本。'))}return box}
 function render(){savedBox.replaceChildren();if(!saved.length)savedBox.append(node('p','尚未保存章节。'));saved.forEach(d=>savedBox.append(row(d,true)));choices.replaceChildren();const q=document.getElementById('offline-filter').value.trim().toLowerCase();catalog.filter(d=>d.title.toLowerCase().includes(q)&&!saved.some(s=>s.contentId===d.contentId)).forEach(d=>choices.append(row(d,false)))}
 document.getElementById('offline-filter').oninput=render;render();
 try{const r=await fetch(new URL('offline-catalog.json',base),{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error();catalog=await r.json();render();say('已载入线上章节列表；保存后可离线阅读。')}catch{say('线上目录暂时无法载入；已有副本仍可打开。')}
})();
