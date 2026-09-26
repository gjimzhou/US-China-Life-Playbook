'use strict';
window.ReadingTools=(()=>{
 const key='us-china-playbook.tools.v1', bookmarkKey='us-china-playbook.bookmarks.v1', progressKey='us-china-playbook.progress.v1';
 let activeDoc=null;
 let docs=[],raw=null,state={version:1,tasks:{},font:16,line:1.95},available=true,paths=[],updates=[];
 const n=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e};
 const button=(text,fn)=>{const b=n('button',text);b.type='button';b.onclick=fn;return b};
 const link=(text,url)=>{const a=n('a',text);a.href=url;return a};
 const hint=text=>{const p=n('p',text);p.className='hint';return p};
 function message(text){const p=document.getElementById('reader-message');p.hidden=false;p.textContent=text}
 function valid(s){return s?.version===1&&s.tasks&&Object.getPrototypeOf(s.tasks)===Object.prototype&&Object.entries(s.tasks).every(([k,v])=>/^t-[a-f0-9]{12}$/.test(k)&&typeof v==='boolean')&&[16,18,20,22].includes(s.font)&&[1.7,1.95,2.2].includes(s.line)}
 function read(){try{raw=localStorage.getItem(key);const s=raw?JSON.parse(raw):{version:1,tasks:{},font:16,line:1.95};if(!valid(s))throw Error();state=s;available=true}catch{available=false;message((document.getElementById('reader-message').hidden?'':document.getElementById('reader-message').textContent+' ')+ '无法读取清单或阅读设置，原数据未覆盖。正文仍可阅读。')}}
 function write(s){if(!available){message('本地存储不可用，未保存此次操作。');return false}try{if(localStorage.getItem(key)!==raw){read();message('其他页面已更改数据，请刷新后重试；未覆盖原数据。');return false}const next=JSON.stringify(s);localStorage.setItem(key,next);raw=next;state=s;return true}catch{message('保存失败，原数据未更改。请检查浏览器存储权限或可用空间。');return false}}
 function applySettings(){document.documentElement.style.setProperty('--reader-size',state.font+'px');document.documentElement.style.setProperty('--reader-line',state.line)}
 function bindTasks(doc,s,section){
  const inputs=[...section.querySelectorAll('input[type=checkbox]')];if(!s.taskIds?.length)return;
  if(inputs.length!==s.taskIds.length){message('此小节清单暂不能保存，仍可阅读。');return}
  inputs.forEach((input,i)=>{const id=s.taskIds[i];input.disabled=!available;input.checked=state.tasks[id]===true;input.dataset.taskId=id;input.id='task-'+id;const label=n('label');label.htmlFor=input.id;const parent=input.parentNode;for(const sibling of [...parent.childNodes])if(sibling!==input&&!(sibling.nodeType===1&&['UL','OL'].includes(sibling.tagName)))label.append(sibling);input.after(label);input.setAttribute('aria-label',input.closest('li').textContent.trim());input.onchange=()=>{const checked=input.checked;if(!write({...state,tasks:{...state.tasks,[id]:checked}})){input.checked=!checked;return}updateTaskCount(doc);message(checked?'已在本浏览器标记完成。':'已取消完成标记。')}});
 }
 function updateTaskCount(doc){const ids=doc.sections.flatMap(s=>s.taskIds||[]),done=ids.filter(id=>state.tasks[id]).length;const p=document.getElementById('task-count');if(p)p.textContent=`已勾选 ${done} / ${ids.length} 项 · 尚未勾选 ${ids.length-done} 项。只处理适用事项，勾选不代表资格或安全认证。`}
 function share(doc,s,section){
  const box=n('details');box.className='section-actions';box.append(n('summary','分享 / 引用 / 报错'));
  const url=new URL('read/'+doc.contentId+'.html',location.href.split('#')[0]);url.hash=s.contentId;
  const status=n('p');status.setAttribute('role','status');
  const field=n('input');field.readOnly=true;field.value=url.href;field.setAttribute('aria-label','本小节分享地址');
  box.append(field,button('复制小节链接',async()=>{try{await navigator.clipboard.writeText(url.href);status.textContent='小节链接已复制。'}catch{field.focus();field.select();status.textContent='无法自动复制，请手动复制已选中的地址。'}}));
  const citation=n('textarea');citation.readOnly=true;citation.rows=3;citation.setAttribute('aria-label','本小节引用信息');
  citation.value=`Junliang Zhou 及项目贡献者：《中美双栖人生指南·${doc.title}》，${s.title}。${url.href}（访问日期：${new Date().toLocaleDateString('sv-SE')}；访问日期不代表事实核验日期。）`;
  box.append(citation,button('复制引用',async()=>{try{await navigator.clipboard.writeText(citation.value);status.textContent='引用信息已复制。'}catch{citation.focus();citation.select();status.textContent='无法自动复制，请手动复制已选中的引用信息。'}}));
  if(navigator.share)box.append(button('系统分享',async()=>{try{await navigator.share({title:doc.title+' · '+s.title,url:url.href});status.textContent='已交给系统分享。'}catch(e){status.textContent=e.name==='AbortError'?'已取消分享。':'系统分享不可用，请复制链接。'}}));
  const label=n('label','问题类型 '),select=n('select');for(const text of ['规则可能过时','链接失效','表述不清','其他问题']){const o=n('option',text);select.append(o)}label.append(select);
  const report=link('在 GitHub 提交本节问题 ↗','');report.target='_blank';report.rel='noopener noreferrer';
  const change=()=>{report.href='https://github.com/gjimzhou/US-China-Life-Playbook/issues/new?'+new URLSearchParams({title:'['+select.value+'] '+doc.title,body:'问题类型：'+select.value+'\n章节：'+doc.title+'\n小节：'+s.title+'\n稳定位置：'+url.href+'\n\n具体问题：\n\n支持修订的公开来源：\n\n请勿填写个人证件、病历或账户信息。'})};select.onchange=change;change();
  box.append(label,report,hint('提交问题需要 GitHub 账号；这里只打开填写页面，不会自动发送。请勿公开私人资料。'),status);section.append(box);
 }
 function mount(doc,out){activeDoc=doc;
  const ids=doc.sections.flatMap(s=>s.taskIds||[]);
  if(ids.length){const box=n('div');box.className='reader-tools';const p=n('p');p.id='task-count';box.append(p,hint('仅保存在当前浏览器，可在“阅读工具”备份。清除网站数据可能丢失。'),button('重置本页勾选',()=>{if(!confirm('取消本页所有勾选？其他页面保持不变。'))return;const tasks={...state.tasks};ids.forEach(id=>delete tasks[id]);if(write({...state,tasks})){out.querySelectorAll('[data-task-id]').forEach(i=>i.checked=false);updateTaskCount(doc);message('已重置本页勾选。')}}));out.querySelector('article').before(box);updateTaskCount(doc)}
  const row=n('div');row.className='reader-tools';row.append(link('阅读设置 / 备份 / 离线阅读','#view=tools'),document.createTextNode(' · '),link('独立章节页',new URL('read/'+doc.contentId+'.html',location.href.split('#')[0]).href));out.querySelector('article').before(row);
  if(doc.path==='HOME.md'){const a=link('按我的处境选择阅读路线','#view=paths');a.className='home-path-entry';out.prepend(a)}
 }
 function directory(){
  const menu=document.getElementById('menu'),toc=document.querySelector('#reading .toc');
  const full=()=>{document.getElementById('sidebar').classList.add('open');menu.setAttribute('aria-expanded','true');menu.setAttribute('aria-controls','sidebar');document.getElementById('sidebar').scrollIntoView({block:'start'});document.getElementById('search').focus({preventScroll:true})};
  if(!toc||!window.HTMLDialogElement){full();return}
  document.getElementById('chapter-dialog')?.remove();const dialog=n('dialog');dialog.id='chapter-dialog';dialog.setAttribute('aria-labelledby','chapter-dialog-title');const title=n('h2','本章目录');title.id='chapter-dialog-title';dialog.append(title);
  const top=scrollY;let restore=true,fullSelected=false;
  dialog.append(button('返回阅读位置',()=>dialog.close()),button('全书目录与筛选',()=>{fullSelected=true;restore=false;dialog.close();full()}));
  const list=n('ul');for(const a of toc.querySelectorAll('a')){const li=n('li'),copy=link(a.textContent,a.href);copy.onclick=()=>{restore=false;dialog.close()};li.append(copy);list.append(li)}dialog.append(list);
  dialog.addEventListener('close',()=>{if(!fullSelected)menu.setAttribute('aria-expanded','false');if(restore)window.scrollTo(0,top)});document.body.append(dialog);menu.setAttribute('aria-controls','chapter-dialog');menu.setAttribute('aria-expanded','true');dialog.showModal();
 }
 function revision(b,row){if(!b.savedAt)return;const es=updates.filter(e=>(e.contentId===b.contentId||e.affectedContentIds?.includes(b.contentId))&&Date.parse(e.published)>Date.parse(b.savedAt));if(es.length){const box=n('details');box.append(n('summary','收藏后有重要更新（'+es.length+'）'));es.forEach(e=>box.append(link(e.title,e.url),hint(e.summary)));row.append(box)}}
 function readingPaths(out){Reader.trackView('paths');out.append(n('h1','按处境选择阅读路线'),hint('无需填写身份或家庭资料。这些是阅读建议，按实际需要选择；紧急危险时先联系所在地应急服务。'));
  if(!paths.length){out.append(hint('路线暂未载入，可从目录或生活事件索引继续阅读。'));return}
  for(const path of paths){const card=n('section');card.className='saved-item';card.append(n('h2',path.title),n('p',path.summary));const ol=n('ol');for(const id of path.contentIds){const d=docs.find(d=>d.contentId===id);if(d){const li=n('li');li.append(link(d.title,Reader.stableRoute(d)));ol.append(li)}}card.append(ol);out.append(card)}
 }
 function validBookmarks(x){return x?.version===1&&Array.isArray(x.items)&&x.items.length<=10000&&x.items.every(b=>b&&['path','section','title','docTitle'].every(k=>typeof b[k]==='string'&&b[k].length>0&&b[k].length<2000)&&['contentId','sectionId','savedAt'].every(k=>b[k]===undefined||typeof b[k]==='string'))}
 function validProgress(x){return x===null||(x?.version===1&&['contentId','sectionId','title','updatedAt'].every(k=>typeof x[k]==='string'&&x[k])&&Number.isFinite(Date.parse(x.updatedAt)))}
 function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=link('',url);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
 function tools(out){Reader.trackView('tools');out.append(n('h1','阅读工具'),hint('收藏、清单与阅读进度仅在本浏览器保存，不会上传。备份文件包含你的阅读记录，请自行妥善保管。'));
  const settings=n('section');settings.append(n('h2','阅读设置'));
  for(const [prop,title,values] of [['font','正文字号',[16,18,20,22]],['line','正文行距',[1.7,1.95,2.2]]]){const label=n('label',title+' '),select=n('select');select.setAttribute('aria-label',title);for(const v of values){const o=n('option',String(v)+(prop==='font'?' px':''));o.value=v;o.selected=state[prop]===v;select.append(o)}select.onchange=()=>{if(write({...state,[prop]:Number(select.value)})){applySettings();message('阅读设置已保存。')}else select.value=state[prop]};label.append(select);settings.append(label)}out.append(settings);
  out.append(n('h2','备份与恢复'),button('导出阅读备份',()=>{try{const bookmarks=JSON.parse(localStorage.getItem(bookmarkKey)||'{"version":1,"items":[]}'),progress=JSON.parse(localStorage.getItem(progressKey)||'null'),tools=JSON.parse(localStorage.getItem(key)||JSON.stringify(state));if(!validBookmarks(bookmarks)||!validProgress(progress)||!valid(tools))throw Error();download(JSON.stringify({format:'playbook-reader-backup',version:1,exportedAt:new Date().toISOString(),bookmarks,progress,tools},null,2),'playbook-reading-backup-'+new Date().toISOString().slice(0,10)+'.json');message('已生成备份并交给浏览器下载，请确认文件已保存。')}catch{message('无法读取或校验本地数据，未生成不完整备份；原数据保持不变。')}}));
  const input=n('input');input.type='file';input.accept='.json,application/json';input.id='backup-file';const label=n('label','选择备份文件（最大 2 MB）');label.htmlFor=input.id;const preview=n('div');preview.setAttribute('aria-live','polite');out.append(label,input,preview);
  input.onchange=async()=>{preview.replaceChildren();try{const f=input.files[0];if(!f)return;if(f.size>2*1024*1024)throw Error();const b=JSON.parse(await f.text());if(b.format!=='playbook-reader-backup'||b.version!==1||!validBookmarks(b.bookmarks)||!validProgress(b.progress)||!valid(b.tools))throw Error();preview.append(n('p',`可恢复：${b.bookmarks.items.length} 条收藏、${Object.values(b.tools.tasks).filter(Boolean).length} 项勾选、${b.progress?'1':'0'} 个阅读位置。`),hint('按类别恢复，互不影响。收藏合并且去重；勾选合并（任一为完成则保留完成）；阅读位置和设置经确认后替换。无法定位的旧内容保留记录并提示。'));
   preview.append(button('合并收藏',()=>{const bs=getBookmarks();const next=[...bs];for(const item of b.bookmarks.items){const r=resolveBookmark(item);if(!next.some(x=>r?sameBookmark(x,r.doc.path,r.section.id):(x.contentId||x.path)===(item.contentId||item.path)&&(x.sectionId||x.section)===(item.sectionId||item.section)))next.push(item)}if(saveBookmarks(next)){message('收藏已合并。');preview.append(hint('收藏恢复成功。'))}}),button('合并清单勾选',()=>{const tasks={...state.tasks};for(const [id,value] of Object.entries(b.tools.tasks))tasks[id]=Boolean(tasks[id]||value);if(write({...state,tasks})){const known=new Set(docs.flatMap(d=>d.sections.flatMap(s=>s.taskIds||[])));const missing=Object.keys(tasks).filter(id=>!known.has(id)).length;message('清单勾选已合并。'+(missing?`${missing} 项已移除或变更的任务记录保留在备份中，不计入当前清单。`:''))}}),button('恢复阅读位置',()=>{if(confirm('用备份中的阅读位置替换当前位置？'))Reader.restoreProgress(b.progress)}),button('恢复阅读设置',()=>{if(confirm('用备份中的字号和行距替换当前设置？')&&write({...state,font:b.tools.font,line:b.tools.line})){applySettings();message('阅读设置已恢复。')}}));
  }catch{preview.append(hint('文件格式无效、版本不支持或文件过大。没有更改任何本地数据。'))}};
  out.append(n('h2','离线阅读'),hint('选择章节保存静态副本；离线副本没有互动功能。需要联网更新后才能看到修订。浏览器可能自动清理缓存，重要资料另存 PDF。'),link('打开离线阅读中心','offline.html'));
 }
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null){read();applySettings();document.querySelectorAll('[data-task-id]').forEach(i=>{i.checked=state.tasks[i.dataset.taskId]===true;i.disabled=!available});if(activeDoc)updateTaskCount(activeDoc)}});
 return{directory,bindTasks,share,mount,revision,tools,paths:readingPaths,async init(ds){docs=ds;read();applySettings();await Promise.all([fetch('reading-paths.json',{signal:AbortSignal.timeout(3000)}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(x=>paths=x).catch(()=>{}),fetch('updates.json',{signal:AbortSignal.timeout(3000)}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(x=>updates=x).catch(()=>{})])}};
})();
