import { randomBytes, randomInt, randomUUID, createHash, timingSafeEqual } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { CARDS, ATTRIBUTES } from '../public/game-engine.js';
async function asyncFilter(items,predicate){const flags=await Promise.all(items.map(predicate));return items.filter((_,i)=>flags[i]);}
async function derivePassword(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return Buffer.from(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Buffer.from(salt,'hex'),iterations:100000},key,256));}
async function passwordHash(password){const salt=randomBytes(16).toString('hex');return 'pbkdf2:'+salt+':'+(await derivePassword(password,salt)).toString('hex');}
async function passwordMatches(password,stored){const parts=stored.split(':');const salt=parts.length===3?parts[1]:'00'.repeat(16);const expected=parts.length===3?Buffer.from(parts[2],'hex'):Buffer.alloc(32);const actual=await derivePassword(password,salt);return expected.length===32&&timingSafeEqual(actual,expected);}
const now = () => new Date().toISOString();
const id = () => randomUUID();
const digest = value => createHash('sha256').update(value).digest('hex');
const MAX_BODY = 3 * 1024 * 1024;
const DAY = 24 * 60 * 60 * 1000;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.md': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
class ApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
}
const fail = (status, message) => { throw new ApiError(status, message); };
const cleanText = (value, max = 400, required = false) => {
    if (typeof value !== 'string') {
        if (value == null && !required)
            return '';
        fail(400, 'Please enter valid text.');
    }
    const result = value.trim();
    if (result.length > max || (required && !result))
        fail(400, `Please enter ${required ? '1–' : 'no more than '}${max} characters.`);
    return result;
};
const tags = value => {
    if (value == null)
        return [];
    if (!Array.isArray(value) || value.length > 20)
        fail(400, 'Choose up to 20 tags.');
    return [...new Set(value.map(item => cleanText(item, 50, true)))];
};
const choice = (value, options, fallback) => value == null ? fallback : options.includes(value) ? value : fail(400, 'That setting is not supported.');
const urlValue = (value, image = false) => {
    if (!value)
        return '';
    if (typeof value !== 'string')
        fail(400, 'Enter a valid URL or supported image.');
    if (image && value.startsWith('data:')) {
        const found = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
        if (!found || Buffer.byteLength(found[2], 'base64') > 2 * 1024 * 1024)
            fail(400, 'Images must be PNG, JPEG, WebP or GIF and at most 2 MB.');
        const bytes = Buffer.from(found[2], 'base64');
        const valid = found[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : found[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : found[1] === 'gif' ? /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6)) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
        if (!valid)
            fail(400, 'This file does not match its image type.');
        return value;
    }
    if (image && /^\/assets\/[A-Za-z0-9_./-]+$/.test(value) && !value.includes('..'))
        return value;
    if(image && /^\/uploads\/[a-f0-9-]{36}$/.test(value))return value;
    if (value.length > 2048)
        fail(400, 'That URL is too long.');
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        fail(400, 'Enter a complete https:// URL.');
    }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password)
        fail(400, 'Use an HTTPS URL without embedded credentials.');
    return parsed.href;
};
export async function handleApi(request, env) {
    const db = env.DB.withSession ? env.DB.withSession('first-primary') : env.DB;
    const configuredOrigin = new URL(request.url).origin;
    const secureCookies = new URL(request.url).protocol === 'https:';
    let revision = (await db.prepare('SELECT revision FROM app_revision WHERE id=1').first())?.revision || 0;
    let pending = null;
    const sql = async (query, ...params) => (await db.prepare(query).bind(...params).all()).results;
    const one = async (query, ...params) => (await db.prepare(query).bind(...params).first()) || undefined;
    const commit = async (statements) => {
        if (!statements.length)
            return;
        try {
            const result = await db.batch([
                db.prepare('INSERT INTO write_guard (valid) SELECT CASE WHEN COALESCE((SELECT revision FROM app_revision WHERE id=1),0)=? THEN 1 ELSE 0 END').bind(revision),
                ...statements,
                db.prepare('DELETE FROM write_guard'),
                db.prepare('SELECT revision FROM app_revision WHERE id=1')
            ]);
            revision = result.at(-1).results[0]?.revision || 0;
        }
        catch (error) {
            if (/CHECK constraint failed|UNIQUE constraint failed/i.test(String(error)))
                fail(409, 'This changed in another session. Refresh and try again.');
            throw error;
        }
    };
    const run = async (query, ...params) => {
        const statement = db.prepare(query).bind(...params);
        if (pending) {
            pending.push(statement);
            return;
        }
        await commit([statement]);
    };
    const transaction = async (action) => {
        if (pending)
            throw Error('Nested transaction');
        pending = [];
        try {
            await action();
            const statements = pending;
            pending = null;
            await commit(statements);
        }
        finally {
            pending = null;
        }
    };
    const profile = async (userId) => { if (typeof userId !== 'string')
        return null; const row = (await one('SELECT data FROM profiles WHERE id=?', userId)); return row ? JSON.parse(row.data) : null; };
    const blocked = async (a, b) => Boolean((await one('SELECT 1 FROM blocks WHERE (profile_id=? AND target_id=?) OR (profile_id=? AND target_id=?)', a, b, b, a)));
    const follows = async (a, b) => Boolean((await one('SELECT 1 FROM follows WHERE profile_id=? AND target_id=?', a, b)));
    const connected = async (a, b) => (await follows(a, b)) && (await follows(b, a));
    const canSee = async (viewer, target) => {
        if (viewer === target.id)
            return true;
        if ((await blocked(viewer, target.id)))
            return false;
        return target.visibility === 'public' || (target.visibility === 'connections' && (await connected(viewer, target.id)));
    };
    const requireTarget = async (userId, targetId) => {
        if (typeof targetId !== 'string' || targetId === userId)
            fail(400, 'Choose another person.');
        const target = (await profile(targetId));
        if (!target || !(await canSee(userId, target)))
            fail(404, 'This profile is unavailable.');
        return target;
    };
    const contactAllowed = async (userId, targetId, type) => {
        const target = (await requireTarget(userId, targetId));
        const policy = target[type === 'invite' ? 'invitePolicy' : 'messagePolicy'];
        if (policy === 'nobody' || (policy === 'connections' && !(await connected(userId, targetId))))
            fail(403, `${target.name} only accepts ${type === 'invite' ? 'game invitations' : 'messages'} according to their privacy settings.`);
        return target;
    };
    const notify = async (userId, notification) => {
        const item = { id: id(), ...notification, read: false, createdAt: now() };
        (await run('INSERT INTO notifications VALUES (?,?,?,?)', item.id, userId, JSON.stringify(item), item.createdAt));
        return item;
    };
    const getPost = async (userId, postId) => {
        if (typeof postId !== 'string')
            fail(400, 'Choose a post.');
        const row = (await one('SELECT * FROM posts WHERE id=?', postId || ''));
        if (!row || !(await canSee(userId, (await profile(row.profile_id)))))
            fail(404, 'This post is unavailable.');
        return JSON.parse(row.data);
    };
    const getConversation = async (userId, conversationId) => {
        const row = (await one('SELECT * FROM conversations WHERE id=? AND (participant_a=? OR participant_b=?)', conversationId, userId, userId));
        if (!row)
            fail(404, 'This conversation is unavailable.');
        return row;
    };
    const serializeConversation = async (row, viewerId) => {
        const readAt = (await one('SELECT read_at FROM conversation_reads WHERE conversation_id=? AND profile_id=?', row.id, viewerId))?.read_at || '';
        return {
            id: row.id, participantIds: [row.participant_a, row.participant_b], requestedBy: row.requested_by, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at,
            messages: (await sql('SELECT * FROM (SELECT * FROM messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 100) ORDER BY created_at', row.id)).map(item => ({ id: item.id, senderId: item.sender_id, text: item.text, createdAt: item.created_at, read: item.sender_id === viewerId || item.created_at <= readAt }))
        };
    };
    const serializeInvitation = row => ({ id: row.id, fromId: row.from_id, toId: row.to_id, status: row.status, matchId: row.match_id, createdAt: row.created_at, updatedAt: row.updated_at });
    const getMatch = async (userId, matchId) => {
        const row = (await one('SELECT data FROM matches WHERE id=? AND (participant_a=? OR participant_b=?)', matchId, userId, userId));
        if (!row)
            fail(404, 'This match is unavailable.');
        return JSON.parse(row.data);
    };
    const serializeMatch = (match, userId) => ({ id: match.id, status: match.status, participantIds: match.participantIds, opponentId: match.participantIds.find(item => item !== userId), round: match.round, attribute: ATTRIBUTES[match.round] || null, hand: match.hands[userId].filter(cardId => !match.history.some(round => round.cards[userId] === cardId)), ownSubmitted: Boolean(match.selections[userId]), scores: match.scores, history: match.history, winnerId: match.winnerId, abandonedBy: match.abandonedBy || null, createdAt: match.createdAt, updatedAt: match.updatedAt });
    const saveMatch = async (match) => (await run('UPDATE matches SET data=?,updated_at=? WHERE id=?', JSON.stringify(match), match.updatedAt, match.id));
    const state = async (userId) => {
        const visible = (await asyncFilter((await sql('SELECT data FROM profiles')).map(row => JSON.parse(row.data)), async (item) => (await canSee(userId, item))));
        const visibleIds = new Set(visible.map(item => item.id));
        const posts = (await Promise.all((await sql('SELECT * FROM posts ORDER BY created_at DESC LIMIT 1000')).filter(row => visibleIds.has(row.profile_id)).slice(0, 120).map(async (row) => {
            const post = JSON.parse(row.data);
            post.likeCount = (await one('SELECT COUNT(*) AS count FROM likes WHERE post_id=?', post.id)).count;
            post.commentCount = (await one('SELECT COUNT(*) AS count FROM comments WHERE post_id=?', post.id)).count;
            return post;
        })));
        const postIds = new Set(posts.map(item => item.id));
        return {
            profiles: visible.slice(0, 200), posts,
            boards: (await Promise.all((await sql('SELECT * FROM boards ORDER BY created_at DESC LIMIT 300')).filter(row => visibleIds.has(row.profile_id)).map(async (row) => ({ ...JSON.parse(row.data), postIds: (await sql('SELECT post_id FROM board_items WHERE board_id=? ORDER BY created_at DESC', row.id)).map(item => item.post_id).filter(postId => postIds.has(postId)) })))),
            follows: (await sql('SELECT * FROM follows')).filter(row => visibleIds.has(row.profile_id) && visibleIds.has(row.target_id)).map(row => ({ profileId: row.profile_id, targetId: row.target_id })),
            likes: (await sql('SELECT * FROM likes WHERE profile_id=?', userId)).map(row => ({ profileId: row.profile_id, postId: row.post_id })),
            comments: (await sql('SELECT * FROM comments ORDER BY created_at DESC LIMIT 1000')).filter(row => postIds.has(row.post_id) && visibleIds.has(row.profile_id)).map(row => ({ id: row.id, profileId: row.profile_id, postId: row.post_id, text: row.text, createdAt: row.created_at })),
            conversations: (await Promise.all((await sql('SELECT * FROM conversations WHERE participant_a=? OR participant_b=? ORDER BY updated_at DESC LIMIT 50', userId, userId)).map(async (row) => (await serializeConversation(row, userId))))),
            notifications: (await sql('SELECT data FROM notifications WHERE profile_id=? ORDER BY created_at DESC LIMIT 100', userId)).map(row => JSON.parse(row.data)),
            blocks: (await sql('SELECT * FROM blocks WHERE profile_id=?', userId)).map(row => ({ profileId: row.profile_id, targetId: row.target_id })),
            invitations: (await sql('SELECT * FROM invitations WHERE from_id=? OR to_id=? ORDER BY created_at DESC LIMIT 100', userId, userId)).map(serializeInvitation),
            matches: (await sql('SELECT data FROM matches WHERE participant_a=? OR participant_b=? ORDER BY updated_at DESC LIMIT 100', userId, userId)).map(row => serializeMatch(JSON.parse(row.data), userId)),
            pagination: { postsLimit: 120, hasMorePosts: posts.length === 120, nextCursor: posts.at(-1)?.createdAt || null }
        };
    };
    const authenticate = async (req) => {
        const token = /(?:^|;\s*)mosaic_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
        if (!token)
            return null;
        const row = (await one('SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?', digest(token), Date.now()));
        return row?.user_id || null;
    };
    const cookie = (res, token, expire = false) => res.setHeader('Set-Cookie', `mosaic_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${expire ? 0 : 7 * 86400}${secureCookies ? '; Secure' : ''}`);
    const openSession = async (res, userId) => {
        const token = randomBytes(32).toString('hex');
        (await run('DELETE FROM sessions WHERE expires_at<?', Date.now()));
        (await run('INSERT INTO sessions VALUES (?,?,?)', digest(token), userId, Date.now() + 7 * DAY));
        cookie(res, token);
    };
    const rateLimit = async (req, type = 'general') => {
        const key = digest(`${req.socket.remoteAddress || 'local'}:${type}`);
        const time=Date.now(), window=type==='auth'?15*60*1000:60*1000;
        const bucket=await db.prepare('INSERT INTO rate_limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires<? THEN 1 ELSE count+1 END, expires=CASE WHEN expires<? THEN excluded.expires ELSE expires END RETURNING count').bind(key,time+window,time,time).first();
        if(bucket.count>(type==='auth'?40:500))fail(429,'Too many requests. Please try again shortly.');
        await db.prepare('DELETE FROM rate_limits WHERE expires<?').bind(time-86400000).run();
    };
    const json = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    async function body(req) {
        if (!(req.headers['content-type'] || '').startsWith('application/json'))
            fail(415, 'Use JSON for API requests.');
        let length = 0, parts = [];
        for await (const chunk of req) {
            length += chunk.length;
            if (length > MAX_BODY)
                fail(413, 'That upload is too large. Images can be at most 2 MB.');
            parts.push(chunk);
        }
        try {
            const value = JSON.parse(Buffer.concat(parts).toString('utf8') || '{}');
            if (!value || Array.isArray(value) || typeof value !== 'object')
                fail(400, 'Send a JSON object.');
            for(const field of ['image','avatar','cover']){
                if(typeof value[field]!=='string'||!value[field].startsWith('data:'))continue;
                const validated=urlValue(value[field],true);
                const owner=await authenticate(req);
                if(!owner)fail(401,'Sign in to upload an image.');
                const [,mime,encoded]=/^data:(image\/[a-z]+);base64,(.*)$/.exec(validated);
                const key=randomUUID();
                await env.BUCKET.put(key,Buffer.from(encoded,'base64'),{httpMetadata:{contentType:mime},customMetadata:{owner}});
                value[field]=`/uploads/${key}`;
            }
            return value;
        }
        catch (error) {
            if (error instanceof ApiError)
                throw error;
            fail(400, 'The request could not be read.');
        }
    }
    const updateProfile = async (userId, input) => {
        const result = { ...(await profile(userId)) };
        for (const [key, max] of Object.entries({ name: 70, bio: 600, city: 80, archetype: 80, projectGoal: 250 }))
            if (Object.hasOwn(input, key))
                result[key] = cleanText(input[key], max, key === 'name');
        if (Object.hasOwn(input, 'username')) {
            const username = cleanText(input.username, 30, true).toLowerCase();
            if (!/^[a-z0-9_]{3,30}$/.test(username))
                fail(400, 'Usernames use 3–30 letters, numbers or underscores.');
            if ((await one('SELECT id FROM users WHERE username=? AND id<>?', username, userId)))
                fail(409, 'That username is already in use.');
            result.username = username;
        }
        for (const key of ['interests', 'aesthetics', 'descriptors', 'goals', 'skills', 'seekingSkills'])
            if (Object.hasOwn(input, key))
                result[key] = tags(input[key]);
        for (const key of ['avatar', 'cover'])
            if (Object.hasOwn(input, key))
                result[key] = urlValue(input[key], true);
        if (Object.hasOwn(input, 'accent')) {
            if (!/^#[a-fA-F0-9]{6}$/.test(input.accent))
                fail(400, 'Choose a six-digit accent color.');
            result.accent = input.accent;
        }
        if (Object.hasOwn(input, 'visibility'))
            result.visibility = choice(input.visibility, ['public', 'connections', 'private']);
        for (const key of ['messagePolicy', 'invitePolicy'])
            if (Object.hasOwn(input, key))
                result[key] = choice(input[key], ['everyone', 'connections', 'nobody']);
        if (Object.hasOwn(input, 'links')) {
            if (!Array.isArray(input.links) || input.links.length > 5)
                fail(400, 'Add up to five links.');
            result.links = input.links.map(value => {
                if (typeof value === 'string')
                    return urlValue(value);
                if (!value || typeof value !== 'object' || Array.isArray(value))
                    fail(400, 'Enter a valid profile link.');
                return { label: cleanText(value.label, 50), url: urlValue(value.url) };
            });
        }
        if (Object.hasOwn(input, 'sections')) {
            const sections = tags(input.sections);
            if (sections.some(item => !['intro', 'projects', 'boards', 'posts', 'featured', 'interests', 'about'].includes(item)))
                fail(400, 'Choose a valid profile section.');
            result.sections = sections;
        }
        if (Object.hasOwn(input, 'featured')) {
            const featured = tags(input.featured);
            for (const postId of featured)
                if ((await getPost(userId, postId)).profileId !== userId)
                    fail(403, 'Only feature your own work.');
            result.featured = featured;
        }
        if (Object.hasOwn(input, 'onboarded'))
            result.onboarded = input.onboarded === true;
        result.updatedAt = now();
        (await transaction(async () => {
            (await run('UPDATE users SET username=? WHERE id=?', result.username, userId));
            (await run('UPDATE profiles SET data=? WHERE id=?', JSON.stringify(result), userId));
            (await run('DELETE FROM profile_interests WHERE profile_id=?', userId));
            for (const interest of result.interests) {
                (await run('INSERT OR IGNORE INTO interests VALUES (?)', interest));
                (await run('INSERT INTO profile_interests VALUES (?,?)', userId, interest));
            }
        }));
        return result;
    };
    const req = { url: request.url, method: request.method, headers: Object.fromEntries(request.headers), socket: { remoteAddress: request.headers.get('cf-connecting-ip') || 'local' }, async *[Symbol.asyncIterator]() { const reader = request.body?.getReader(); if (!reader)
            return; try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                yield Buffer.from(value);
            }
        }
        finally {
            reader.releaseLock();
        } } };
    const responseHeaders = new Headers();
    let responseStatus = 200, responseBody;
    const res = { headersSent: false, setHeader(k, v) { responseHeaders.set(k, v); }, writeHead(status, headers) { responseStatus = status; for (const [k, v] of Object.entries(headers))
            responseHeaders.set(k, String(v)); }, end(value) { responseBody = value; this.headersSent = true; } };
    await (async () => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
        try {
            const url = new URL(req.url, 'http://localhost');
            const route = url.pathname;
            const method = req.method;
            if (!route.startsWith('/api/') && !route.startsWith('/uploads/'))
                fail(404, 'Not found.');
            await rateLimit(req);
            if (!['GET', 'HEAD'].includes(method)) {
                const expectedOrigin = configuredOrigin || `${secureCookies ? 'https' : 'http'}://${req.headers.host}`;
                if (!req.headers.origin || req.headers.origin !== expectedOrigin || req.headers['sec-fetch-site'] === 'cross-site')
                    fail(403, 'This request must come from the Parcarna app.');
            }
            const userId = (await authenticate(req));
            if(route.startsWith('/uploads/')){
                if(!userId)fail(401,'Sign in to view this image.');
                if(!['GET','HEAD'].includes(method))fail(405,'Method not allowed.');
                const key=route.slice('/uploads/'.length);
                if(!/^[a-f0-9-]{36}$/.test(key))fail(404,'Image not found.');
                const image=await env.BUCKET.get(key);
                const owner=image?.customMetadata?.owner;
                const target=owner?await profile(owner):null;
                if(!image||!target||!await canSee(userId,target))fail(404,'Image not found.');
                res.writeHead(200,{'Content-Type':image.httpMetadata.contentType,'Cache-Control':'private, no-store'});
                res.end(method==='HEAD'?null:await image.arrayBuffer());return;
            }
            if (method === 'GET' && route === '/api/session') {
                json(res, 200, { user: userId ? (await profile(userId)) : null });
                return;
            }
            if (method === 'GET' && route === '/api/health') {
                json(res, 200, { ok: true, mode: 'persistent-server', version: '1.0.0' });
                return;
            }
            if (method === 'POST' && ['/api/auth/register', '/api/auth/login'].includes(route)) {
                await rateLimit(req, 'auth');
                const input = await body(req);
                const username = cleanText(input.username, 30, true).toLowerCase();
                if (!/^[a-z0-9_]{3,30}$/.test(username))
                    fail(400, 'Usernames use 3–30 letters, numbers or underscores.');
                const password = cleanText(input.password, 128, true);
                if (password.length < 8)
                    fail(400, 'Use a password with at least eight characters.');
                if (route.endsWith('/register')) {
                    const name = cleanText(input.name, 70, true);
                    if ((await one('SELECT id FROM users WHERE username=?', username)))
                        fail(409, 'That username is already in use.');
                    const hash = await passwordHash(password);
                    const user = { id: id(), name, username, bio: '', avatar: '', cover: '', interests: [], aesthetics: [], descriptors: [], goals: [], skills: [], seekingSkills: [], city: '', archetype: '', projectGoal: '', visibility: 'public', messagePolicy: 'everyone', invitePolicy: 'everyone', accent: '#9b8ba5', links: [], sections: ['intro', 'projects', 'boards', 'posts'], featured: [], onboarded: false, createdAt: now(), updatedAt: now() };
                    (await transaction(async () => {
                        if ((await one('SELECT id FROM users WHERE username=?', username)))
                            fail(409, 'That username is already in use.');
                        (await run('INSERT INTO users VALUES (?,?,?,?)', user.id, username, hash, user.createdAt));
                        (await run('INSERT INTO profiles VALUES (?,?)', user.id, JSON.stringify(user)));
                    }));
                    (await openSession(res, user.id));
                    json(res, 201, { user });
                    return;
                }
                const account = (await one('SELECT * FROM users WHERE username=?', username));
                const dummy = '00000000000000000000000000000000:' + '00'.repeat(64);
                const correct = await passwordMatches(password, account?.password_hash || dummy);
                if (!account || !correct)
                    fail(401, 'The username or password is incorrect.');
                (await openSession(res, account.id));
                json(res, 200, { user: (await profile(account.id)) });
                return;
            }
            if (method === 'POST' && route === '/api/auth/logout') {
                const token = /(?:^|;\s*)mosaic_session=([a-f0-9]{64})/.exec(req.headers.cookie || '')?.[1];
                if (token)
                    (await run('DELETE FROM sessions WHERE token_hash=?', digest(token)));
                cookie(res, '', true);
                json(res, 200, { ok: true });
                return;
            }
            if (!userId)
                fail(401, 'Sign in to continue.');
            if (method === 'GET' && route === '/api/state') {
                json(res, 200, (await state(userId)));
                return;
            }
            if (method === 'GET' && route === '/api/posts') {
                const cursor = url.searchParams.get('cursor') || now();
                if (!/^\d{4}-\d{2}-\d{2}T/.test(cursor))
                    fail(400, 'Invalid page cursor.');
                const all = (await asyncFilter((await sql('SELECT * FROM posts WHERE created_at<? ORDER BY created_at DESC LIMIT 1000', cursor)), async (row) => (await canSee(userId, (await profile(row.profile_id))))));
                const posts = all.slice(0, 40).map(row => JSON.parse(row.data));
                json(res, 200, { posts, nextCursor: posts.length === 40 ? posts.at(-1).createdAt : null });
                return;
            }
            let found;
            if (method === 'GET' && (found = /^\/api\/conversations\/([^/]+)$/.exec(route))) {
                json(res, 200, { conversation: (await serializeConversation((await getConversation(userId, found[1])), userId)) });
                return;
            }
            if (method === 'GET' && (found = /^\/api\/matches\/([^/]+)$/.exec(route))) {
                json(res, 200, { match: serializeMatch((await getMatch(userId, found[1])), userId) });
                return;
            }
            const input = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) ? await body(req) : {};
            if (method === 'PATCH' && route === '/api/profile') {
                json(res, 200, { user: (await updateProfile(userId, input)) });
                return;
            }
            if (method === 'POST' && route === '/api/posts') {
                const post = { id: id(), profileId: userId, kind: choice(input.kind, ['image', 'reflection', 'project', 'inspiration'], 'image'), category: choice(input.category, ['Art', 'Photography', 'Design', 'Music', 'Technology', 'Writing'], 'Art'), title: cleanText(input.title, 120, true), caption: cleanText(input.caption, 5000), image: urlValue(input.image, true), tags: tags(input.tags), tools: tags(input.tools), link: urlValue(input.link), source: cleanText(input.source, 200), sourceUrl: input.sourceUrl === '/ASSET-SOURCES.md' ? input.sourceUrl : urlValue(input.sourceUrl), createdAt: now() };
                if (['image', 'inspiration', 'project'].includes(post.kind) && !post.image)
                    fail(400, 'Add an image for this type of post.');
                if (post.kind === 'reflection' && !post.caption)
                    fail(400, 'Write a reflection before publishing.');
                if (post.kind === 'inspiration' && (!post.source || !post.sourceUrl))
                    fail(400, 'Credit the original creator and source for saved inspiration.');
                (await run('INSERT INTO posts VALUES (?,?,?,?)', post.id, userId, JSON.stringify(post), post.createdAt));
                json(res, 201, { post });
                return;
            }
            if (method === 'POST' && route === '/api/boards') {
                const board = { id: id(), profileId: userId, name: cleanText(input.name, 80, true), description: cleanText(input.description, 600), postIds: [], createdAt: now() };
                (await run('INSERT INTO boards VALUES (?,?,?,?)', board.id, userId, JSON.stringify(board), board.createdAt));
                json(res, 201, { board });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/boards\/([^/]+)\/items$/.exec(route))) {
                const board = (await one('SELECT * FROM boards WHERE id=? AND profile_id=?', found[1], userId));
                if (!board)
                    fail(404, 'This board is unavailable.');
                (await getPost(userId, input.postId));
                (await run('INSERT OR IGNORE INTO board_items VALUES (?,?,?)', board.id, input.postId, now()));
                json(res, 200, { ok: true });
                return;
            }
            if (method === 'DELETE' && (found = /^\/api\/boards\/([^/]+)\/items\/([^/]+)$/.exec(route))) {
                if (!(await one('SELECT id FROM boards WHERE id=? AND profile_id=?', found[1], userId)))
                    fail(404, 'This board is unavailable.');
                (await run('DELETE FROM board_items WHERE board_id=? AND post_id=?', found[1], found[2]));
                json(res, 200, { ok: true });
                return;
            }
            if (method === 'POST' && route === '/api/follows') {
                const target = (await requireTarget(userId, input.profileId));
                const active = !(await follows(userId, target.id));
                if (active) {
                    (await run('INSERT INTO follows VALUES (?,?)', userId, target.id));
                    (await notify(target.id, { type: 'follow', actorId: userId, text: `${(await profile(userId)).name} followed your world.` }));
                }
                else
                    (await run('DELETE FROM follows WHERE profile_id=? AND target_id=?', userId, target.id));
                json(res, 200, { following: active });
                return;
            }
            if (method === 'POST' && route === '/api/likes') {
                const post = (await getPost(userId, input.postId));
                const active = !(await one('SELECT 1 FROM likes WHERE profile_id=? AND post_id=?', userId, post.id));
                if (active) {
                    (await run('INSERT INTO likes VALUES (?,?)', userId, post.id));
                    if (post.profileId !== userId)
                        (await notify(post.profileId, { type: 'like', actorId: userId, postId: post.id, text: `${(await profile(userId)).name} liked ${post.title}.` }));
                }
                else
                    (await run('DELETE FROM likes WHERE profile_id=? AND post_id=?', userId, post.id));
                json(res, 200, { liked: active });
                return;
            }
            if (method === 'POST' && route === '/api/comments') {
                const post = (await getPost(userId, input.postId));
                const comment = { id: id(), profileId: userId, postId: post.id, text: cleanText(input.text, 1000, true), createdAt: now() };
                (await run('INSERT INTO comments VALUES (?,?,?,?,?)', comment.id, userId, post.id, comment.text, comment.createdAt));
                if (post.profileId !== userId)
                    (await notify(post.profileId, { type: 'comment', actorId: userId, postId: post.id, text: `${(await profile(userId)).name} commented on ${post.title}.` }));
                json(res, 201, { comment });
                return;
            }
            if (method === 'POST' && route === '/api/conversations') {
                (await contactAllowed(userId, input.profileId, 'message'));
                const [a, b] = [userId, input.profileId].sort();
                let conversation = (await one('SELECT * FROM conversations WHERE participant_a=? AND participant_b=?', a, b));
                if (!conversation) {
                    const conversationId = id(), date = now(), status = (await connected(a, b)) ? 'accepted' : 'pending';
                    (await run('INSERT INTO conversations VALUES (?,?,?,?,?,?,?)', conversationId, a, b, userId, status, date, date));
                    conversation = (await one('SELECT * FROM conversations WHERE id=?', conversationId));
                    (await notify(input.profileId, { type: status === 'pending' ? 'message-request' : 'message', actorId: userId, conversationId, text: `${(await profile(userId)).name} ${status === 'pending' ? 'sent a message request.' : 'started a conversation.'}` }));
                }
                json(res, 200, { conversation: (await serializeConversation(conversation, userId)) });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/conversations\/([^/]+)\/messages$/.exec(route))) {
                const conversation = (await getConversation(userId, found[1]));
                const targetId = conversation.participant_a === userId ? conversation.participant_b : conversation.participant_a;
                if ((await blocked(userId, targetId)))
                    fail(403, 'Messaging is unavailable for this conversation.');
                const target = (await profile(targetId));
                if (target.messagePolicy === 'nobody' || (target.messagePolicy === 'connections' && !(await connected(userId, targetId))))
                    fail(403, 'Their message preferences do not allow this message.');
                if (conversation.status !== 'accepted' && !(conversation.status === 'pending' && conversation.requested_by === userId && !(await one('SELECT id FROM messages WHERE conversation_id=?', conversation.id))))
                    fail(403, 'The message request must be accepted before continuing.');
                const message = { id: id(), senderId: userId, text: cleanText(input.text, 4000, true), createdAt: now() };
                (await transaction(async () => { (await run('INSERT INTO messages VALUES (?,?,?,?,?)', message.id, conversation.id, userId, message.text, message.createdAt)); (await run('UPDATE conversations SET updated_at=? WHERE id=?', message.createdAt, conversation.id)); (await notify(targetId, { type: 'message', actorId: userId, conversationId: conversation.id, text: `${(await profile(userId)).name} sent you a message.` })); }));
                json(res, 201, { message });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/conversations\/([^/]+)\/(accept|reject)$/.exec(route))) {
                const conversation = (await getConversation(userId, found[1]));
                if (conversation.status !== 'pending' || conversation.requested_by === userId)
                    fail(403, 'Only the recipient can respond to a pending request.');
                if ((await blocked(conversation.participant_a, conversation.participant_b)))
                    fail(403, 'This request is unavailable.');
                (await run('UPDATE conversations SET status=?,updated_at=? WHERE id=?', found[2] === 'accept' ? 'accepted' : 'rejected', now(), conversation.id));
                json(res, 200, { conversation: (await serializeConversation((await getConversation(userId, conversation.id)), userId)) });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/conversations\/([^/]+)\/read$/.exec(route))) {
                const conversation = (await getConversation(userId, found[1]));
                (await transaction(async () => {
                    (await run('INSERT INTO conversation_reads VALUES (?,?,?) ON CONFLICT(conversation_id,profile_id) DO UPDATE SET read_at=excluded.read_at', conversation.id, userId, now()));
                    for (const row of (await sql('SELECT * FROM notifications WHERE profile_id=?', userId))) {
                        const item = JSON.parse(row.data);
                        if (item.conversationId === conversation.id && !item.read) {
                            item.read = true;
                            (await run('UPDATE notifications SET data=? WHERE id=?', JSON.stringify(item), row.id));
                        }
                    }
                }));
                json(res, 200, { conversation: (await serializeConversation(conversation, userId)) });
                return;
            }
            if (method === 'POST' && route === '/api/blocks') {
                if (typeof input.profileId !== 'string' || input.profileId === userId || !(await profile(input.profileId)))
                    fail(400, 'Choose another person.');
                (await transaction(async () => {
                    (await run('INSERT OR IGNORE INTO blocks VALUES (?,?,?)', userId, input.profileId, now()));
                    (await run('DELETE FROM follows WHERE (profile_id=? AND target_id=?) OR (profile_id=? AND target_id=?)', userId, input.profileId, input.profileId, userId));
                    (await run("UPDATE invitations SET status='cancelled',updated_at=? WHERE status='pending' AND ((from_id=? AND to_id=?) OR (from_id=? AND to_id=?))", now(), userId, input.profileId, input.profileId, userId));
                    for (const row of (await sql('SELECT data FROM matches WHERE (participant_a=? AND participant_b=?) OR (participant_a=? AND participant_b=?)', userId, input.profileId, input.profileId, userId))) {
                        const match = JSON.parse(row.data);
                        if (match.status === 'active') {
                            match.status = 'abandoned';
                            match.abandonedBy = userId;
                            match.updatedAt = now();
                            match.selections = {};
                            (await saveMatch(match));
                        }
                    }
                }));
                json(res, 200, { blocked: true });
                return;
            }
            if (method === 'DELETE' && (found = /^\/api\/blocks\/([^/]+)$/.exec(route))) {
                (await run('DELETE FROM blocks WHERE profile_id=? AND target_id=?', userId, found[1]));
                json(res, 200, { blocked: false });
                return;
            }
            if (method === 'POST' && route === '/api/reports') {
                if (!(await profile(input.profileId || '')) || input.profileId === userId)
                    fail(400, 'Choose another person.');
                const reportId = id();
                (await run('INSERT INTO reports VALUES (?,?,?,?,?)', reportId, userId, input.profileId, cleanText(input.reason, 2000, true), now()));
                json(res, 201, { id: reportId, received: true, message: 'Report saved for the instance administrator to review.' });
                return;
            }
            if (method === 'PATCH' && route === '/api/notifications/read') {
                for (const row of (await sql('SELECT * FROM notifications WHERE profile_id=?', userId))) {
                    const item = JSON.parse(row.data);
                    item.read = true;
                    (await run('UPDATE notifications SET data=? WHERE id=?', JSON.stringify(item), row.id));
                }
                json(res, 200, { ok: true });
                return;
            }
            if (method === 'POST' && route === '/api/invitations') {
                (await contactAllowed(userId, input.profileId, 'invite'));
                if ((await one("SELECT id FROM invitations WHERE status='pending' AND ((from_id=? AND to_id=?) OR (from_id=? AND to_id=?))", userId, input.profileId, input.profileId, userId)))
                    fail(409, 'There is already a pending invitation between you.');
                const invitationId = id(), date = now();
                (await run('INSERT INTO invitations VALUES (?,?,?,?,?,?,?)', invitationId, userId, input.profileId, 'pending', null, date, date));
                (await notify(input.profileId, { type: 'game-invite', actorId: userId, invitationId, text: `${(await profile(userId)).name} invited you to Arcana Duels.` }));
                json(res, 201, { invitation: serializeInvitation((await one('SELECT * FROM invitations WHERE id=?', invitationId))) });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/invitations\/([^/]+)\/respond$/.exec(route))) {
                const invitation = (await one('SELECT * FROM invitations WHERE id=? AND (to_id=? OR from_id=?)', found[1], userId, userId));
                if (!invitation)
                    fail(404, 'This invitation is unavailable.');
                if (invitation.status !== 'pending')
                    fail(409, 'This invitation has already been answered.');
                if (typeof input.accept !== 'boolean')
                    fail(400, 'Choose whether to accept this invitation.');
                if (input.accept && invitation.to_id !== userId)
                    fail(403, 'Only the recipient can accept this invitation.');
                if ((await blocked(invitation.from_id, invitation.to_id)))
                    fail(403, 'This invitation is unavailable.');
                let match;
                (await transaction(async () => {
                    if (input.accept) {
                        const deck = CARDS.map(card => card.id);
                        for (let index = deck.length - 1; index > 0; index--) {
                            const other = randomInt(index + 1);
                            [deck[index], deck[other]] = [deck[other], deck[index]];
                        }
                        const players = [invitation.from_id, userId], date = now();
                        match = { id: id(), status: 'active', participantIds: players, hands: { [players[0]]: deck.slice(0, 5), [players[1]]: deck.slice(5, 10) }, selections: {}, round: 0, scores: { [players[0]]: 0, [players[1]]: 0 }, history: [], winnerId: null, createdAt: date, updatedAt: date };
                        (await run('INSERT INTO matches VALUES (?,?,?,?,?)', match.id, players[0], players[1], JSON.stringify(match), date));
                        (await notify(invitation.from_id, { type: 'game', actorId: userId, matchId: match.id, text: `${(await profile(userId)).name} accepted your Arcana Duel.` }));
                    }
                    (await run('UPDATE invitations SET status=?,match_id=?,updated_at=? WHERE id=?', input.accept ? 'accepted' : invitation.from_id === userId ? 'cancelled' : 'rejected', match?.id || null, now(), invitation.id));
                }));
                json(res, 200, { invitation: serializeInvitation((await one('SELECT * FROM invitations WHERE id=?', invitation.id))), ...(match ? { match: serializeMatch(match, userId) } : {}) });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/matches\/([^/]+)\/moves$/.exec(route))) {
                const match = (await getMatch(userId, found[1]));
                if (match.status !== 'active')
                    fail(409, 'This match has ended.');
                const opponentId = match.participantIds.find(item => item !== userId);
                if ((await blocked(userId, opponentId)))
                    fail(403, 'This match is unavailable.');
                if (match.selections[userId])
                    fail(409, 'Your selection is already locked for this round.');
                if (typeof input.cardId !== 'string' || !match.hands[userId].includes(input.cardId) || match.history.some(round => round.cards[userId] === input.cardId))
                    fail(400, 'Choose an unused card from your own hand.');
                (await transaction(async () => {
                    (await run('INSERT INTO moves VALUES (?,?,?,?,?,?)', id(), match.id, userId, match.round, input.cardId, now()));
                    match.selections[userId] = input.cardId;
                    match.updatedAt = now();
                    if (match.participantIds.every(player => match.selections[player])) {
                        const [a, b] = match.participantIds, attribute = ATTRIBUTES[match.round];
                        const values = Object.fromEntries(match.participantIds.map(player => [player, CARDS.find(card => card.id === match.selections[player])[attribute]]));
                        const points = { [a]: values[a] === values[b] ? 0.5 : values[a] > values[b] ? 1 : 0, [b]: values[a] === values[b] ? 0.5 : values[b] > values[a] ? 1 : 0 };
                        match.history.push({ round: match.round, attribute, cards: { ...match.selections }, values, scores: points });
                        for (const player of match.participantIds)
                            match.scores[player] += points[player];
                        match.selections = {};
                        match.round++;
                        if (match.round === 5) {
                            match.status = 'completed';
                            match.winnerId = match.scores[a] === match.scores[b] ? null : match.scores[a] > match.scores[b] ? a : b;
                        }
                        (await notify(opponentId, { type: 'game', actorId: userId, matchId: match.id, text: match.status === 'completed' ? 'Your Arcana Duel is complete. See the final reveal.' : `Round ${match.round} revealed. Your next card awaits.` }));
                    }
                    (await saveMatch(match));
                }));
                json(res, 200, { match: serializeMatch(match, userId) });
                return;
            }
            if (method === 'POST' && (found = /^\/api\/matches\/([^/]+)\/abandon$/.exec(route))) {
                const match = (await getMatch(userId, found[1]));
                if (match.status !== 'active')
                    fail(409, 'This match has already ended.');
                match.status = 'abandoned';
                match.abandonedBy = userId;
                match.updatedAt = now();
                match.selections = {};
                (await saveMatch(match));
                json(res, 200, { match: serializeMatch(match, userId) });
                return;
            }
            fail(404, 'That action is unavailable.');
        }
        catch (error) {
            if (!res.headersSent)
                json(res, error instanceof ApiError ? error.status : 500, { error: error instanceof ApiError ? error.message : 'Something went wrong. Please try again.' });
            else
                res.end();
            if (!(error instanceof ApiError))
                console.error('[Parcarna server]', error);
        }
    })();
    return new Response(responseBody, { status: responseStatus, headers: responseHeaders });
}
