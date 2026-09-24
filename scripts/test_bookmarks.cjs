// Run after build_site.py with a local server: PLAYBOOK_TEST_URL=http://127.0.0.1:8765 node scripts/test_bookmarks.cjs
// Requires Playwright with Firefox installed. This test does not contact the published site.
const assert = require('node:assert/strict');
const { firefox } = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES + '/playwright' : 'playwright');
const key='us-china-playbook.bookmarks.v1', base=process.env.PLAYBOOK_TEST_URL || 'http://127.0.0.1:8765';
(async()=>{
 const browser=await firefox.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 let page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const open=async(hash='')=>{await page.goto(base+'/'+hash);await page.reload();await page.locator('#status').filter({hasNotText:'正在载入'}).waitFor()};
 await open();await page.waitForFunction(()=>document.querySelectorAll('.bookmark-button').length>0);
 const first=page.locator('.bookmark-button').first();const id=await first.getAttribute('data-bookmark-section');
 await first.focus();await page.keyboard.press('Enter');assert.equal(await first.getAttribute('aria-pressed'),'true');
 await page.reload();await page.waitForFunction(()=>document.querySelector('.bookmark-button')?.getAttribute('aria-pressed')==='true');
 // Close the page and reopen against the same browser storage.
 await page.close();page=await context.newPage();await open('#view=bookmarks');
 assert.equal(await page.locator('.saved-item').count(),1);await page.locator('.saved-item h2 a').click();
 await page.waitForFunction(id=>location.hash.includes('section=')&&document.getElementById('section-'+id),id);
 await page.locator('button[data-bookmark-section]').first().click();
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).items.length,key),0);
 // Search has the same identity as the chapter view and never adds duplicates.
 await page.locator('#menu').click();await page.locator('#search').fill('医保');
 await page.waitForFunction(()=>document.querySelectorAll('.result').length>0);
 const save=page.locator('.result .bookmark-button').first();await save.click();
 const href=await page.locator('.result h2 a').first().getAttribute('href');await open(href);
 assert.equal(await page.locator('.bookmark-button[aria-pressed="true"]').count(),1);
 // Resolve a historic alias, while deleted paths/sections remain visible but unlinked.
 const data=await page.evaluate(async()=>{const html=await (await fetch('app.js')).text();const asset=html.match(/fetch\('(data\.[^']+\.json)'\)/)[1];return (await fetch(asset)).json()});
 const d=data.find(d=>d.sections.some(s=>s.aliases.length));const s=d.sections.find(s=>s.aliases.length);
 const items=[{path:d.path,section:s.aliases[0],title:'旧标题',docTitle:d.title},{path:'book/deleted.md',section:'lost',title:'已删除文章',docTitle:'原章节'},{path:d.path,section:'nonexistent-section',title:'已删除小节',docTitle:d.title}];
 await page.evaluate(({key,items})=>localStorage.setItem(key,JSON.stringify({version:1,items})),{key,items});
 await open('#view=bookmarks');await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(new URL(await page.url()).hash,'#view=bookmarks');assert.equal(await page.evaluate(()=>document.activeElement.id),'content');assert.equal(await page.locator('.saved-item').count(),3);assert.equal(await page.locator('.saved-item h2 a').count(),1);
 await page.locator('.saved-item h2 a').click();await page.waitForFunction(()=>document.querySelector('.bookmark-button[aria-pressed="true"]'));
 assert.equal(await page.locator('.bookmark-button[aria-pressed="true"]').count(),1);
 await page.locator('.bookmark-button[aria-pressed="true"]').click();
 assert.equal(await page.evaluate(k=>JSON.parse(localStorage.getItem(k)).items.length,key),2);
 await open('#view=bookmarks');await page.locator('.saved-item button').first().focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.saved-item').count(),1);
 assert.equal(await page.evaluate(()=>document.activeElement.tagName),'BUTTON');
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:900});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`)}
 // A damaged index is not silently overwritten by the next save.
 await page.evaluate(k=>localStorage.setItem(k,'invalid-json'),key);await open();await page.locator('.bookmark-button').first().click();
 assert(await page.locator('#bookmark-notice').isVisible());assert.equal(await page.evaluate(k=>localStorage.getItem(k),key),'invalid-json');
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','QuotaExceededError')}});
 const bp=await blocked.newPage();await bp.goto(base);await bp.locator('.bookmark-button').first().click();assert(await bp.locator('#bookmark-notice').isVisible());assert.equal(await bp.locator('.bookmark-button[aria-pressed="true"]').count(),0);assert(await bp.locator('article').isVisible());
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: persistence, keyboard, search identity, aliases, missing targets, storage failure, corruption, responsive list');
})().catch(e=>{console.error(e);process.exit(1)});
