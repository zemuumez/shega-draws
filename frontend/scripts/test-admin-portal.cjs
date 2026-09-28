// Isolated UI contract tests. API/auth fixtures never modify a real account.
// Run against a development preview with NEXT_PUBLIC_API_BASE_URL set to the
// ADMIN_TEST_API origin. Install/provide Playwright separately for browser QA.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const web=process.env.ADMIN_TEST_WEB||'http://127.0.0.1:3101';
const api=process.env.ADMIN_TEST_API||'http://127.0.0.1:18081';
if(!['localhost','127.0.0.1'].includes(new URL(web).hostname)||!['localhost','127.0.0.1'].includes(new URL(api).hostname))throw new Error('Local previews only');
const output=process.env.ADMIN_TEST_OUTPUT||require('node:path').join(require('node:os').tmpdir(),'rimna-admin-browser');
const user={id:'fixture-admin',name:'Demo Staff',email:'staff@example.test',emailVerified:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
const draw={id:'round-test',title:'Addis Weekly',currency:'ETB',priceMinor:50000,capacity:25000,status:'open',deadline:'2026-12-31T18:00:00Z',liveVideoUrl:''};
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({headless:true,...(process.env.ADMIN_TEST_BROWSER?{executablePath:process.env.ADMIN_TEST_BROWSER}:{})});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  let role='admin',signedIn=true,denied=false,apiOffline=false;
  const requests=[],writes=[],errors=[];
  await context.route('**/api/auth/**',route=>{
   const path=new URL(route.request().url()).pathname;
   let body=path.endsWith('/get-session')?(signedIn?{user,session:{id:'fixture-session',userId:user.id,expiresAt:'2030-01-01T00:00:00Z',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}:null):path.endsWith('/token')?{token:'fixture-only'}:{success:true};
   return route.fulfill({json:body});
  });
  await context.route(`${api}/**`,async route=>{
   const req=route.request(),url=new URL(req.url());requests.push(url.pathname);
   const headers={'Access-Control-Allow-Origin':web,'Access-Control-Allow-Headers':'Authorization, Content-Type, Idempotency-Key','Access-Control-Allow-Methods':'GET,PUT,OPTIONS'};
   if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
   if(apiOffline)return route.fulfill({status:503,headers,json:{error:'Service temporarily unavailable'}});
   if(denied)return route.fulfill({status:403,headers,json:{error:'Staff access required'}});
   if(req.method()==='PUT'){writes.push({path:url.pathname,body:req.postDataJSON()});return route.fulfill({headers,json:{success:true}})}
   let body=[];
   if(url.pathname.endsWith('/session'))body={role,userId:user.id};
   if(url.pathname.endsWith('/overview'))body={openRounds:3,issuedTickets:120,pendingPayments:2,refundRequired:1,asOf:new Date().toISOString(),collections:[{currency:'ETB',paidMinor:6000000,refundedMinor:50000},{currency:'USD',paidMinor:12500,refundedMinor:0}]};
   if(url.pathname.endsWith('/users'))body={items:url.searchParams.get('q')==='missing'?[]:[{...user,role:'admin',twoFactorEnabled:true}],hasMore:false};
   if(url.pathname.endsWith('/draws'))body=[draw];
   if(url.pathname.endsWith('/operations'))body={salesPaused:false,recoveryLocked:false,reason:'',pendingPayments:2,refundRequired:1,workerLastSeen:null,backups:[]};
   return route.fulfill({headers,json:body});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${web}/admin`,{waitUntil:'networkidle',timeout:120000});
  await page.getByRole('heading',{name:'Overview',exact:true}).waitFor();
  await page.getByText('Recorded collections',{exact:true}).waitFor();
  assert.equal(await page.locator('.admin-sidebar nav a').count(),11);
  await page.screenshot({path:`${output}/desktop-overview.png`,fullPage:true});
  await page.getByRole('link',{name:'Manage users',exact:true}).click();
  await page.getByRole('cell',{name:'staff@example.test',exact:true}).waitFor();
  await page.getByRole('textbox',{name:'Search users by name or email'}).fill('missing');
  await page.getByText('No accounts match your search.').waitFor();
  await page.getByRole('textbox',{name:'Search users by name or email'}).fill('Demo');
  await page.getByRole('cell',{name:'staff@example.test',exact:true}).waitFor();
  await page.screenshot({path:`${output}/desktop-users.png`,fullPage:true});
  await page.getByRole('link',{name:'Lotteries & rounds',exact:true}).click();
  await page.getByRole('button',{name:'Edit round',exact:true}).click();
  await page.screenshot({path:`${output}/round-editor.png`,fullPage:true});
  assert.equal(await page.getByLabel('Currency').isDisabled(),true);
  await page.getByLabel('Draw title').fill('Updated test round');
  await page.getByRole('button',{name:'Save draw',exact:true}).click();
  await page.waitForFunction(()=>!document.querySelector('.admin-records form'));
  assert.equal(writes.at(-1).body.title,'Updated test round');
  for(const id of ['orders','results','legacy','messages','audit','advertisers','operations','content']){
    await page.goto(`${web}/admin/${id}`,{waitUntil:'networkidle'});
    await page.locator('.admin-workspace h1').waitFor();
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${web}/admin/users`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Navigation',exact:true}).click();
  await page.getByRole('link',{name:'Lotteries & rounds',exact:true}).click();
  await page.getByRole('button',{name:'Edit round',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Navigation',exact:true}).getAttribute('aria-expanded'),'false');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'mobile page overflows');
  await page.screenshot({path:`${output}/mobile-rounds.png`,fullPage:true});
  role='reviewer';await page.goto(`${web}/admin`,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'+ New round',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'+ New round',exact:true}).isDisabled(),true);
  assert.equal(await page.locator('.admin-sidebar a[href="/admin/users"]').count(),0);
  const before=requests.filter(p=>p.endsWith('/users')).length;
  await page.goto(`${web}/admin/users`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'This workspace is unavailable'}).waitFor();
  assert.equal(requests.filter(p=>p.endsWith('/users')).length,before,'reviewer user data fetched');
  denied=true;await page.goto(`${web}/admin`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Staff access unavailable'}).waitFor();
  assert.equal(await page.locator('.admin-sidebar').count(),0);
  denied=false;apiOffline=true;await page.getByRole('button',{name:'Check again'}).click();
  await page.getByRole('alert').filter({hasText:'Service temporarily unavailable'}).waitFor();
  signedIn=false;apiOffline=false;await page.goto(`${web}/admin`,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Staff sign in'}).waitFor();
  assert.equal(await page.locator('.admin-sidebar').count(),0);
  assert.deepEqual(errors,[]);
  console.log('Passed: admin navigation, real form contracts, user search/empty state, mobile layout, reviewer restrictions, denied/failed/unauthenticated gates. API/auth responses were fixtures.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
