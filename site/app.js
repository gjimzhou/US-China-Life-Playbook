'use strict';
const $=id=>document.getElementById(id), repo='https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/';
let docs=[], current='HOME.md', lastSearch='';
const route=(path,section='')=>'#'+new URLSearchParams({doc:path,...(section?{section}: {})}).toString();
function plain(s){return s.replace(/\]\([^)]*\)/g,']').replace(/[#*`>\[\]]/g,'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim()}
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
// Store reading indexes only. Resolve saved anchors through the same explicit aliases as links.
const bookmarkKey='us-china-playbook.bookmarks.v1';
let bookmarks=[], bookmarkRaw=null, bookmarkStorageAvailable=true;
function bookmarkWarning(message){$('bookmark-notice').hidden=false;$('bookmark-notice').textContent=message}
function readBookmarks(){
 try{
  const raw=localStorage.getItem(bookmarkKey);bookmarkRaw=raw;const data=raw?JSON.parse(raw):{version:1,items:[]};
  if(data.version!==1||!Array.isArray(data.items)||data.items.some(b=>!b||['path','section','title','docTitle'].some(k=>typeof b[k]!=='string'||!b[k].trim())))throw Error('Invalid bookmarks');
  const seen=new Set();bookmarks=data.items.filter(b=>{const key=JSON.stringify([b.path,b.section]);if(seen.has(key))return false;seen.add(key);return true});
 }catch{bookmarkStorageAvailable=false;bookmarkWarning('无法读取本地收藏。浏览器可能限制了存储，或收藏数据已损坏；原有数据未覆盖，仍可正常阅读。')}
}
function resolveBookmark(b){
 const doc=b.contentId?docs.find(d=>d.contentId===b.contentId):docs.find(d=>d.path===b.path||d.previousPaths.includes(b.path));if(!doc)return null;
 const matches=doc.sections.filter(s=>b.sectionId?s.contentId===b.sectionId:(s.id===b.section||s.aliases.includes(b.section)));
 return matches.length===1?{doc,section:matches[0]}:null;
}
function sameBookmark(b,path,id){const resolved=resolveBookmark(b);return resolved?resolved.doc.path===path&&resolved.section.id===id:b.path===path&&b.section===id}
function saveBookmarks(next){
 if(!bookmarkStorageAvailable){bookmarkWarning('本地收藏暂不可用，未保存此次操作；正文阅读不受影响。');return false}
 try{if(localStorage.getItem(bookmarkKey)!==bookmarkRaw){readBookmarks();bookmarkWarning('收藏数据已变化，请检查列表后重试；此次操作未覆盖原数据。');return false}next=next.map(b=>{const r=resolveBookmark(b);return r?{...b,contentId:r.doc.contentId,sectionId:r.section.contentId}:b});const raw=JSON.stringify({version:1,items:next});localStorage.setItem(bookmarkKey,raw);bookmarkRaw=raw;bookmarks=next;return true}
 catch{bookmarkWarning('收藏未能保存，原列表保持不变。请检查浏览器存储设置或空间；正文仍可正常阅读。');return false}
}
function updateBookmarkButtons(){
 for(const button of document.querySelectorAll('button[data-bookmark-section]')){
  const saved=bookmarks.some(b=>sameBookmark(b,button.dataset.bookmarkPath,button.dataset.bookmarkSection));
  button.textContent=saved?'已收藏 · 取消':'收藏';button.setAttribute('aria-pressed',String(saved));
  button.setAttribute('aria-label',(saved?'取消收藏：':'收藏：')+button.dataset.bookmarkTitle);
 }
}
function bookmarkButton(doc,section){
 const button=el('button',undefined,'bookmark-button');button.type='button';
 button.dataset.bookmarkPath=doc.path;button.dataset.bookmarkSection=section.id;button.dataset.bookmarkTitle=section.title==='概览'?doc.title:section.title;
 button.onclick=()=>{
  const saved=bookmarks.some(b=>sameBookmark(b,doc.path,section.id));Reader.event(saved?'bookmark_remove_click':'bookmark_click',doc,section);
  const next=saved?bookmarks.filter(b=>!sameBookmark(b,doc.path,section.id)):[...bookmarks,{path:doc.path,section:section.id,contentId:doc.contentId,sectionId:section.contentId,title:button.dataset.bookmarkTitle,docTitle:doc.title,savedAt:new Date().toISOString()}];
  if(saveBookmarks(next)){updateBookmarkButtons();$('bookmark-message').textContent=saved?'已取消收藏':'已收藏，可从“我的收藏”回访'}
 };return button;
}
function renderBookmarks(out){
 $('status').textContent='我的收藏 · '+bookmarks.length+' 条';document.title='我的收藏 · 中美双栖人生指南';
 out.append(el('h1','我的收藏'),el('p','收藏仅保存在当前浏览器，不会上传或跨设备同步。清理浏览器数据后可能丢失；这里仅保存章节和小节索引。','hint'));
 if(!bookmarks.length)out.append(el('p','还没有收藏。在正文小节或搜索结果旁点击“收藏”，即可从这里回访。','empty'));
 for(const b of bookmarks){
  const row=el('section',undefined,'saved-item');const resolved=resolveBookmark(b);
  row.append(el('p',b.docTitle,'source'));const h=el('h2');
  if(resolved){const a=el('a',resolved.section.title==='概览'?resolved.doc.title:resolved.section.title);a.href=route(resolved.doc.path,resolved.section.id);h.append(a)}
  else{h.textContent=b.title;row.append(el('p','此收藏暂时无法定位：原章节或小节已删除或变更。请在目录中查找；不会自动跳到其他内容。','hint'))}
  row.append(h);ReadingTools.revision(b,row);
  if(!resolved)row.append(el('p',b.path+' #'+b.section,'saved-location'));
  const remove=el('button','取消收藏');remove.type='button';remove.setAttribute('aria-label','取消收藏：'+b.title);
  remove.onclick=()=>{const index=bookmarks.indexOf(b);if(saveBookmarks(bookmarks.filter(item=>item!==b))){render();const buttons=out.querySelectorAll('.saved-item button');(buttons[Math.min(index,buttons.length-1)]||$('content')).focus();$('bookmark-message').textContent='已取消收藏'}};
  row.append(remove);out.append(row);
 }
}
function getBookmarks(){return bookmarks}
readBookmarks();
window.addEventListener('storage',event=>{if(event.key===bookmarkKey||event.key===null){bookmarkStorageAvailable=true;readBookmarks();if(new URLSearchParams(location.hash.slice(1)).get('view')==='bookmarks')render();else updateBookmarkButtons()}});
function safeMarkdown(text,path){
 const template=document.createElement('template');template.innerHTML=marked.parse(text);
 const allowed=new Set('P H1 H2 H3 H4 H5 H6 UL OL LI BLOCKQUOTE TABLE THEAD TBODY TR TH TD EM STRONG DEL CODE PRE HR BR A INPUT'.split(' '));
 for(const node of [...template.content.querySelectorAll('*')]){
  if(!allowed.has(node.tagName)){node.replaceWith(document.createTextNode(node.textContent));continue}
  const start=node.getAttribute('start');const href=node.getAttribute('href');const checked=node.hasAttribute('checked');
  for(const attr of [...node.attributes])node.removeAttribute(attr.name);
  if(node.tagName==='OL'&&/^[0-9]+$/.test(start||''))node.setAttribute('start',start);
  if(node.tagName==='INPUT'){node.type='checkbox';node.disabled=true;node.checked=checked;node.setAttribute('aria-label',checked?'已完成':'待完成')}
  if(node.tagName==='A'&&href){
   try{const url=new URL(href,new URL(path,location.href.split('#')[0]));
    if(!['https:','http:','mailto:'].includes(url.protocol)){node.replaceWith(document.createTextNode(node.textContent));continue}
    if(!/^[a-z]+:|^\/\//i.test(href)&&!href.startsWith('#')){
     const base=new URL('.',location.href);const relative=decodeURIComponent(url.pathname.slice(base.pathname.length));
     if(relative.startsWith('downloads/')){node.href=relative+url.hash;node.setAttribute('download','')}
     else node.href=docs.some(d=>d.path===relative)?route(relative,decodeURIComponent(url.hash.slice(1))):repo+relative+url.hash;
    }else if(href.startsWith('#')){node.href=route(path,decodeURIComponent(href.slice(1)));}
    else{node.href=url.href;node.rel='noopener noreferrer';if(['http:','https:'].includes(url.protocol)){node.target='_blank';node.classList.add('external')}}
   }catch{node.removeAttribute('href')}
  }
 }
 const modes={'指南解读':'guidance','决策框架':'decision','管理建议':'practice','经验建议':'practice','专业咨询准备':'consultation','规则说明':'rule'};
 for(const note of template.content.querySelectorAll('blockquote')){const mode=note.querySelector('strong')?.textContent.trim().match(/^内容性质：(.+?)[。；]?$/)?.[1];if(mode){note.classList.add('content-nature','nature-'+(modes[mode]||'mixed'));note.setAttribute('role','note');note.setAttribute('aria-label','内容性质：'+mode)}}
 for(const input of template.content.querySelectorAll('input[type="checkbox"]'))input.closest('li')?.classList.add('task-item');
 const referenceLabel=/(入口|办理|核验|查询|工具|求助|报案|投诉|参考|继续看|官方|去办|查资格|查风险|查州|找专业|找本地|外部|第一站|一键|直接|培训|学习|规则说明)/;
 for(const p of template.content.querySelectorAll('p')){
  const first=p.firstElementChild;
  if(first?.tagName==='STRONG'&&referenceLabel.test(first.textContent.trim()))p.classList.add('reference-links');
  if(first?.tagName==='STRONG'&&/^本项目实务建议[：:]?$/.test(first.textContent.trim())){p.classList.add('practice-advice');p.setAttribute('role','note');p.setAttribute('aria-label','经验建议，可按情境调整')}
 }
 for(const table of template.content.querySelectorAll('table')){
  if((table.rows[0]?.cells.length||0)<4)continue;
  const wrapper=el('div',undefined,'wide-table-scroll');wrapper.tabIndex=0;wrapper.setAttribute('role','region');wrapper.setAttribute('aria-label','宽表格，可左右滚动查看');
  const hint=el('p','表格较宽，可左右滑动；使用键盘时先选中表格，再按左右方向键。','wide-table-hint');
  table.before(hint,wrapper);wrapper.append(table);
 }
 return template.content;
}
const topics=[['生存、健康与医疗',1,6],['保险、责任、住房与车辆',7,10],['政府办事、财务与数字安全',11,16],['宠物、父母与家庭',17,21],['工作、家庭与社会关系',22,27],['婚姻、旅行与紧急应对',28,34],['遗产、购房与跨境事务',35,40]];
function directory(){
 const container=$('directory');container.replaceChildren();
 const appendLinks=(group,items)=>{for(const doc of items){const a=el('a',doc.title);a.href=route(doc.path);a.dataset.path=doc.path;group.append(a)}};
 for(const kind of ['正文','清单','参考']){
  const group=el('details');group.open=true;group.append(el('summary',kind));
  if(kind==='正文')for(const [name,start,end] of topics){const topic=el('details');topic.className='topic';topic.append(el('summary',name));appendLinks(topic,docs.filter(d=>d.kind===kind&&Number(d.path.slice(5,7))>=start&&Number(d.path.slice(5,7))<=end));group.append(topic)}
  else if(kind==='清单'){
   const categories=[['日常准备与资料',['first-30-days','annual-review','emergency-sheet','life-events-index']],['医疗与照护',['medical-access-blocked','mental-health-care','pregnancy-birth-loss','hospital-discharge-major-diagnosis','medication-access-problem','parents-emergency','care-needs-change']],['住房、工作与身份',['move-checklist','home-purchase','rental-lifecycle','job-loss','workplace-rights','workplace-injury-leave','identity-change','immigration-notice-rfe','jury-court-summons']],['家庭与宠物',['marriage-checklist','separation-family-safety','adult-child-transition','school-support','death-administration','pet-loss','lost-pet']],['旅行、跨境与突发事件',['international-travel','travel-disruption','long-term-relocation','cross-border-problem','cyber-incident','lost-wallet-documents','vehicle-roadside-ticket-tow','crime-victim','disaster-utility-outage','retirement-transition']]];
   const assigned=new Set();for(const [name,slugs] of categories){const items=docs.filter(d=>d.kind===kind&&slugs.some(s=>d.path==='checklists/'+s+'.md'));items.forEach(d=>assigned.add(d.path));if(items.length){const topic=el('details');topic.className='topic';topic.append(el('summary',name));appendLinks(topic,items);group.append(topic)}}
   const remaining=docs.filter(d=>d.kind===kind&&!assigned.has(d.path));if(remaining.length){const topic=el('details');topic.append(el('summary','其他场景'));appendLinks(topic,remaining);group.append(topic)}
  }else appendLinks(group,docs.filter(d=>d.kind===kind));container.append(group);
 }
}
const eventQueries=[
 {phrases:['父母住院','父母在中国突然住院','父亲住院','母亲住院','爸爸住院','妈妈住院'],path:'checklists/parents-emergency.md',section:'今天住院时如何分工'},
 {phrases:['医疗保险拒赔','医保拒赔','健康保险拒赔'],path:'book/04-美国医疗系统怎么用.md',section:'6-拒赔后先弄清原因再走书面程序',label:'医疗保险拒赔：原因、申诉与期限'},
 {phrases:['保险拒赔'],exact:true,path:'book/04-美国医疗系统怎么用.md',section:'6-拒赔后先弄清原因再走书面程序',label:'如果是医疗保险：拒赔申诉与期限'},
 {phrases:['保险拒赔'],exact:true,path:'book/07-保险与灾难风险.md',section:'15-出险后先安全与减损',label:'其他保险：核对保单、理赔与争议渠道'},
 {phrases:['约不到医生','没有医生接诊','牙医约不到'],path:'checklists/medical-access-blocked.md'},
 {phrases:['账单付不起','付不起医药费','收到催收'],path:'checklists/bill-payment-difficulty.md'},
 {phrases:['银行账户冻结','银行卡被冻结','银行关户'],path:'checklists/bank-account-restriction.md'},
 {phrases:['航班取消','行李没到','飞机延误'],path:'checklists/travel-disruption.md'},
 {phrases:['宠物死了','狗死了','猫死了','宠物去世'],path:'checklists/pet-loss.md'},
 {phrases:['狗丢了','猫丢了','宠物走失'],path:'checklists/lost-pet.md'},
 {phrases:['钱包丢了','工卡丢了','护照丢了'],path:'checklists/lost-wallet-documents.md'},
 {phrases:['药没了','药拿不到','药店没药'],path:'checklists/medication-access-problem.md'},
 {phrases:['学校不给评估','学校评估','孩子转学'],path:'checklists/school-support.md'},
 {phrases:['刚出院','医院出院'],path:'checklists/hospital-discharge-major-diagnosis.md'},
 {phrases:['车被拖了','车不见了','车抛锚'],path:'checklists/vehicle-roadside-ticket-tow.md'},
 {phrases:['被裁员','失业了'],path:'checklists/job-loss.md'}
];
const aliases=[['医保','医疗保险','health insurance','health plan'],['信用冻结','credit freeze'],['遗嘱','will'],['家庭雇员','保姆','nanny','household employee'],['附加证明书','apostille'],['失业','裁员','layoff','job loss'],['搬家','迁居','move'],['保险理赔说明','eob','explanation of benefits'],['网络内','in-network','in network'],['预缴税','预估税','estimated tax'],['通行密钥','passkey']];
function searchTerms(query){const exact=aliases.find(g=>g.includes(query));return exact?[exact]:query.split(/\s+/).filter(Boolean).map(t=>aliases.find(g=>g.includes(t))||[t])}
function syncSearch(){
 const params=new URLSearchParams({doc:current});
 for(const [id,key] of [['search','q'],['priority','priority'],['evidence','evidence']])if($(id).value.trim())params.set(key,$(id).value.trim());
 history.replaceState(null,'','#'+params);render();
}
function render(){
 Reader.beforeRender();
 const query=$('search').value.trim().toLowerCase(), priority=$('priority').value,evidence=$('evidence').value;
 const out=$('reading');out.replaceChildren();
 document.querySelectorAll('#directory a').forEach(a=>{const active=a.dataset.path===current;a.classList.toggle('active',active);if(active){let parent=a.parentElement;while(parent&&parent!==$('directory')){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement}}});
 const view=new URLSearchParams(location.hash.slice(1)).get('view');const savedView=view==='bookmarks';
 if(['tools','paths'].includes(view)){document.querySelector('.intro').hidden=true;$('status').textContent=view==='tools'?'阅读工具':'场景阅读路线';document.title=$('status').textContent+' · 中美双栖人生指南';ReadingTools[view](out);return}
 if(['updates','privacy'].includes(view)){document.querySelector('.intro').hidden=true;$('status').textContent=view==='updates'?'订阅更新':'隐私与阅读数据';document.title=$('status').textContent+' · 中美双栖人生指南';Reader[view](out);return}
 document.querySelector('.intro').hidden=savedView||current!=='HOME.md'||Boolean(query||priority||evidence);
 if(savedView){Reader.trackView('bookmarks');renderBookmarks(out);return}
 if(query||priority||evidence){
  Reader.trackView('search');lastSearch=location.hash;const terms=searchTerms(query),results=[];
  const suggested=eventQueries.filter(e=>query&&e.phrases.some(p=>e.exact?query===p:query.includes(p))).filter(e=>docs.some(d=>d.path===e.path&&(!e.section||d.sections.some(s=>s.id===e.section))));
  if(suggested.length){const box=el('nav',undefined,'event-suggestions');box.setAttribute('aria-label','相关事件入口');box.append(el('p','先看相关处理入口（不受高级筛选限制）'));for(const e of suggested){const d=docs.find(d=>d.path===e.path);const a=el('a',e.label||d.title);a.href=route(e.path,e.section);box.append(a)}out.append(box)}
  let unfiltered=0;
  for(const d of docs)for(const s of d.sections){const hay=(d.title+' '+s.markdown).toLowerCase();const matched=terms.every(group=>group.some(t=>hay.includes(t)));if(matched)unfiltered++;if(matched&&(!(priority||evidence)||s.tags.some(t=>(!priority||t.priorities.includes(priority))&&(!evidence||t.evidence.includes(evidence)))))results.push([d,s])}
  results.sort((a,b)=>{const score=([d,s])=>(query&&s.title.toLowerCase().includes(query)?4:0)+(query&&d.title.toLowerCase().includes(query)?2:0);return score(b)-score(a)});
  $('status').textContent=`全书搜索 · ${suggested.length} 个相关入口 · ${results.length} 个匹配段落`;document.title='搜索 · 中美双栖人生指南';
  if(priority||evidence)out.append(el('p',`高级筛选隐藏了 ${unfiltered-results.length} 个关键词匹配段落，可能只是没有相应标注。准备顺序不是紧急程度；法定期限另看正文。`,'hint'));
  if(!results.length)out.append(el('p',suggested.length?'可从上方相关入口继续阅读；下方暂无符合当前关键词和筛选条件的段落。':'没有匹配结果。试试其他关键词，或清除优先级与证据筛选。',suggested.length?'hint':'empty'));
  for(const [d,s] of results){const card=el('section',undefined,'result');card.append(el('span',d.kind+' · '+d.title,'source'));if(d.readingMode)card.append(el('span','阅读定位：'+d.readingMode,'reading-mode'));const h=el('h2');const a=el('a',s.title==='概览'?d.title:s.title);a.href=route(d.path,s.id);h.append(a);card.append(h);for(const b of [...s.priorities,...s.evidence.map(e=>'证据 '+e)])card.append(el('span',b,'badge'));const text=plain(s.markdown);const at=query?text.toLowerCase().indexOf(query):-1;card.append(el('p',(at>50?'…':'')+text.slice(Math.max(0,at-45),Math.max(0,at-45)+210)+'…'));card.append(bookmarkButton(d,s));out.append(card)}updateBookmarkButtons();return;
 }
 const doc=docs.find(d=>d.path===current);if(!doc){$('status').textContent='未找到章节';out.append(el('p','链接中的章节不存在，请从目录重新选择。','empty'));return}
 $('status').textContent=doc.kind+' · '+doc.title;document.title=doc.title+' · 中美双栖人生指南';
 if(lastSearch){const back=el('a','返回上次搜索','back-search');back.href=lastSearch;out.append(back)}
 const toc=el('nav',undefined,'toc');toc.setAttribute('aria-label','本章目录');for(const s of doc.sections.filter(s=>s.level===2)){const a=el('a',s.title);a.href=route(doc.path,s.id);toc.append(a)}if(toc.children.length)out.append(toc);
 const article=el('article');for(const s of doc.sections){const section=el('section');section.id='section-'+s.id;section.append(safeMarkdown(s.markdown,doc.path));ReadingTools.bindTasks(doc,s,section);ReadingTools.share(doc,s,section);const heading=section.querySelector('h1,h2,h3,h4,h5,h6');const save=bookmarkButton(doc,s);if(heading)heading.after(save);else section.prepend(save);article.append(section)}out.append(article);ReadingTools.mount(doc,out);updateBookmarkButtons();const a=el('a','查看本章原文与修改记录 ↗','source');a.href=repo+doc.path;out.append(a);
 const section=new URLSearchParams(location.hash.slice(1)).get('section');Reader.mount(doc,out,doc.sections.find(s=>s.id===section||s.aliases.includes(section)));if(section){const target=doc.sections.find(s=>s.id===section||s.aliases.includes(section));if(target)requestAnimationFrame(()=>$('section-'+target.id)?.scrollIntoView());else{const note=el('p','未找到此段落，已打开对应章节。请使用本章目录选择。','hint');out.prepend(note)}}
}
function navigate(){if(location.hash==='#content'){$('content').focus();return}const params=new URLSearchParams(location.hash.slice(1));const stable=params.get('content');const d=stable?docs.find(d=>d.contentId===stable):docs.find(d=>d.path===params.get('doc')||d.previousPaths.includes(params.get('doc')));current=d?.path||(stable?'__missing__':params.get('doc')||'HOME.md');if(stable&&d){params.set('doc',d.path);const at=params.get('at');if(at){const target=d.sections.find(s=>s.contentId===at);params.set('section',target?.id||'__missing__')}history.replaceState(null,'','#'+params)}$('search').value=params.get('q')||'';$('priority').value=params.get('priority')||'';$('evidence').value=params.get('evidence')||'';render();$('sidebar').classList.remove('open');$('search-menu').setAttribute('aria-expanded','false');$('menu').setAttribute('aria-expanded','false');if(!params.get('section'))window.scrollTo(0,0)}
for(const id of ['search','priority','evidence'])$(id).addEventListener('input',syncSearch);
$('reset').onclick=()=>{for(const id of ['search','priority','evidence'])$(id).value='';lastSearch='';syncSearch()};
$('menu').onclick=()=>ReadingTools.directory();
$('search-menu').onclick=()=>{$('sidebar').classList.add('open');$('search-menu').setAttribute('aria-expanded','true');$('sidebar').scrollIntoView({block:'start'});$('search').focus({preventScroll:true})};
$('print').onclick=()=>window.print();window.addEventListener('hashchange',navigate);
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('sidebar').classList.add('open');$('menu').setAttribute('aria-expanded','true');$('search').focus()}});
fetch('data.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(async data=>{docs=data;await Reader.init(docs);await ReadingTools.init(docs);const all=docs.flatMap(d=>d.sections);$('filter-coverage').textContent=`${all.length} 个段落中，${all.filter(s=>s.tags.length).length} 个有筛选标注。这不是事实审定率。`;directory();navigate()}).catch(()=>{$('status').textContent='正文暂时无法载入';const a=el('a','打开 GitHub 完整目录');a.href='https://github.com/gjimzhou/US-China-Life-Playbook#readme';$('reading').append(a)});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a?.classList.contains('skip')){e.preventDefault();$('content').focus();return}if(a&&a.hash===location.hash&&a.hash.startsWith('#doc=')){e.preventDefault();navigate()}});
