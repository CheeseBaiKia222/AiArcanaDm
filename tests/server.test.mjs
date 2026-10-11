import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createApp } from './d1-adapter.mjs';
import { CARDS, ATTRIBUTES } from '../frontend/js/game-engine.js';

test('persistent server: auth, access controls, social requests and authoritative duels', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'mosaic-test-'));
  const databasePath = path.join(directory, 'test.db');
  let app = createApp({ databasePath });
  let origin;
  const listen = async () => { await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve)); origin = `http://127.0.0.1:${app.server.address().port}`; };
  await listen();
  t.after(async () => { await app.close(); await rm(directory, { recursive: true, force: true }); });
  async function request(route, { method = 'GET', body, cookie, headers = {} } = {}) {
    const result = await fetch(origin + route, { method, headers: { ...(method !== 'GET' ? { Origin: origin, 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const text = await result.text();
    return { status: result.status, data: result.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text, cookie: result.headers.get('set-cookie')?.split(';')[0], headers: result.headers };
  }
  async function register(username) {
    const response = await request('/api/auth/register', { method: 'POST', body: { name: username + ' person', username, password: 'a-strong-test-password' } });
    assert.equal(response.status, 201, JSON.stringify(response.data));
    assert.match(response.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    return { ...response.data.user, cookie: response.cookie };
  }
  const a = await register('alice'), b = await register('basil'), c = await register('celeste');
  const mutation = (user, route, body = {}, method = 'POST') => request(route, { method, body, cookie: user.cookie });
  const state = async user => (await request('/api/state', { cookie: user.cookie })).data;

  await t.test('sessions and passwords are protected; cross-origin mutations are rejected', async () => {
    assert.equal((await request('/api/state')).status, 401);
    assert.equal((await request('/api/session', { cookie: a.cookie })).data.user.id, a.id);
    assert.equal((await mutation(a, '/api/auth/login', { username: 'alice', password: 'wrong-password' })).status, 401);
    assert.equal((await mutation(a, '/api/auth/register', { name: 'copy', username: 'alice', password: 'other-password' })).status, 409);
    assert.equal((await request('/api/profile', { method: 'PATCH', cookie: a.cookie, body: { bio: 'CSRF' }, headers: { Origin: 'https://attacker.example' } })).status, 403);
    assert.equal((await request('/api/profile', { method: 'PATCH', cookie: a.cookie, body: { bio: 'CSRF' }, headers: { Origin: '' } })).status, 403);
    assert.equal((await mutation(a, '/api/profile', { avatar: 'data:image/svg+xml;base64,PHN2Zz4=' }, 'PATCH')).status, 400);
    assert.equal((await mutation(a, '/api/profile', { avatar: 'data:image/png;base64,PHN2Zz4=' }, 'PATCH')).status, 400);
    assert.equal((await mutation(a, '/api/profile', { links: ['javascript:alert(1)'] }, 'PATCH')).status, 400);
    assert.equal((await mutation(a, '/api/profile', { links: [null] }, 'PATCH')).status, 400);
    assert.equal((await mutation(a, '/api/profile', { visibility: 'public', id: b.id, name: 'Alice' }, 'PATCH')).data.user.id, a.id);
    const userRow = app.db.prepare('SELECT password_hash FROM users WHERE id=?').get(a.id);
    assert.notEqual(userRow.password_hash, 'a-strong-test-password');
    assert.equal(JSON.stringify(await state(a)).includes('password_hash'), false);
  });

  let post, board;
  await t.test('posts, boards, likes, comments, follows, and profile privacy persist correctly', async () => {
    const published = await mutation(a, '/api/posts', { kind: 'project', category: 'Design', title: 'Paper worlds', caption: '<script>untrusted text stays text</script>', image: 'https://images.unsplash.com/photo-example', tags: ['Design'], tools: ['Paper'] });
    assert.equal(published.status, 201); post = published.data.post;
    assert.equal(post.category, 'Design');
    assert.equal((await mutation(b, '/api/likes', { postId: post.id })).data.liked, true);
    assert.equal((await mutation(b, '/api/comments', { postId: post.id, text: 'Beautiful paper texture.' })).status, 201);
    assert.equal((await mutation(b, '/api/comments', { postId: {}, text: 'invalid' })).status, 400);
    board = (await mutation(b, '/api/boards', { name: 'Quiet things' })).data.board;
    assert.equal((await mutation(b, `/api/boards/${board.id}/items`, { postId: post.id })).status, 200);
    assert.equal((await mutation(c, `/api/boards/${board.id}/items`, { postId: post.id })).status, 404);
    assert.equal((await state(b)).boards.find(item => item.id === board.id).postIds[0], post.id);
    assert.equal((await mutation(b, '/api/follows', { profileId: a.id })).data.following, true);
    assert.equal((await state(a)).notifications.length >= 3, true);
    await mutation(a, '/api/profile', { visibility: 'private' }, 'PATCH');
    const privateState = await state(b);
    assert.equal(privateState.profiles.some(item => item.id === a.id), false);
    assert.equal(privateState.posts.some(item => item.id === post.id), false);
    assert.equal(privateState.boards.find(item => item.id === board.id).postIds.includes(post.id), false);
    assert.equal((await mutation(b, '/api/likes', { postId: post.id })).status, 404);
    await mutation(a, '/api/profile', { visibility: 'connections' }, 'PATCH');
    assert.equal((await state(b)).posts.some(item => item.id === post.id), false);
    await mutation(a, '/api/follows', { profileId: b.id });
    assert.equal((await state(b)).posts.some(item => item.id === post.id), true);
    await mutation(a, '/api/profile', { visibility: 'public' }, 'PATCH');
  });

  let conversation;
  await t.test('message requests require recipient acceptance and remain participant-only', async () => {
    conversation = (await mutation(c, '/api/conversations', { profileId: a.id })).data.conversation;
    assert.equal(conversation.status, 'pending');
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/messages`, { text: 'Interested in your paper project.' })).status, 201);
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/messages`, { text: 'Unaccepted second message.' })).status, 403);
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/accept`)).status, 403);
    assert.equal((await request(`/api/conversations/${conversation.id}`, { cookie: b.cookie })).status, 404);
    assert.equal((await mutation(b, `/api/conversations/${conversation.id}/messages`, { text: 'Spoofed sender', senderId: a.id })).status, 404);
    assert.equal((await state(b)).conversations.some(item => item.id === conversation.id), false);
    assert.equal((await mutation(a, `/api/conversations/${conversation.id}/accept`)).status, 200);
    assert.equal((await mutation(a, `/api/conversations/${conversation.id}/messages`, { text: 'Thank you! Let’s make something.' })).status, 201);
    assert.equal((await request(`/api/conversations/${conversation.id}`, { cookie: c.cookie })).data.conversation.messages.length, 2);
    assert.equal((await request(`/api/conversations/${conversation.id}`, { cookie: c.cookie })).data.conversation.messages.at(-1).read, false);
    assert.equal((await mutation(b, `/api/conversations/${conversation.id}/read`)).status, 404);
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/read`)).data.conversation.messages.every(message => message.read), true);
    assert.equal((await state(c)).notifications.filter(item => item.conversationId === conversation.id).every(item => item.read), true);
  });

  await t.test('contact preferences distinguish mutual connections from unilateral following', async () => {
    await mutation(b, '/api/profile', { messagePolicy: 'connections', invitePolicy: 'connections' }, 'PATCH');
    assert.equal((await mutation(c, '/api/conversations', { profileId: b.id })).status, 403);
    assert.equal((await mutation(c, '/api/invitations', { profileId: b.id })).status, 403);
    await mutation(c, '/api/follows', { profileId: b.id });
    assert.equal((await mutation(c, '/api/conversations', { profileId: b.id })).status, 403);
    assert.equal((await mutation(c, '/api/invitations', { profileId: b.id })).status, 403);
    await mutation(b, '/api/follows', { profileId: c.id });
    assert.equal((await mutation(c, '/api/conversations', { profileId: b.id })).data.conversation.status, 'accepted');
    const invitation = (await mutation(c, '/api/invitations', { profileId: b.id })).data.invitation;
    assert.equal(invitation.status, 'pending');
    await mutation(c, `/api/invitations/${invitation.id}/respond`, { accept: false });
    await mutation(b, '/api/profile', { messagePolicy: 'everyone', invitePolicy: 'everyone' }, 'PATCH');
    await mutation(a, '/api/profile', { messagePolicy: 'nobody' }, 'PATCH');
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/messages`, { text: 'Preference was changed.' })).status, 403);
    await mutation(a, '/api/profile', { messagePolicy: 'everyone' }, 'PATCH');
  });

  await t.test('uploads validate bytes and size; source attribution and content types are enforced', async () => {
    const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    const uploaded=await mutation(a, '/api/profile', { avatar: onePixelPng }, 'PATCH');
    assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));
    assert.match(uploaded.data.user.avatar,/^\/uploads\/[a-f0-9-]{36}$/);
    assert.equal((await request(uploaded.data.user.avatar,{cookie:a.cookie})).status,200);
    assert.equal((await request(uploaded.data.user.avatar)).status,401);
    await mutation(a,'/api/profile',{visibility:'private'},'PATCH');
    assert.equal((await request(uploaded.data.user.avatar,{cookie:b.cookie})).status,404);
    await mutation(a,'/api/profile',{visibility:'public'},'PATCH');
    const oversized = Buffer.alloc(2 * 1024 * 1024 + 1);
    Buffer.from([137,80,78,71,13,10,26,10]).copy(oversized);
    assert.equal((await mutation(a, '/api/profile', { avatar: `data:image/png;base64,${oversized.toString('base64')}` }, 'PATCH')).status, 400);
    assert.equal((await mutation(a, '/api/posts', { kind: 'image', title: 'An image is required' })).status, 400);
    assert.equal((await mutation(a, '/api/posts', { kind: 'reflection', title: 'Words are required' })).status, 400);
    assert.equal((await mutation(a, '/api/posts', { kind: 'inspiration', title: 'Credit is required', image: onePixelPng })).status, 400);
    assert.equal((await mutation(a, '/api/posts', { kind: 'inspiration', category: 'Art', title: 'A credited small image', image: onePixelPng, source: 'Public domain illustration', sourceUrl: 'https://example.org/source' })).status, 201);
    assert.equal((await mutation(a, '/api/posts', { kind: 'inspiration', category: 'Design', title: 'A Mosaic original', image: '/assets/fallback.svg', source: 'Mosaic original artwork', sourceUrl: '/ASSET-SOURCES.md' })).status, 201);
    assert.equal((await mutation(a, '/api/posts', { kind: 'reflection', category: 'Unsupported', title: 'A thought', caption: 'Hello.' })).status, 400);
    assert.equal((await mutation(a, '/api/posts', { kind: 'reflection', category: 'Writing', title: 'A thought', caption: 'Hello.', profileId: b.id })).data.post.profileId, a.id);
  });

  let completedMatch;
  await t.test('a real five-round duel uses legal hidden hands and server-calculated scores', async () => {
    const invitation = (await mutation(a, '/api/invitations', { profileId: b.id })).data.invitation;
    assert.equal((await mutation(c, `/api/invitations/${invitation.id}/respond`, { accept: true })).status, 404);
    const accepted = await mutation(b, `/api/invitations/${invitation.id}/respond`, { accept: true });
    assert.equal(accepted.status, 200);
    const matchId = accepted.data.match.id;
    assert.equal((await mutation(b, `/api/invitations/${invitation.id}/respond`, { accept: true })).status, 409);
    let viewA = (await request(`/api/matches/${matchId}`, { cookie: a.cookie })).data.match;
    let viewB = (await request(`/api/matches/${matchId}`, { cookie: b.cookie })).data.match;
    const dealtA = [...viewA.hand], dealtB = [...viewB.hand];
    assert.equal(new Set([...dealtA, ...dealtB]).size, 10);
    assert.equal('hands' in viewA, false); assert.equal('selections' in viewA, false);
    assert.equal((await request(`/api/matches/${matchId}`, { cookie: c.cookie })).status, 404);
    assert.equal((await mutation(c, `/api/matches/${matchId}/moves`, { cardId: dealtA[0], playerId: a.id })).status, 404);
    assert.equal((await mutation(a, `/api/matches/${matchId}/moves`, { cardId: dealtB[0], playerId: b.id })).status, 400);
    let aScore = 0, bScore = 0;
    for (let round = 0; round < 5; round++) {
      const selectedA = dealtA[round], selectedB = dealtB[round];
      const first = await mutation(a, `/api/matches/${matchId}/moves`, { cardId: selectedA });
      assert.equal(first.status, 200); assert.equal(first.data.match.ownSubmitted, true);
      assert.equal((await mutation(a, `/api/matches/${matchId}/moves`, { cardId: selectedA })).status, 409);
      viewB = (await request(`/api/matches/${matchId}`, { cookie: b.cookie })).data.match;
      assert.equal(viewB.history.length, round);
      assert.equal(JSON.stringify(viewB).includes(selectedA), false, 'opponent selection must stay private until both submit');
      const second = await mutation(b, `/api/matches/${matchId}/moves`, { cardId: selectedB });
      assert.equal(second.status, 200);
      viewB = second.data.match;
      const valueA = CARDS.find(card => card.id === selectedA)[ATTRIBUTES[round]], valueB = CARDS.find(card => card.id === selectedB)[ATTRIBUTES[round]];
      aScore += valueA === valueB ? 0.5 : valueA > valueB ? 1 : 0;
      bScore += valueA === valueB ? 0.5 : valueB > valueA ? 1 : 0;
      assert.equal(viewB.scores[a.id], aScore); assert.equal(viewB.scores[b.id], bScore);
      assert.equal(viewB.history[round].attribute, ATTRIBUTES[round]);
      assert.equal(viewB.history[round].cards[a.id], selectedA);
      if (round < 4) assert.equal((await mutation(a, `/api/matches/${matchId}/moves`, { cardId: selectedA })).status, 400);
    }
    completedMatch = viewB;
    assert.equal(completedMatch.status, 'completed'); assert.equal(completedMatch.round, 5);
    assert.equal(completedMatch.scores[a.id] + completedMatch.scores[b.id], 5);
    assert.equal(completedMatch.winnerId, aScore === bScore ? null : aScore > bScore ? a.id : b.id);
    assert.equal((await mutation(a, `/api/matches/${matchId}/moves`, { cardId: dealtA[0] })).status, 409);
  });

  await t.test('rejections, reconnects, abandoned matches and block policies are enforced', async () => {
    const withdrawn = (await mutation(a, '/api/invitations', { profileId: b.id })).data.invitation;
    assert.equal((await mutation(a, `/api/invitations/${withdrawn.id}/respond`, { accept: true })).status, 403);
    assert.equal((await mutation(a, `/api/invitations/${withdrawn.id}/respond`, { accept: false })).data.invitation.status, 'cancelled');
    const rejected = (await mutation(a, '/api/invitations', { profileId: b.id })).data.invitation;
    assert.equal((await mutation(b, `/api/invitations/${rejected.id}/respond`, { accept: false })).data.invitation.status, 'rejected');
    const pending = (await mutation(a, '/api/invitations', { profileId: b.id })).data.invitation;
    let match = (await mutation(b, `/api/invitations/${pending.id}/respond`, { accept: true })).data.match;
    const beforeRestart = (await state(a)).posts.find(item => item.id === post.id);
    await app.close(); app = createApp({ databasePath }); await listen();
    assert.deepEqual((await state(a)).posts.find(item => item.id === post.id), beforeRestart);
    assert.equal((await request('/api/session', { cookie: a.cookie })).data.user.id, a.id);
    assert.equal((await request(`/api/conversations/${conversation.id}`, { cookie: c.cookie })).data.conversation.messages.every(message => message.read), true);
    assert.equal((await request(`/api/matches/${match.id}`, { cookie: b.cookie })).data.match.hand.length, 5);
    assert.equal((await request(`/api/matches/${completedMatch.id}`, { cookie: b.cookie })).data.match.status, 'completed');
    match = (await mutation(a, `/api/matches/${match.id}/abandon`)).data.match;
    assert.equal(match.status, 'abandoned');
    assert.equal((await mutation(b, `/api/matches/${match.id}/moves`, { cardId: 'the-fool' })).status, 409);
    await mutation(a, '/api/profile', { invitePolicy: 'nobody' }, 'PATCH');
    assert.equal((await mutation(c, '/api/invitations', { profileId: a.id })).status, 403);
    await mutation(a, '/api/profile', { invitePolicy: 'everyone' }, 'PATCH');
    const beforeBlock = (await mutation(c, '/api/invitations', { profileId: a.id })).data.invitation;
    const blockedMatch = (await mutation(a, `/api/invitations/${beforeBlock.id}/respond`, { accept: true })).data.match;
    const cancelled = (await mutation(c, '/api/invitations', { profileId: a.id })).data.invitation;
    assert.equal((await mutation(a, '/api/blocks', { profileId: c.id })).status, 200);
    assert.equal((await mutation(c, '/api/conversations', { profileId: a.id })).status, 404);
    assert.equal((await mutation(c, `/api/conversations/${conversation.id}/messages`, { text: 'Blocked contact' })).status, 403);
    assert.equal((await mutation(c, '/api/invitations', { profileId: a.id })).status, 404);
    assert.equal((await state(c)).invitations.find(item => item.id === cancelled.id).status, 'cancelled');
    assert.equal((await request(`/api/matches/${blockedMatch.id}`, { cookie: c.cookie })).data.match.status, 'abandoned');
    assert.equal((await mutation(a, '/api/reports', { profileId: c.id, reason: 'Please review repeated unwanted contact.' })).status, 201);
    const oldCookie = c.cookie;
    assert.equal((await mutation(c, '/api/auth/logout')).status, 200);
    assert.equal((await request('/api/state', { cookie: oldCookie })).status, 401);
  });
});
