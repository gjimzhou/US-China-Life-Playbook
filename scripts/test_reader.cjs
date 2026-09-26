// Browser contract tests. Mocked services here are NOT real-service acceptance.
const assert=require('node:assert/strict');
const {firefox}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const base=process.env.PLAYBOOK_TEST_URL||'http://127.0.0.1:8765', key='us-china-playbook.progress.v1';
const services={analytics:{enabled:true,websiteId:'11111111-1111-4111-8111-111111111111',scriptUrl:'https://stats.example.test/script.js'},comments:{enabled:true,serverUrl:'https://comments.example.test',moderationConfirmed:true,replyNotifications:false},newsletter:{enabled:false}};
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1',MOZ_DISABLE_GMP_SANDBOX:'1',MOZ_DISABLE_RDD_SANDBOX:'1'}});const ctx=await browser.newContext({viewport:{width:390,height:844}});await ctx.route('**/services.json',r=>r.fulfill({json:{analytics:{enabled:false},comments:{enabled:false},newsletter:{enabled:false}}}));const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const open=async(url='')=>{await page.goto(base+'/'+url);await page.reload();await page.locator('#status').filter({hasNotText:'正在载入'}).waitFor()};
 const external=[];page.on('request',r=>{if(!r.url().startsWith(base))external.push(r.url())});
 await open();const docs=await page.evaluate(async()=>{const app=await(await fetch('app.js')).text();return(await fetch(app.match(/fetch\('(data\.[^']+\.json)'\)/)[1])).json()});
 const d=docs.find(d=>d.kind==='正文'),s=d.sections[3],last=d.sections.at(-1);
 const route=(doc,section)=>'#'+new URLSearchParams({content:doc.contentId,...(section?{at:section.contentId}:{})});
 await open(route(d,s));await page.waitForFunction(k=>!!localStorage.getItem(k),key);
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).contentId,key),d.contentId);
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).sectionId,key),s.contentId);
 await open();await page.locator('#resume-reading a').click();await page.waitForURL(/at=/);assert((await page.url()).includes(s.contentId));
 await page.locator('.chapter-navigation a').last().click();await page.waitForFunction(id=>!document.querySelector('#status').textContent.includes(id),d.title);assert((await page.url()).includes('content='));
 await page.goBack();await page.waitForFunction(title=>document.querySelector('#status').textContent.includes(title),d.title);
 await open('#view=updates');assert.equal(await page.locator('link[rel=alternate]').getAttribute('href'),'feed.xml');assert.equal(await page.locator('input#feed-address').inputValue(),base+'/feed.xml');
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('blocked')}}}));await page.getByRole('button',{name:'复制订阅地址'}).click();assert(await page.getByText('未能自动复制',{exact:false}).isVisible());
 await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async v=>{window.copied=v}}}));await page.getByRole('button',{name:'复制订阅地址'}).click();assert.equal(await page.evaluate(()=>window.copied),base+'/feed.xml');
 assert.equal(await page.getByRole('link',{name:'通过邮件订阅更新'}).count(),0);assert.equal(await page.locator('.discussion').count(),0);assert.deepEqual(external,[]);
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`updates overflow ${width}`)}
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/playbook-subscriptions.png',fullPage:false});
 // Damaged progress is not overwritten, and quota failures are visible.
 await page.evaluate(k=>localStorage.setItem(k,'broken-json'),key);await open(route(d));await page.waitForTimeout(1100);assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'broken-json');assert(await page.getByText('无法读取本地阅读进度',{exact:false}).isVisible());
 const quota=await browser.newContext();await quota.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Full','QuotaExceededError')}});const qp=await quota.newPage();await qp.goto(base+'/'+route(d));await qp.getByText('阅读进度未能保存',{exact:false}).waitFor();assert(await qp.locator('article').isVisible());
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.getItem=function(){throw Error('disabled')}});const bp=await blocked.newPage();await bp.goto(base+'/'+route(d));await bp.getByText('无法读取本地阅读进度',{exact:false}).waitFor();await bp.locator('article').waitFor();assert(await bp.locator('article').isVisible());
 // Stable IDs, not heading strings or path/order, resolve a previously saved bookmark/progress.
 await page.evaluate(({key,d,s})=>{localStorage.setItem(key,JSON.stringify({version:1,contentId:d.contentId,sectionId:s.contentId,title:'Old',updatedAt:new Date().toISOString()}));localStorage.setItem('us-china-playbook.bookmarks.v1',JSON.stringify({version:1,items:[{path:'removed-old-path.md',section:'old-heading',title:'Old',docTitle:'Old',contentId:d.contentId,sectionId:s.contentId}]}))},{key,d,s});
 await open('#view=bookmarks');assert.equal(await page.locator('.saved-item h2 a').count(),1);await page.locator('.saved-item h2 a').click();assert(await page.locator('.bookmark-button[aria-pressed=true]').count());
 await page.evaluate(k=>localStorage.setItem(k,JSON.stringify({version:1,contentId:'d-000000000000',sectionId:'s-000000000000',title:'Gone',updatedAt:new Date().toISOString()})),key);await open();assert(await page.getByText('上次阅读位置已移除',{exact:false}).isVisible());
 // Mock Umami transport only; assert exact manual route/event payloads contain no query or personal data.
 const ac=await browser.newContext();await ac.route('**/services.json',r=>r.fulfill({json:services}));await ac.route(services.analytics.scriptUrl,r=>r.fulfill({contentType:'text/javascript',body:'window.sent=[];window.umami={track:p=>window.sent.push(p)}'}));
 const ap=await ac.newPage();await ap.goto(base+'/'+route(d));await ap.waitForFunction(()=>window.sent?.length>=2);
 const pv=()=>ap.evaluate(()=>window.sent.filter(p=>!p.name).length);assert.equal(await pv(),1);
 await ap.reload();await ap.waitForFunction(()=>window.sent?.length>=2);assert.equal(await pv(),1);
 await ap.evaluate(()=>document.documentElement.lang='en');await ap.evaluate(()=>document.getElementById('theme-toggle').click());assert.equal(await pv(),1);
 await ap.evaluate(url=>location.hash=url,route(d,s));await ap.waitForFunction(()=>window.sent.some(p=>p.name==='section_open'));assert.equal(await pv(),1);
 await ap.evaluate(()=>document.querySelector('#directory a.active').click());await ap.waitForTimeout(50);assert.equal(await pv(),1);
 await ap.evaluate(url=>location.hash=url,route(d,last));await ap.waitForFunction(()=>window.sent.some(p=>p.name==='last_section_visible'));assert.equal(await pv(),1);
 await ap.locator('.bookmark-button').last().click();assert(await ap.evaluate(()=>window.sent.some(p=>p.name==='bookmark_click')));
 const discussionPath=[];await ac.route('https://comments.example.test/**',r=>{discussionPath.push(new URL(r.request().url()).searchParams.get('path'));return r.abort()});
 await ap.getByRole('button',{name:'加载本章点赞与评论'}).click();await ap.getByText('评论服务暂时无法加载',{exact:false}).waitFor();assert.deepEqual(discussionPath,['/playbook/'+d.contentId]);assert(await ap.locator('article').isVisible());
 await ap.evaluate(()=>location.hash='#view=updates&q=private@example.com');await ap.waitForFunction(()=>document.querySelector('#status').textContent==='订阅更新');
 await ap.goBack();await ap.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('正文'));
 const payloads=await ap.evaluate(()=>window.sent);assert(!JSON.stringify(payloads).includes('private@'));assert(payloads.every(p=>p.referrer===''&&!p.url.includes('?')&&!p.url.includes('#')));assert.equal(await pv(),3);
 // Blocked tracker does not break reading; DNT prevents even requesting it.
 const fail=await browser.newContext();await fail.route('**/services.json',r=>r.fulfill({json:services}));await fail.route(services.analytics.scriptUrl,r=>r.abort());const fp=await fail.newPage();await fp.goto(base+'/'+route(d));await fp.locator('article').waitFor();
 const dc=await browser.newContext();await dc.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{value:'1'}));await dc.route('**/services.json',r=>r.fulfill({json:services}));const dp=await dc.newPage();let tracked=false;dp.on('request',r=>{if(r.url()===services.analytics.scriptUrl)tracked=true});await dp.goto(base+'/'+route(d));await dp.locator('article').waitFor();assert.equal(tracked,false);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: progress, stable identity, missing/deleted/corrupt storage, quota/disabled storage, RSS copy, mobile layout, private manual analytics contract, lazy discussion binding, blocked services and DNT. Real external services NOT tested.');
})().catch(e=>{console.error(e);process.exit(1)});
