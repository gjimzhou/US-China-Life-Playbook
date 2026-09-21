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
     node.href=docs.some(d=>d.path===relative)?route(relative,decodeURIComponent(url.hash.slice(1))):repo+relative+url.hash;
    }else if(href.startsWith('#')){node.href=route(path,decodeURIComponent(href.slice(1)));}
    else{node.href=url.href;node.rel='noopener noreferrer'}
   }catch{node.removeAttribute('href')}
  }
 }
 for(const input of template.content.querySelectorAll('input[type="checkbox"]'))input.closest('li')?.classList.add('task-item');
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
  for(const d of docs)for(const s of d.sections){const hay=(d.title+' '+s.markdown).toLowerCase();if(terms.every(group=>group.some(t=>hay.includes(t)))&&(!(priority||evidence)||s.tags.some(t=>(!priority||t.priorities.includes(priority))&&(!evidence||t.evidence.includes(evidence)))))results.push([d,s])}
  results.sort((a,b)=>{const score=([d,s])=>(query&&s.title.toLowerCase().includes(query)?4:0)+(query&&d.title.toLowerCase().includes(query)?2:0);return score(b)-score(a)});
  $('status').textContent=`全书搜索 · ${results.length} 个匹配段落`;document.title='搜索 · 中美双栖人生指南';
  if(!results.length)out.append(el('p','没有匹配结果。试试其他关键词，或清除优先级与证据筛选。','empty'));
  for(const [d,s] of results){const card=el('section',undefined,'result');card.append(el('span',d.kind+' · '+d.title,'source'));const h=el('h2');const a=el('a',s.title==='概览'?d.title:s.title);a.href=route(d.path,s.id);h.append(a);card.append(h);for(const b of [...s.priorities,...s.evidence.map(e=>'证据 '+e)])card.append(el('span',b,'badge'));const text=plain(s.markdown);const at=query?text.toLowerCase().indexOf(query):-1;card.append(el('p',(at>50?'…':'')+text.slice(Math.max(0,at-45),Math.max(0,at-45)+210)+'…'));out.append(card)}return;
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
fetch('data.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{docs=data;directory();navigate()}).catch(()=>{$('status').textContent='正文暂时无法载入';const a=el('a','打开 GitHub 完整目录');a.href='https://github.com/gjimzhou/US-China-Life-Playbook#readme';$('reading').append(a)});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.hash===location.hash&&a.hash.startsWith('#doc=')){e.preventDefault();navigate()}});
