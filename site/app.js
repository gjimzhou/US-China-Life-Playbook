'use strict';
const $=id=>document.getElementById(id), repo='https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/';
let docs=[], current='HOME.md', lastSearch='';
const route=(path,section='')=>'#'+new URLSearchParams({doc:path,...(section?{section}: {})}).toString();
function plain(s){return s.replace(/\]\([^)]*\)/g,']').replace(/[#*`>\[\]]/g,'').replace(/https?:\/\/\S+/g,'').replace(/\s+/g,' ').trim()}
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e}
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
 return template.content;
}
const topics=[['生存、健康与医疗',1,6],['保险、责任、住房与车辆',7,10],['政府办事、财务与数字安全',11,16],['宠物、父母与家庭',17,21],['工作、家庭与社会关系',22,27],['婚姻、旅行与紧急应对',28,34],['遗产、购房与跨境事务',35,40]];
function directory(){
 const container=$('directory');container.replaceChildren();
 const appendLinks=(group,items)=>{for(const doc of items){const a=el('a',doc.title);a.href=route(doc.path);a.dataset.path=doc.path;group.append(a)}};
 for(const kind of ['正文','清单','参考']){
  const group=el('details');group.open=true;group.append(el('summary',kind));
  if(kind==='正文')for(const [name,start,end] of topics){const topic=el('details');topic.className='topic';topic.append(el('summary',name));appendLinks(topic,docs.filter(d=>d.kind===kind&&Number(d.path.slice(5,7))>=start&&Number(d.path.slice(5,7))<=end));group.append(topic)}
  else appendLinks(group,docs.filter(d=>d.kind===kind));container.append(group);
 }
}
const eventQueries=[
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
 const query=$('search').value.trim().toLowerCase(), priority=$('priority').value,evidence=$('evidence').value;
 const out=$('reading');out.replaceChildren();
 document.querySelectorAll('#directory a').forEach(a=>{const active=a.dataset.path===current;a.classList.toggle('active',active);if(active)a.closest('details').open=true});
 document.querySelector('.intro').hidden=current!=='HOME.md'||Boolean(query||priority||evidence);
 if(query||priority||evidence){
  lastSearch=location.hash;const terms=searchTerms(query),results=[];
  const suggested=eventQueries.filter(e=>query&&e.phrases.some(p=>query.includes(p))).map(e=>docs.find(d=>d.path===e.path)).filter(Boolean);
  if(suggested.length){const box=el('nav',undefined,'event-suggestions');box.setAttribute('aria-label','相关事件入口');box.append(el('p','先看相关事件清单（不受高级筛选限制）'));for(const d of suggested){const a=el('a',d.title);a.href=route(d.path);box.append(a)}out.append(box)}
  let unfiltered=0;
  for(const d of docs)for(const s of d.sections){const hay=(d.title+' '+s.markdown).toLowerCase();const matched=terms.every(group=>group.some(t=>hay.includes(t)));if(matched)unfiltered++;if(matched&&(!(priority||evidence)||s.tags.some(t=>(!priority||t.priorities.includes(priority))&&(!evidence||t.evidence.includes(evidence)))))results.push([d,s])}
  results.sort((a,b)=>{const score=([d,s])=>(query&&s.title.toLowerCase().includes(query)?4:0)+(query&&d.title.toLowerCase().includes(query)?2:0);return score(b)-score(a)});
  $('status').textContent=`全书搜索 · ${results.length} 个匹配段落`;document.title='搜索 · 中美双栖人生指南';
  if(priority||evidence)out.append(el('p',`高级筛选隐藏了 ${unfiltered-results.length} 个关键词匹配段落，可能只是没有相应标注。准备顺序不是紧急程度；法定期限另看正文。`,'hint'));
  if(!results.length)out.append(el('p','没有匹配结果。试试其他关键词，或清除优先级与证据筛选。','empty'));
  for(const [d,s] of results){const card=el('section',undefined,'result');card.append(el('span',d.kind+' · '+d.title,'source'));if(d.readingMode)card.append(el('span','阅读定位：'+d.readingMode,'reading-mode'));const h=el('h2');const a=el('a',s.title==='概览'?d.title:s.title);a.href=route(d.path,s.id);h.append(a);card.append(h);for(const b of [...s.priorities,...s.evidence.map(e=>'证据 '+e)])card.append(el('span',b,'badge'));const text=plain(s.markdown);const at=query?text.toLowerCase().indexOf(query):-1;card.append(el('p',(at>50?'…':'')+text.slice(Math.max(0,at-45),Math.max(0,at-45)+210)+'…'));out.append(card)}return;
 }
 const doc=docs.find(d=>d.path===current);if(!doc){$('status').textContent='未找到章节';out.append(el('p','链接中的章节不存在，请从目录重新选择。','empty'));return}
 $('status').textContent=doc.kind+' · '+doc.title;document.title=doc.title+' · 中美双栖人生指南';
 if(lastSearch){const back=el('a','返回上次搜索','back-search');back.href=lastSearch;out.append(back)}
 const toc=el('nav',undefined,'toc');toc.setAttribute('aria-label','本章目录');for(const s of doc.sections.filter(s=>s.level===2)){const a=el('a',s.title);a.href=route(doc.path,s.id);toc.append(a)}if(toc.children.length)out.append(toc);
 const article=el('article');for(const s of doc.sections){const section=el('section');section.id='section-'+s.id;section.append(safeMarkdown(s.markdown,doc.path));article.append(section)}out.append(article);const a=el('a','查看本章原文与修改记录 ↗','source');a.href=repo+doc.path;out.append(a);
 const section=new URLSearchParams(location.hash.slice(1)).get('section');if(section){const target=doc.sections.find(s=>s.id===section||s.aliases.includes(section));if(target)requestAnimationFrame(()=>$('section-'+target.id)?.scrollIntoView());else{const note=el('p','未找到此段落，已打开对应章节。请使用本章目录选择。','hint');out.prepend(note)}}
}
function navigate(){if(location.hash==='#content'){$('content').focus();return}const params=new URLSearchParams(location.hash.slice(1));current=params.get('doc')||'HOME.md';$('search').value=params.get('q')||'';$('priority').value=params.get('priority')||'';$('evidence').value=params.get('evidence')||'';render();$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');if(!params.get('section'))window.scrollTo(0,0)}
for(const id of ['search','priority','evidence'])$(id).addEventListener('input',syncSearch);
$('reset').onclick=()=>{for(const id of ['search','priority','evidence'])$(id).value='';lastSearch='';syncSearch()};
$('menu').onclick=()=>{$('menu').setAttribute('aria-expanded',String($('sidebar').classList.toggle('open')))};
$('print').onclick=()=>window.print();window.addEventListener('hashchange',navigate);
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('sidebar').classList.add('open');$('menu').setAttribute('aria-expanded','true');$('search').focus()}});
fetch('data.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{docs=data;const all=docs.flatMap(d=>d.sections);$('filter-coverage').textContent=`${all.length} 个段落中，${all.filter(s=>s.tags.length).length} 个有筛选标注。这不是事实审定率。`;directory();navigate()}).catch(()=>{$('status').textContent='正文暂时无法载入';const a=el('a','打开 GitHub 完整目录');a.href='https://github.com/gjimzhou/US-China-Life-Playbook#readme';$('reading').append(a)});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.hash===location.hash&&a.hash.startsWith('#doc=')){e.preventDefault();navigate()}});
