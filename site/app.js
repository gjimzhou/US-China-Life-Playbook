'use strict';
const $=id=>document.getElementById(id), repo='https://github.com/gjimzhou/US-China-Life-Playbook/blob/main/';
let docs=[], current='HOME.md';
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
     node.href=docs.some(d=>d.path===relative)?route(relative):repo+relative;
    }else if(href.startsWith('#')){node.href=route(path);}
    else{node.href=url.href;node.rel='noopener noreferrer'}
   }catch{node.removeAttribute('href')}
  }
 }
 for(const input of template.content.querySelectorAll('input[type="checkbox"]'))input.closest('li')?.classList.add('task-item');
 return template.content;
}
function directory(){const container=$('directory');container.replaceChildren();for(const kind of ['正文','清单','参考']){const group=el('details');group.open=true;group.append(el('summary',kind));for(const doc of docs.filter(d=>d.kind===kind)){const a=el('a',doc.title);a.href=route(doc.path);a.dataset.path=doc.path;group.append(a)}container.append(group)}}
function render(){
 const query=$('search').value.trim().toLowerCase(), priority=$('priority').value,evidence=$('evidence').value;
 const out=$('reading');out.replaceChildren();
 document.querySelectorAll('#directory a').forEach(a=>a.classList.toggle('active',a.dataset.path===current));
 if(query||priority||evidence){
  const terms=query.split(/\s+/).filter(Boolean);const results=[];
  for(const d of docs)for(const s of d.sections){const hay=(d.title+' '+s.markdown).toLowerCase();if(terms.every(t=>hay.includes(t))&&(!priority||s.priorities.includes(priority))&&(!evidence||s.evidence.includes(evidence)))results.push([d,s])}
  $('status').textContent=`全书搜索 · ${results.length} 个匹配段落`;document.title='搜索 · 中美双栖人生指南';
  if(!results.length)out.append(el('p','没有匹配结果。试试其他关键词，或清除优先级与证据筛选。','empty'));
  for(const [d,s] of results){const card=el('section',undefined,'result');card.append(el('span',d.kind+' · '+d.title,'source'));const h=el('h2');const a=el('a',s.title==='概览'?d.title:s.title);a.href=route(d.path,s.id);h.append(a);card.append(h);for(const b of [...s.priorities,...s.evidence.map(e=>'证据 '+e)])card.append(el('span',b,'badge'));const text=plain(s.markdown);const at=query?text.toLowerCase().indexOf(terms[0]):-1;card.append(el('p',(at>50?'…':'')+text.slice(Math.max(0,at-45),Math.max(0,at-45)+210)+'…'));out.append(card)}return;
 }
 const doc=docs.find(d=>d.path===current);if(!doc){$('status').textContent='未找到章节';out.append(el('p','链接中的章节不存在，请从目录重新选择。','empty'));return}
 $('status').textContent=doc.kind+' · '+doc.title;document.title=doc.title+' · 中美双栖人生指南';
 const toc=el('nav',undefined,'toc');toc.setAttribute('aria-label','本章目录');for(const s of doc.sections.slice(1)){const a=el('a',s.title);a.href=route(doc.path,s.id);toc.append(a)}if(toc.children.length)out.append(toc);
 const article=el('article');for(const s of doc.sections){const section=el('section');section.id=s.id;section.append(safeMarkdown(s.markdown,doc.path));article.append(section)}out.append(article);const a=el('a','查看本章原文与修改记录 ↗','source');a.href=repo+doc.path;out.append(a);
 const section=new URLSearchParams(location.hash.slice(1)).get('section');if(section)requestAnimationFrame(()=>$(section)?.scrollIntoView());
}
function navigate(){const params=new URLSearchParams(location.hash.slice(1));current=params.get('doc')||'HOME.md';$('search').value='';$('priority').value='';$('evidence').value='';render();$('sidebar').classList.remove('open');$('menu').setAttribute('aria-expanded','false');if(!params.get('section'))window.scrollTo(0,0)}
for(const id of ['search','priority','evidence'])$(id).addEventListener('input',render);
$('reset').onclick=()=>{for(const id of ['search','priority','evidence'])$(id).value='';render()};
$('menu').onclick=()=>{$('menu').setAttribute('aria-expanded',String($('sidebar').classList.toggle('open')))};
$('print').onclick=()=>window.print();window.addEventListener('hashchange',navigate);
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();$('sidebar').classList.add('open');$('menu').setAttribute('aria-expanded','true');$('search').focus()}});
fetch('data.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{docs=data;directory();navigate()}).catch(()=>{$('status').textContent='正文暂时无法载入';const a=el('a','打开 GitHub 完整目录');a.href='https://github.com/gjimzhou/US-China-Life-Playbook#readme';$('reading').append(a)});
document.addEventListener('click',e=>{const a=e.target.closest('a');if(a&&a.hash===location.hash&&a.hash.startsWith('#doc=')){e.preventDefault();navigate()}});
