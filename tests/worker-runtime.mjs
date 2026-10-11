import '../scripts/sites-env.mjs';
import {Miniflare} from 'miniflare';
import {readFileSync,readdirSync} from 'node:fs';
import assert from 'node:assert/strict';
const modulePaths=readdirSync('dist/server',{recursive:true}).filter(f=>String(f).endsWith('.js')).sort((a,b)=>a==='index.js'?-1:b==='index.js'?1:0);
const mf=new Miniflare({modules:modulePaths.map(p=>({type:'ESModule',path:'dist/server/'+p})),modulesRoot:'dist/server',compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],assets:{directory:'dist/client',binding:'ASSETS',routerConfig:{has_user_worker:true}},host:'127.0.0.1',port:process.argv.includes('--preview')?4319:0,inspectorPort:0});
try{
 const db=await mf.getD1Database('DB');
 for(const file of readdirSync('database/migrations').filter(f=>f.endsWith('.sql')).sort())for(const sql of readFileSync('database/migrations/'+file,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 const base='http://localhost';
 const request=async(route,body,cookie,method=body?'POST':'GET')=>{const r=await mf.dispatchFetch(base+route,{method,headers:{Origin:base,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});const text=await r.text();if(!text)throw Error(route+' returned empty '+r.status);return {status:r.status,data:JSON.parse(text),cookie:r.headers.get('set-cookie')?.split(';')[0]};};
 const home=await mf.dispatchFetch(base+'/');assert.equal(home.status,200);assert.match(await home.text(),/Parcarna/);
 assert.equal((await request('/api/health')).status,200);
 const a=await request('/api/auth/register',{name:'Runtime A',username:'runtime_a',password:'runtime-password-a'});assert.equal(a.status,201,JSON.stringify(a.data));
 const b=await request('/api/auth/register',{name:'Runtime B',username:'runtime_b',password:'runtime-password-b'});assert.equal(b.status,201,JSON.stringify(b.data));
 const persona=await request('/api/profile',{persona:{presentation:'velvet',answers:[0,0,0,0,0,0],interests:['Jazz'],notes:'Late nights',arcana:'chariot',amount:999},onboarded:true},a.cookie,'PATCH');assert.equal(persona.status,200);assert.equal(persona.data.user.persona.arcana,'moon');
 const malformed=await request('/api/profile',{persona:{presentation:'nocturne',answers:[],interests:['Jazz'],notes:''}},a.cookie,'PATCH');assert.equal(malformed.status,400);
 const state=await request('/api/state',null,a.cookie);assert.equal(state.status,200);assert.equal(state.data.profiles.length,2);
 const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
 const uploaded=await request('/api/profile',{avatar:png},a.cookie,'PATCH');assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));
 const image=await mf.dispatchFetch(base+uploaded.data.user.avatar,{headers:{Cookie:a.cookie}});assert.equal(image.status,200);assert.equal(image.headers.get('content-type'),'image/png');await image.arrayBuffer();
 const shared=await request('/api/posts',{kind:'idea',title:'Marvel heroes',caption:'Poster composition'},a.cookie);assert.equal(shared.status,201);assert.equal(shared.data.post.arcana,'chariot');
 assert.equal((await request('/api/reposts',{postId:shared.data.post.id},b.cookie)).status,200);
 const reader=await request('/api/state',null,b.cookie);assert.equal(reader.data.reposts.length,1);assert.equal(reader.data.affinities[0].arcana,'chariot');
 const video=new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109,0,0,0,0,105,115,111,109,109,112,52,50]);
 const uploadedVideo=await mf.dispatchFetch(base+'/api/media',{method:'POST',headers:{Cookie:a.cookie,Origin:base,'Content-Type':'video/mp4'},body:video});assert.equal(uploadedVideo.status,201);const media=await uploadedVideo.json();
 const mediaRange=await mf.dispatchFetch(base+media.url,{headers:{Cookie:b.cookie,Range:'bytes=4-7'}});assert.equal(mediaRange.status,206);assert.equal(await mediaRange.text(),'ftyp');
 assert.equal((await request('/api/posts',{kind:'video',title:'Fantasy clip',video:media.url},a.cookie)).status,201);
 const invite=await request('/api/invitations',{profileId:b.data.user.id},a.cookie);assert.equal(invite.status,201,JSON.stringify(invite.data));
 const accepted=await request('/api/invitations/'+invite.data.invitation.id+'/respond',{accept:true},b.cookie);assert.equal(accepted.status,200,JSON.stringify(accepted.data));
 const match=accepted.data.match;assert.equal(match.personas[a.data.user.id].arcana,'moon');
 await request('/api/profile',{persona:{presentation:'nocturne',answers:[1,1,1,1,1,1],interests:['Jazz'],notes:'New vibe'}},a.cookie,'PATCH');
 for(let round=0;round<5;round++){
  const left=await request('/api/matches/'+match.id,null,a.cookie),right=await request('/api/matches/'+match.id,null,b.cookie);
  for(const [hand,cookie] of [[left.data.match.hand,a.cookie],[right.data.match.hand,b.cookie]]){const moved=await request('/api/matches/'+match.id+'/moves',{cardId:hand[0]},cookie);assert.equal(moved.status,200,JSON.stringify(moved.data));}
 }
 const final=await request('/api/matches/'+match.id,null,a.cookie);assert.equal(final.data.match.status,'completed');assert.equal(final.data.match.history.length,5);
 const {cardById}=await import('../frontend/js/game-engine.js');for(const round of final.data.match.history){assert.equal(round.values[a.data.user.id],cardById(round.cards[a.data.user.id])[round.attribute]+(round.attribute==='imagination'?1:0));}
 assert.equal((await request('/api/session',null,a.cookie)).data.user.persona.arcana,'chariot');
 assert.equal((await request('/api/auth/login',{username:'runtime_a',password:'runtime-password-a'})).data.user.persona.arcana,'chariot');
 console.log('Worker runtime passed: frontend, authentication, D1 persistence, R2 media/ranges, social arcana/reposts, complete multiplayer duel.');
 if(process.argv.includes('--preview')){console.log('Local: http://127.0.0.1:4319');await new Promise(resolve=>{process.once('SIGINT',resolve);process.once('SIGTERM',resolve)});}
}finally{await mf.dispose();}
