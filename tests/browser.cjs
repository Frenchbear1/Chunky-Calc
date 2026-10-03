/* Optional browser integration: PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser.cjs */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']}),context=await browser.newContext({viewport:{width:390,height:844},acceptDownloads:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(process.env.CALC_TEST_URL||'http://127.0.0.1:8000');await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await page.locator('.basic [data-k="2"]').click();await page.locator('.basic [data-k="+"]').click();await page.locator('.basic [data-k="2"]').click();await page.locator('.basic [data-k="="]').click();assert.equal(await page.locator('#main').innerText(),'4');
 const settings=async()=>{await page.locator('#fx').focus();await page.keyboard.press('Enter')};await settings();
 await page.getByLabel('Custom themes',{exact:true}).selectOption('__new');
 assert.equal(await page.getByRole('button',{name:'Delete Theme',exact:true}).isVisible(),false);
 await page.getByLabel('Theme name',{exact:true}).fill('Cockpit');
 assert.equal(await page.locator('select[aria-label="Calculator element"] option[value="__pick"]').count(),0);
 await page.getByRole('button',{name:'Select a specific element'}).click();await page.locator('.pick-calc [data-target="b4"]').click();await page.getByRole('button',{name:'Confirm',exact:true}).click();
 assert.equal(await page.getByLabel('Calculator element',{exact:true}).inputValue(),'part_b4_fill');assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Select');
 await page.getByLabel('Hex color',{exact:true}).fill('#ff2244');await page.getByLabel('Hex color',{exact:true}).blur();
 await page.getByRole('button',{name:'Undo last edit'}).click();assert.notEqual(await page.getByLabel('Hex color',{exact:true}).inputValue(),'#ff2244');
 await page.getByLabel('Hex color',{exact:true}).fill('#ff2244');await page.getByRole('button',{name:'Save',exact:true}).click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.cc_set));assert.equal(saved.custom.part_b4_fill,'#ff2244');
 await page.getByRole('button',{name:'Edit theme',exact:true}).click();await page.getByLabel('Calculator element',{exact:true}).selectOption('part_b4_fill');
 assert(await page.getByRole('button',{name:'Delete Theme',exact:true}).isVisible());assert(await page.getByRole('button',{name:'Delete Element',exact:true}).isVisible());
 await page.screenshot({path:'/tmp/chunky-editor-mobile.png'});
 await page.getByRole('button',{name:'Delete Element',exact:true}).click();assert(await page.getByRole('button',{name:'Undo last edit'}).isDisabled());assert.equal(await page.evaluate(()=>JSON.parse(localStorage.cc_set).custom.part_b4_fill),undefined);
 await page.getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.cc_set).customThemes[0].colors.part_b4_fill),undefined);
 await page.getByRole('button',{name:'Edit theme',exact:true}).click();await page.getByRole('button',{name:'AI',exact:true}).click();
 await page.getByLabel('Describe the theme you want',{exact:true}).fill('Dark blue aviation with orange accents');await page.getByLabel('AI Service',{exact:true}).selectOption('claude');
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>window.copiedPrompt=text}});window.open=()=>({opener:null,location:{replace:url=>window.openedAI=url},close(){window.closedAI=true}})});
 await page.getByRole('button',{name:'Go to AI',exact:true}).click();assert.equal(await page.evaluate(()=>window.openedAI),'https://claude.ai/');
 const contract=await page.evaluate(()=>({prompt:window.copiedPrompt,keys:Object.keys(CalcThemes.properties)}));for(const key of contract.keys)assert(contract.prompt.includes('"'+key+'"'));assert(contract.prompt.includes('Dark blue aviation'));assert(contract.prompt.includes('complementary colors'));
 await page.getByLabel('Import AI Theme',{exact:true}).fill('{"format":"chunky-theme","version":99}');await page.getByRole('button',{name:'Preview Theme',exact:true}).click();assert((await page.getByRole('dialog',{name:'AI Theme Generator'}).innerText()).includes('not supported'));
 const theme=await page.evaluate(()=>JSON.stringify({format:'chunky-theme',version:1,name:'AI Aviation',theme:CalcThemes.palette({bg:'#102030',op:'#ff8800',part_a1_text:'#00aaff'})}));
 await page.getByLabel('Import AI Theme',{exact:true}).fill(theme);await page.getByRole('button',{name:'Preview Theme',exact:true}).click();assert.equal(await page.locator('.ai-preview .mini-calc').count(),2);
 await page.screenshot({path:'/tmp/chunky-ai-mobile.png'});await page.getByRole('dialog',{name:'AI Theme Generator',exact:true}).getByRole('button',{name:'Cancel',exact:true}).click();assert.equal(await page.evaluate(()=>JSON.parse(localStorage.cc_set).customThemes.length),1);
 await page.getByRole('button',{name:'Preview Theme',exact:true}).click();await page.getByRole('button',{name:'Save Theme',exact:true}).click();assert.equal(await page.locator('.theme-popup').count(),0);assert.equal(await page.evaluate(()=>JSON.parse(localStorage.cc_set).customThemes.length),2);
 await page.getByRole('button',{name:'Customize App Icon',exact:true}).click();assert.equal(await page.locator('.icon-choice').count(),5);const beforeIcons=await page.locator('.icon-choice img').evaluateAll(ns=>ns.map(n=>n.src));
 await page.getByRole('button',{name:'Regenerate',exact:true}).click();assert.notDeepEqual(await page.locator('.icon-choice img').evaluateAll(ns=>ns.map(n=>n.src)),beforeIcons);
 await page.getByRole('button',{name:'Icon variation 3',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Icon variation 3',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Prepare App Icon',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.reinstall-guide'));
 assert.equal(await page.locator('.reinstall-guide li').count(),0);assert((await page.locator('.reinstall-guide').innerText()).includes('Keep your current app installed'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.cc_icon).variant),2);
 const iconMeta=await page.evaluate(async()=>({apple:document.querySelector('link[rel="apple-touch-icon"]').href,manifest:await fetch(document.querySelector('link[rel="manifest"]').href).then(r=>r.json())}));assert(iconMeta.apple.includes('/local-icon/'));assert.equal(iconMeta.manifest.icons.length,2);assert(!iconMeta.manifest.start_url.startsWith('blob:'));
 assert.equal(await page.evaluate(async()=>{const r=await fetch(document.querySelector('link[rel="apple-touch-icon"]').href);return r.status}),200);
 // A real downloaded file must be selected again before deletion instructions appear.
 const downloadEvent=page.waitForEvent('download');await page.getByRole('dialog',{name:'Customize App Icon',exact:true}).getByRole('button',{name:'Export Everything',exact:true}).click();const download=await downloadEvent;await download.saveAs('/tmp/chunky-roundtrip.json');
 let chooserEvent=page.waitForEvent('filechooser');await page.getByRole('dialog',{name:'Customize App Icon',exact:true}).getByRole('button',{name:'Verify Saved Backup',exact:true}).click();await (await chooserEvent).setFiles('/tmp/chunky-roundtrip.json');await page.waitForFunction(()=>document.querySelectorAll('.reinstall-guide li').length===13);
 await page.getByRole('button',{name:'Close',exact:true}).click();
 const expected=JSON.parse(fs.readFileSync('/tmp/chunky-roundtrip.json','utf8'));assert.equal(expected.data.localStorage.cc_set.customThemes.length,2);assert.equal(expected.data.localStorage.cc_hist[0].r,'4');
 await page.getByRole('button',{name:'Cream',exact:true}).click();
 chooserEvent=page.waitForEvent('filechooser');await page.getByRole('button',{name:'Import Backup',exact:true}).click();await (await chooserEvent).setFiles('/tmp/chunky-roundtrip.json');await page.waitForEvent('load');
 assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.cc_set)),expected.data.localStorage.cc_set);assert.equal(await page.locator('#tape').innerText(),'2 + 2 = 4');
 // Reinstallation permission must never survive a reload/import.
 await settings();await page.getByRole('button',{name:'Customize App Icon',exact:true}).click();await page.getByRole('button',{name:'Prepare App Icon',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.reinstall-guide'));assert.equal(await page.locator('.reinstall-guide li').count(),0);await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.getByRole('button',{name:'Edit theme',exact:true}).click();await page.getByRole('button',{name:'Delete Theme',exact:true}).click();const deleted=await page.evaluate(()=>JSON.parse(localStorage.cc_set));assert.equal(deleted.skin,'cream');assert.equal(deleted.customThemes.length,1);assert.equal(deleted.custom,undefined);
 // Built-in fallback, unrelated app data, and the custom icon survive updates/offline use.
 await page.evaluate(async()=>{localStorage.setItem('another-app','keep');await caches.open('another-app-cache');await navigator.serviceWorker.getRegistration().then(r=>r.update())});
 await context.setOffline(true);await page.reload();assert(await page.locator('#fx').isVisible());assert.equal(await page.evaluate(()=>localStorage.getItem('another-app')),'keep');await context.setOffline(false);
 // Check small phone, short landscape, and desktop popup bounds.
 for(const size of [{width:320,height:568},{width:844,height:390},{width:1440,height:900}]){await page.setViewportSize(size);await settings();await page.getByRole('button',{name:'AI Theme Generator',exact:true}).click();const overflow=await page.evaluate(()=>{const p=document.querySelector('.feature-popup .panel'),r=p.getBoundingClientRect();return {wide:document.documentElement.scrollWidth>innerWidth,right:r.right>innerWidth+1,bottom:r.bottom>innerHeight+1}});assert.deepEqual(overflow,{wide:false,right:false,bottom:false});await page.getByRole('button',{name:'Close',exact:true}).click();await page.locator('#sx').click()}
 assert.deepEqual(errors,[]);console.log('PASS: browser workflows, 13-step backup gate, mobile/desktop bounds, cached icons, and offline calculator; no page errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
