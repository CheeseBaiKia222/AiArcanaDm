import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './d1-adapter.mjs';
import {suggestPostArcana,activityAffinities} from '../frontend/js/post-arcana.js';
import {migratePreview} from '../scripts/migrate-preview.mjs';
import {createHash} from 'node:crypto';

test('content arcana separates superhero, fantasy, and unrelated text; activity is reversible and bounded',()=>{
  assert.equal(suggestPostArcana({title:'Marvel superhero poster'}),'chariot');
  assert.equal(suggestPostArcana({title:'A fantasy world with dragons'}),'moon');
  assert.equal(suggestPostArcana({title:'Earth documentary'}),'fool'); // "art" must not match inside "earth".
  const posts=[{id:'p',profileId:'a',title:'Marvel heroes'}];
  const once=activityAffinities(posts,'b',['p'],[{profileId:'b',postId:'p'}],[{profileId:'b',postId:'p'},{profileId:'b',postId:'p'}]);
  assert.deepEqual(once,[{arcana:'chariot',score:4,postCount:1}]);
  assert.deepEqual(activityAffinities(posts,'b'),[]);
});

test('social posts preserve credit and privacy, derive arcana, and reflect real activity',async t=>{
  const app=createApp();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
  t.after(()=>app.close());const origin='http://127.0.0.1:'+app.server.address().port;
  const request=async(path,{user,method='GET',body,raw,type='application/json',headers={}}={})=>{
    const res=await fetch(origin+path,{method,headers:{Origin:origin,'Content-Type':type,...(user?{Cookie:user.cookie}:{}),...headers},...(!['GET','HEAD'].includes(method)?{body:raw??JSON.stringify(body||{})}:{})});
    const bytes=Buffer.from(await res.arrayBuffer());return {status:res.status,headers:res.headers,bytes,data:res.headers.get('content-type')?.includes('application/json')?JSON.parse(bytes.toString()):null};
  };
  const register=async username=>{const res=await request('/api/auth/register',{method:'POST',body:{username,name:username,password:'test-social-password-2026'}});assert.equal(res.status,201);return {id:res.data.user.id,cookie:res.headers.get('set-cookie').split(';')[0]};};
  const a=await register('social_author'),b=await register('social_reader'),c=await register('social_third');
  const mutate=(user,path,body,method='POST')=>request(path,{user,method,body});
  const getState=async user=>(await request('/api/state',{user})).data;
  const created=await mutate(a,'/api/posts',{kind:'idea',title:'Marvel superhero poster',caption:'An idea for a heroes collection.',source:'Creator Studio',sourceUrl:'https://example.com/original'});
  assert.equal(created.status,201);const post=created.data.post;assert.equal(post.arcana,'chariot');
  assert.equal((await getState(a)).affinities[0].score,3);
  assert.equal((await mutate(a,'/api/posts',{kind:'event',title:'A book reading',caption:'Discussing a novel.',arcana:'invented'})).status,400);
  const event=await mutate(a,'/api/posts',{kind:'event',title:'A book reading',caption:'Discussing a novel.',arcana:'hermit'});assert.equal(event.status,201);
  const experience=await mutate(a,'/api/posts',{kind:'experience',title:'Hiking in a new city',caption:'My first hike.'});assert.equal(experience.data.post.arcana,'fool');
  assert.equal((await mutate(a,'/api/reposts',{postId:post.id})).status,400);
  await mutate(b,'/api/reposts',{postId:post.id});await mutate(b,'/api/reposts',{postId:post.id});
  await mutate(b,'/api/likes',{postId:post.id});
  await mutate(b,'/api/comments',{postId:post.id,text:'Love the artwork.'});
  await mutate(b,'/api/comments',{postId:post.id,text:'Another thought.'});
  let state=await getState(b);assert.equal(state.reposts.length,1);assert.equal(state.affinities[0].score,4);
  const visible=state.posts.find(p=>p.id===post.id);assert.equal(visible.profileId,a.id);assert.equal(visible.sourceUrl,'https://example.com/original');assert.equal(visible.repostCount,1);assert.equal(visible.likeCount,1);assert.equal(visible.commentCount,2);
  assert.deepEqual((await getState(c)).affinities,[]);
  await mutate(b,'/api/likes',{postId:post.id});await mutate(b,'/api/reposts',{postId:post.id},'DELETE');
  assert.equal((await getState(b)).affinities[0].score,1);
  await mutate(b,'/api/reposts',{postId:post.id});
  await mutate(a,'/api/profile',{visibility:'private'},'PATCH');
  state=await getState(b);assert.equal(state.posts.length,0);assert.deepEqual(state.reposts,[]);assert.deepEqual(state.affinities,[]);
  assert.equal((await mutate(b,'/api/reposts',{postId:post.id})).status,404);
  assert.equal((await mutate(b,'/api/comments',{postId:post.id,text:'Hidden'})).status,404);
  await mutate(a,'/api/profile',{visibility:'public'},'PATCH');
  assert.equal((await getState(b)).reposts.length,1);
  await mutate(b,'/api/blocks',{profileId:a.id});
  assert.deepEqual((await getState(b)).affinities,[]);
  assert.equal((await mutate(b,'/api/reposts',{postId:post.id})).status,404);

  // A valid MP4 container header is sufficient to test transport, range handling, and ownership.
  const video=Buffer.concat([Buffer.from([0,0,0,24]),Buffer.from('ftypisom'),Buffer.alloc(4),Buffer.from('isommp42'),Buffer.alloc(16)]);
  const uploaded=await request('/api/media',{user:a,method:'POST',type:'video/mp4',raw:video});assert.equal(uploaded.status,201);
  const videoURL=uploaded.data.url;
  assert.equal((await request(videoURL)).status,401);
  const range=await request(videoURL,{user:c,headers:{Range:'bytes=4-11'}});assert.equal(range.status,206);assert.equal(range.bytes.toString(),'ftypisom');assert.equal(range.headers.get('content-range'),'bytes 4-11/40');
  assert.equal((await request(videoURL,{user:c,headers:{Range:'bytes=999-'}})).status,416);
  assert.equal((await request(videoURL,{user:b})).status,404);
  const vpost=await mutate(a,'/api/posts',{kind:'video',title:'Fantasy worldbuilding',video:videoURL});assert.equal(vpost.status,201);assert.equal(vpost.data.post.arcana,'moon');
  assert.equal((await mutate(c,'/api/posts',{kind:'video',title:'Not my video',video:videoURL})).status,400);
  assert.equal((await mutate(a,'/api/posts',{kind:'image',title:'Wrong media type',image:videoURL})).status,400);
  assert.equal((await mutate(a,'/api/posts',{kind:'video',title:'Unsafe',video:'javascript:alert(1)'})).status,400);
  assert.equal((await request('/api/media',{user:a,method:'POST',type:'video/mp4',raw:Buffer.from('<html>not video</html>')})).status,400);
  assert.equal((await request('/api/media',{user:a,method:'POST',type:'image/svg+xml',raw:Buffer.from('<svg/>')})).status,415);
  assert.equal((await request('/api/media',{user:a,method:'POST',type:'video/mp4',raw:Buffer.alloc(20*1024*1024+1)})).status,413);
  assert.equal((await request('/api/media',{user:a,method:'POST',type:'video/mp4',raw:video,headers:{Origin:'https://untrusted.example'}})).status,403);
});

