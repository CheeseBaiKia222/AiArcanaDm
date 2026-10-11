import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './d1-adapter.mjs';
test('simultaneous duel moves cannot overwrite one another and may be retried',async t=>{
 const app=createApp();await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>app.close());const origin='http://127.0.0.1:'+app.server.address().port;
 async function req(route,body,cookie){const r=await fetch(origin+route,{method:body?'POST':'GET',headers:{Origin:origin,'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 const a=await req('/api/auth/register',{name:'A',username:'player_a',password:'test-password-a'}),b=await req('/api/auth/register',{name:'B',username:'player_b',password:'test-password-b'});
 const invite=await req('/api/invitations',{profileId:b.data.user.id},a.cookie);const accepted=await req('/api/invitations/'+invite.data.invitation.id+'/respond',{accept:true},b.cookie);const match=accepted.data.match;
 const own=await req('/api/matches/'+match.id,null,a.cookie);const moves=[{cardId:own.data.match.hand[0]},{cardId:match.hand[0]}],cookies=[a.cookie,b.cookie];
 const results=await Promise.all(moves.map((m,i)=>req('/api/matches/'+match.id+'/moves',m,cookies[i])));
 for(let i=0;i<2;i++){assert.ok([200,409].includes(results[i].status));if(results[i].status===409)assert.equal((await req('/api/matches/'+match.id+'/moves',moves[i],cookies[i])).status,200);}
 const final=await req('/api/matches/'+match.id,null,a.cookie);assert.equal(final.data.match.round,1);assert.equal(final.data.match.history.length,1);assert.equal(app.db.prepare('SELECT count(*) n FROM moves').get().n,2);
});
