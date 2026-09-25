'use strict';
// Optional services never own the reading lifecycle. No user-entered text enters analytics.
window.Reader = (() => {
 const key='us-china-playbook.progress.v1';
 let documents=[], config={analytics:{enabled:false},comments:{enabled:false},newsletter:{enabled:false}}, progress=null, progressRaw=null, storageOK=true;
 let active=null, timer=null, scrollTimer=null, generation=0, commentInstance=null, lastView='', lastSection='', endSeen=false, queue=[], analyticsReady=false;
 const $=id=>document.getElementById(id);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
 const link=(text,href)=>{const n=node('a',text);n.href=href;return n};
 const stableRoute=(doc,section)=>'#'+new URLSearchParams({content:doc.contentId,...(section?{at:section.contentId}:{})});
 function message(text){$('reader-message').hidden=false;$('reader-message').textContent=text}
 function readProgress(){
  try{const raw=localStorage.getItem(key);progressRaw=raw;if(!raw){progress=null;return}const p=JSON.parse(raw);
   if(p.version!==1||!['contentId','sectionId','title','updatedAt'].every(k=>typeof p[k]==='string'&&p[k])||!Number.isFinite(Date.parse(p.updatedAt)))throw Error('Invalid progress');progress=p;
  }catch{storageOK=false;message('无法读取本地阅读进度；原数据未覆盖，仍可正常阅读。')}
 }
 function resume(){
  const box=$('resume-reading');box.replaceChildren();box.hidden=!progress;if(!progress)return;
  const d=documents.find(d=>d.contentId===progress.contentId), s=d?.sections.find(s=>s.contentId===progress.sectionId);
  if(d&&s){const a=link('继续阅读：'+d.title+' · '+(s.title==='概览'?'开篇':s.title),stableRoute(d,s));a.onclick=()=>event('continue_reading_click',d,s);box.append(a)}
  else box.append(node('span','上次阅读位置已移除，请从目录选择内容。'));
  box.append(node('small','仅当前浏览器保存，不跨设备同步；清除网站数据可能丢失。'));
  const clear=node('button','清除进度');clear.type='button';clear.onclick=()=>{
   if(!storageOK){message('进度存储不可用，未更改原数据。');return}
   try{localStorage.removeItem(key);progressRaw=null;progress=null;clearTimeout(timer);active=null;resume();message('已清除阅读进度；下次打开章节时重新记录。')}catch{message('清除失败，原阅读进度仍保留。')}
  };box.append(clear);
 }
 function visibleSection(){
  if(!active)return null;
  const sections=[...document.querySelectorAll('#reading article > section')];
  const line=150;let found=sections.find(n=>n.getBoundingClientRect().bottom>line&&n.getBoundingClientRect().top<innerHeight);
  return active.sections.find(s=>'section-'+s.id===found?.id)||null;
 }
 function capture(){
  if(!active||document.visibilityState==='hidden')return;
  const s=visibleSection();if(!s)return;
  const final=active.sections.at(-1), end=$('section-'+final.id)?.getBoundingClientRect();
  if(!endSeen&&end&&end.top<innerHeight&&end.bottom>150){endSeen=true;event('last_section_visible',active,final)}
  if(!storageOK||active.kind==='参考')return;
  if(progress?.contentId===active.contentId&&progress?.sectionId===s.contentId)return;
  const next={version:1,contentId:active.contentId,sectionId:s.contentId,title:active.title,updatedAt:new Date().toISOString()};
  try{if(localStorage.getItem(key)!==progressRaw){readProgress();resume();return}const raw=JSON.stringify(next);localStorage.setItem(key,raw);progressRaw=raw;progress=next;resume()}catch{storageOK=false;message('阅读进度未能保存。请检查浏览器存储设置或空间；正文不受影响。')}
 }
 function beforeRender(){clearTimeout(timer);clearTimeout(scrollTimer);active=null;generation++;commentInstance?.destroy();commentInstance=null}
 function safePayload(doc,section,name){
  const url=doc?'/read/'+doc.category+'/'+doc.contentId:'/site/'+(lastView||'home');
  return {website:config.analytics.websiteId,hostname:location.hostname,language:document.documentElement.lang,screen:screen.width+'x'+screen.height,referrer:'',title:doc?.contentId||lastView,url:url+(name&&section?'/section/'+section.contentId:''),...(name?{name}:{})};
 }
 function send(payload){
  if(!config.analytics.enabled||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
  if(!analyticsReady){if(queue.length<30)queue.push(payload);return}
  try{
   if(config.analytics.provider==='goatcounter'){
    const prefix='/US-China-Life-Playbook', path=prefix+(payload.name?'/event/'+payload.name:'')+payload.url;
    window.goatcounter.count({path,title:payload.title,event:Boolean(payload.name),no_session:Boolean(payload.name),referrer:''});
    if(!payload.name)window.goatcounter.count({path:prefix+'/page-open'+payload.url,title:payload.title,event:true,no_session:true,referrer:''});
   }else Promise.resolve(window.umami?.track(payload)).catch(()=>{});
  }catch{}
 }
 const events=new Set(['bookmark_click','bookmark_remove_click','continue_reading_click','rss_copy_click','rss_open_click','newsletter_open_click','discussion_open_click','read_start','section_open','last_section_visible','chapter_next_click','chapter_previous_click']);
 function event(name,doc=active,section){if(events.has(name))send(safePayload(doc,section,name))}
 function trackView(view,doc,section){
  if(lastView!==view){lastView=view;lastSection='';endSeen=false;send(safePayload(doc));if(doc&&doc.kind!=='参考')event('read_start',doc)}
  if(!section)lastSection='';
  if(section&&lastSection!==section.contentId){lastSection=section.contentId;event('section_open',doc,section)}
 }
 function initAnalytics(){
  const a=config.analytics;if(!a.enabled||(!a.websiteId&&a.provider!=='goatcounter')||navigator.doNotTrack==='1'||navigator.globalPrivacyControl)return;
  if(a.provider==='goatcounter')window.goatcounter={no_onload:true,no_events:true,endpoint:a.endpoint};
  const script=node('script');script.src=a.scriptUrl;script.defer=true;script.dataset.websiteId=a.websiteId;script.dataset.autoTrack='false';script.dataset.doNotTrack='true';
  if(a.provider==='goatcounter')script.setAttribute('data-goatcounter',a.endpoint);
  script.onload=()=>{analyticsReady=a.provider==='goatcounter'?typeof window.goatcounter?.count==='function':Boolean(window.umami);const pending=queue;queue=[];if(analyticsReady)pending.forEach(send)};script.onerror=()=>{queue=[]};document.head.append(script);
 }
 function mountDiscussion(doc,out){
  if(!config.comments.enabled||!config.comments.serverUrl||!config.comments.moderationConfirmed||doc.kind==='参考')return;
  const box=node('section',undefined,'discussion');box.append(node('h2','本章反馈与留言'),node('p','游客昵称未经身份验证。反馈次数不等于独立人数；留言审核后公开，请勿提交证件、病历或其他敏感信息。','hint'));
  box.append(node('p',config.comments.replyNotifications?'邮箱可选，仅用于评论回复通知，不会订阅网站更新；不填写仍可留言。':'评论回复邮件尚未启用，请回到本章查看回复。','hint'));
  const button=node('button','加载本章点赞与评论');button.type='button';const status=node('p','','hint');status.setAttribute('role','status');const mount=node('div');box.append(button,status,mount);out.append(box);
  const token=generation;
  button.onclick=async()=>{
   event('discussion_open_click',doc);button.disabled=true;status.textContent='正在加载评论服务…';
   try{
    // Explicit activation avoids third-party requests until the reader asks for them.
    const url=config.comments.serverUrl.replace(/\/$/,'');
    const check=await fetch(url+'/api/comment?'+new URLSearchParams({path:'/playbook/'+doc.contentId,page:'1',pageSize:'1'}),{signal:AbortSignal.timeout(10000)});
    if(!check.ok)throw Error('Service unavailable');const result=await check.json();if(result.errno)throw Error('Service error');
    if(token!==generation)return;
    if(!document.getElementById('waline-style')){const css=node('link');css.id='waline-style';css.rel='stylesheet';css.href='https://cdn.jsdelivr.net/npm/@waline/client@3.15.2/dist/waline.css';document.head.append(css)}
    const client=await Promise.race([import('https://cdn.jsdelivr.net/npm/@waline/client@3.15.2/dist/waline.js'),new Promise((_,reject)=>setTimeout(()=>reject(Error('Timeout')),12000))]);
    if(token!==generation)return;
    commentInstance=client.init({el:mount,serverURL:url,path:'/playbook/'+doc.contentId,lang:document.documentElement.lang,login:'disable',meta:config.comments.replyNotifications?['nick','mail']:['nick'],requiredMeta:['nick'],reaction:true,pageview:false,comment:false,imageUploader:false,search:false,emoji:false,texRenderer:false,highlighter:false,noRss:true,wordLimit:2000,dark:'html[data-theme="dark"]',locale:{placeholder:'留言经审核后公开。请注明相关小节；不要填写私人资料。',reactionTitle:'本章反馈（次数，非独立人数）'}});
    status.textContent='评论服务已载入；提交状态以表单返回结果为准。';button.hidden=true;
   }catch{if(token===generation){status.textContent='评论服务暂时无法加载，可能被浏览器拦截。正文仍可阅读，请稍后重试。';button.disabled=false}}
  };
 }
 function mount(doc,out,section){
  active=doc;trackView('doc:'+doc.contentId,doc,section);
  const peers=documents.filter(d=>d.kind===doc.kind&&d.kind!=='参考'),i=peers.indexOf(doc);
  if(i>=0){const nav=node('nav',undefined,'chapter-navigation');nav.setAttribute('aria-label','章节翻页');
   for(const [next,text,name] of [[peers[i-1],'上一章','chapter_previous_click'],[peers[i+1],'下一章','chapter_next_click']])if(next){const a=link(text+'：'+next.title,stableRoute(next));a.onclick=()=>event(name,doc);nav.append(a)}out.append(nav)}
  mountDiscussion(doc,out);timer=setTimeout(capture,900);
 }
 function updates(out){
  trackView('updates');out.append(node('h1','订阅更新'),node('p','用你喜欢的 RSS 阅读器持续关注新内容和重要修订。普通小修和代码提交不会自动推送。'));
  const url=new URL('feed.xml',location.href.split('#')[0]).href;
  const a=link('打开 RSS 订阅源',url);a.onclick=()=>event('rss_open_click');out.append(a);
  const label=node('label','订阅地址');label.htmlFor='feed-address';const field=node('input');field.id='feed-address';field.readOnly=true;field.value=url;
  const copy=node('button','复制订阅地址');copy.type='button';const result=node('p','','hint');result.setAttribute('role','status');
  copy.onclick=async()=>{event('rss_copy_click');try{await navigator.clipboard.writeText(url);result.textContent='订阅地址已复制。'}catch{field.focus();field.select();result.textContent='未能自动复制，请手动复制已选中的订阅地址。'}};
  const group=node('div',undefined,'subscription-tools');group.append(label,field,copy,result);out.append(group);
  const n=config.newsletter;
  if(n.enabled&&n.formUrl&&n.doubleOptInVerified&&n.unsubscribeVerified){const mail=link('通过邮件订阅更新',n.formUrl);mail.target='_blank';mail.rel='noopener noreferrer';mail.onclick=()=>event('newsletter_open_click');out.append(mail,node('p','在邮件服务页面填写邮箱，并通过确认邮件完成订阅；每封更新邮件均可退订。这与评论回复通知分别管理。','hint'))}
  out.append(node('h2','最近发布'));
  const list=node('div');list.textContent='正在载入更新记录…';out.append(list);const token=generation;
  fetch('updates.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(entries=>{if(token!==generation)return;list.replaceChildren();for(const e of entries){const row=node('section',undefined,'saved-item');row.append(link(e.title,e.url),node('p',e.summary),node('small',new Date(e.published).toLocaleDateString('zh-CN',{timeZone:'America/New_York'})+' · '+(e.kind==='new'?'新内容':'重要修订')));list.append(row)}}).catch(()=>{if(token===generation)list.textContent='更新记录暂时无法载入，仍可直接使用上方 RSS 地址。'});
 }
 function privacy(out){
  trackView('privacy');out.append(node('h1','隐私与阅读数据'));
  const paragraphs=['收藏和阅读进度只保存在本浏览器，不跨设备同步。清除网站数据可能丢失；存储失败或数据损坏时会明确提示，不覆盖损坏数据。',config.analytics.enabled?'本站使用访问统计服务记录去标识化的浏览与指定按钮事件；尊重浏览器 Do Not Track 和 Global Privacy Control。统计不包含站内搜索词、留言、昵称或邮箱。统计后台不在本站公开。':'本站尚未启用访问统计。', 'page-open 事件统计进入章节或页面的次数，刷新和离开后返回会再次计数；GoatCounter 普通页面统计按访问会话去重。同章锚点跳转不增加章节浏览次数。去重访问是服务根据技术信号估算的访问者数量，不代表真实人数，也不是一个 IP 对应一个人。', '按钮点击表示操作尝试，不保证保存、留言或订阅成功。“到达末节”仅表示末节进入视口，不证明确实读完；被拦截的统计和离线阅读可能漏计。',config.comments.enabled?'按章集中留言与反馈，由独立评论服务持久化存储并审核。游客昵称不是经过验证的身份，匿名反馈次数不是独立人数。邮箱（如启用）只交给评论服务处理回复，不发送给统计服务。':'评论及点赞尚未启用。', 'RSS 无需向本站提交邮箱。邮件更新仅在服务配置并完成确认订阅、退订测试后开放，由站主挑选重要更新发送；评论回复通知不会自动订阅网站更新。'];paragraphs.forEach(p=>out.append(node('p',p)));
 }
 window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(capture,200)},{passive:true});
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null){storageOK=true;readProgress();resume()}});
 return {stableRoute,event,beforeRender,mount,updates,privacy,trackView,async init(ds){documents=ds;readProgress();resume();try{const r=await fetch('services.json',{signal:AbortSignal.timeout(3000)});if(r.ok){const next=await r.json();if(next.analytics&&next.comments&&next.newsletter)config=next}}catch{}initAnalytics()}};
})();