test('existing previews receive the repost migration without losing accounts or replaying migrations',async t=>{
  const app=createApp();t.after(()=>app.close());
  app.db.exec('DROP TABLE reposts');
  await migratePreview(app.binding);
  assert.ok(app.db.prepare("SELECT name FROM sqlite_master WHERE name='reposts'").get());
  await migratePreview(app.binding);
  assert.equal(app.db.prepare('SELECT COUNT(*) AS n FROM preview_migrations').get().n,4);
});

test('a repost outside the first feed page remains visible and keeps the original pagination cursor',async t=>{
  const app=createApp();await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));t.after(()=>app.close());
  const origin='http://127.0.0.1:'+app.server.address().port,token='1'.repeat(64);
  for(const id of ['author','reader']){
    app.db.prepare('INSERT INTO users VALUES (?,?,?,?)').run(id,id,'unused','2026-01-01');
    app.db.prepare('INSERT INTO profiles VALUES (?,?)').run(id,JSON.stringify({id,name:id,visibility:'public'}));
  }
  app.db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(createHash('sha256').update(token).digest('hex'),'reader',Date.now()+60000);
  for(let i=0;i<130;i++){
    const post={id:'post'+i,profileId:'author',kind:'idea',title:'Marvel superheroes',caption:'Poster',createdAt:new Date(Date.UTC(2026,0,1,0,i)).toISOString()};
    app.db.prepare('INSERT INTO posts VALUES (?,?,?,?)').run(post.id,'author',JSON.stringify(post),post.createdAt);
  }
  app.db.prepare('INSERT INTO reposts VALUES (?,?,?)').run('reader','post0',new Date().toISOString());
  const res=await fetch(origin+'/api/state',{headers:{Cookie:'mosaic_session='+token}});const state=await res.json();
  assert.equal(res.status,200);assert.ok(state.posts.some(p=>p.id==='post0'));assert.equal(state.reposts[0].postId,'post0');assert.equal(state.pagination.hasMorePosts,true);
  assert.equal(state.pagination.nextCursor,new Date(Date.UTC(2026,0,1,0,10)).toISOString());
});
