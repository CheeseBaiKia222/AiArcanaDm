import '../scripts/sites-env.mjs';
import {Miniflare} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const modulePaths=readdirSync('dist/server',{recursive:true}).filter(f=>String(f).endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const mf=new Miniflare({modules:modulePaths.map(p=>({type:'ESModule',path:'dist/server/'+p})),modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true}},host:'127.0.0.1',port:4318,inspectorPort:0});
try{
 const db=await mf.getD1Database('DB');
 for(const file of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+file,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const base='http://localhost';
 const request=async(route,body,cookie,method=body?'POST':'GET')=>{const r=await mf.dispatchFetch(base+route,{method,headers:{Origin:base,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();if(!text)throw Error(route+' returned empty '+r.status);return {status:r.status,data:JSON.parse(text),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 const home=await mf.dispatchFetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/Parcarna/);
 assert.equal((await request('/api/health')).status,200);
 const a=await request('/api/auth/register',{name:'Runtime A',username:'runtime_a',password:'runtime-password-a'});assert.equal(a.status,201,JSON.stringify(a.data));
 const b=await request('/api/auth/register',{name:'Runtime B',username:'runtime_b',password:'runtime-password-b'});assert.equal(b.status,201,JSON.stringify(b.data));
 const state=await request('/api/state',null,a.cookie);assert.equal(state.status,200);assert.equal(state.data.profiles.length,2);
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
 const uploaded=await request('/api/profile',{avatar:png},a.cookie,'PATCH');assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));
 const image=await mf.dispatchFetch(base+uploaded.data.user.avatar,{headers:{Cookie:a.cookie}});assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');await image.arrayBuffer();
 const invite=await request('/api/invitations',{profileId:b.data.user.id},a.cookie);assert.equal(invite.status,201,JSON.stringify(invite.data));
 const accepted=await request('/api/invitations/'+invite.data.invitation.id+'/respond',{accept:true},b.cookie);assert.equal(accepted.status,200,JSON.stringify(accepted.data));
 const match=accepted.data.match;
 for(let round=0;round<5;round++){
  const left=await request('/api/matches/'+match.id,null,a.cookie),right=await request('/api/matches/'+match.id,null,b.cookie);
  for(const [hand,cookie] of [[left.data.match.hand,a.cookie],[right.data.match.hand,b.cookie]]){const moved=await request('/api/matches/'+match.id+'/moves',{cardId:hand[0]},cookie);assert.equal(moved.status,200,JSON.stringify(moved.data));}
 }
 const final=await request('/api/matches/'+match.id,null,a.cookie);assert.equal(final.data.match.status,'completed');assert.equal(final.data.match.history.length,5);
 console.log('Worker runtime passed: frontend, authentication, D1 persistence, R2 uploads, complete multiplayer duel.');
 if(process.argv.includes('--preview')){console.log('Local: http://127.0.0.1:4318');await new Promise(resolve=>{process.once('SIGINT',resolve);process.once('SIGTERM',resolve)});}
}finally{await mf.dispose();}
