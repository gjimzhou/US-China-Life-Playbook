// Editorial search cases check useful destinations, not medical/legal correctness.
const assert=require('node:assert/strict');
const cases=require('./search-cases.json');
const {firefox}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const base=process.env.PLAYBOOK_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1',MOZ_DISABLE_GMP_SANDBOX:'1',MOZ_DISABLE_RDD_SANDBOX:'1'}});
 const ctx=await browser.newContext(),p=await ctx.newPage(),errors=[];
 await ctx.route('**/services.json',r=>r.fulfill({json:{analytics:{enabled:false},comments:{enabled:false},newsletter:{enabled:false}}}));
 p.on('pageerror',e=>errors.push(e.message));
 const open=async(hash='')=>{await p.goto(base+'/'+hash);await p.locator('article, .result, .empty, .event-suggestions').first().waitFor()};
 await open();const docs=await p.evaluate(()=>docs);
 const entries=await p.locator('.scenario-links a').evaluateAll(as=>as.map(a=>({href:a.getAttribute('href'),id:a.dataset.readerContent,section:a.dataset.readerSection,label:a.textContent})));
 assert.equal(entries.length,6);
 // The direct entry reaches the same stable chapter/section in both readers.
 for(const e of entries){
  const d=docs.find(d=>d.contentId===e.id);assert(d,e.label);
  assert(!e.section||d.sections.some(s=>s.contentId===e.section),e.label);
  await open();await p.getByRole('link',{name:e.label,exact:true}).click();await p.waitForURL(/#doc=/);
  assert.equal(await p.evaluate(()=>current),d.path);
  if(e.section)assert.equal(new URL(p.url()).hash.includes(encodeURIComponent(d.sections.find(s=>s.contentId===e.section).id)),true);
 }
 for(const c of cases){
  await open('#'+new URLSearchParams({q:c.query}));
  const targets=await p.locator('.event-suggestions a, .result h2 a').evaluateAll(as=>as.slice(0,3).map(a=>Object.fromEntries(new URLSearchParams(a.hash.slice(1)))));
  assert(targets.some(t=>t.doc===c.path&&(!c.section||t.section===c.section)),c.query);
 }
 // Ambiguous insurance searches must retain both interpretations.
 await open('#q='+encodeURIComponent('保险拒赔'));
 assert.equal(await p.locator('.event-suggestions a').count(),2);
 // Suggestions remain explicitly independent of evidence/priority filters.
 await open('#'+new URLSearchParams({q:'收到通知不知道怎么办',priority:'P0',evidence:'A'}));
 assert(await p.getByText('先看相关处理入口（不受高级筛选限制）').isVisible());
 assert.equal(await p.locator('.event-suggestions a').count(),1);
 await open('#q=zzzz-no-matching-topic');
 assert.equal(await p.locator('.event-suggestions').count(),0);
 await p.getByRole('link',{name:'按生活事件查找',exact:true}).click();await p.waitForURL(/doc=/);
 assert.equal(await p.evaluate(()=>current),'checklists/life-events-index.md');
 const partial=docs.find(d=>d.path==='book/02-预防医学.md');
 await open('#content='+partial.contentId);await p.locator('.review-scope summary').click();
 assert(await p.getByText('尚无该登记范围的完整核验日期。',{exact:false}).isVisible());
 assert(await p.getByText('最近仅部分核验，仍有缺口',{exact:false}).isVisible());
 assert(!await p.locator('.review-scope').innerText().then(t=>t.includes('登记范围已完成核验')));
 for(const width of [320,390,1440]){
  await p.setViewportSize({width,height:900});await open();
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`home overflow ${width}`);
  await p.locator('.scenario-links a').first().focus();await p.keyboard.press('Enter');await p.waitForURL(/#doc=/);assert.equal(await p.evaluate(()=>document.activeElement.id),'content');
 }
 // No-JS homepage links and static review details work independently of the app.
 const nc=await browser.newContext({javaScriptEnabled:false}),np=await nc.newPage();
 for(const e of entries){
  await np.goto(base);
  await np.getByRole('link',{name:e.label,exact:true}).click();
  // Navigation can commit before the static article is painted. isVisible() does not wait.
  await np.waitForURL(url=>url.pathname.endsWith('/read/'+e.id+'.html'));
  await np.locator('article').waitFor({state:'visible'});
  if(e.section)assert.equal(await np.locator('section[id="'+e.section+'"]').count(),1);
 }
 await np.goto(base+'/read/'+partial.contentId+'.html');await np.locator('.review-scope summary').click();
 assert((await np.locator('.review-scope').innerText()).includes('最近仅部分核验'));
 for(const d of docs.filter(d=>d.reviewSummary)){
  await open('#content='+d.contentId);
  await np.goto(base+'/read/'+d.contentId+'.html');await np.locator('.review-scope summary').click();
  await p.locator('.review-scope summary').click();
  assert.equal((await p.locator('.review-scope').innerText()).replace(/\s/g,''),(await np.locator('.review-scope').innerText()).replace(/\s/g,''));
 }
 assert.deepEqual(errors,[]);await browser.close();
 console.log(`PASS: ${cases.length} search cases, ambiguous/filtered/empty results, six direct and no-JS entries, review scope parity, keyboard and responsive layouts`);
})().catch(e=>{console.error(e);process.exit(1)});
