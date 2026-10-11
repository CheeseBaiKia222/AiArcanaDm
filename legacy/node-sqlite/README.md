# Legacy Node/SQLite implementation

Preserved for reference. Current development and deployment run from the repository root; see `../../README.md`. Commands below apply only inside this legacy directory.

# Mosaic persistent server

Mosaic is an independent application with its own server, database, and hosting configuration.

## Run

Install Node.js 24 or later, open the `mosaic` directory, then run `node --env-file-if-exists=.env server/index.mjs` (or `npm start` if npm is available). Visit **http://127.0.0.1:4317**. There are no package dependencies and no external credentials are required. Optional settings are listed in `.env.example`; copy it to `.env` to change them.

The browser's **demo mode** has fictional people and saves activity to this browser's local storage. Demo messages and invitations are simulations. **Create an account / Sign in** uses this actual Node server and the persistent `data/mosaic.db` SQLite database. Real accounts begin empty and do not mingle with fictional demo users. Two accounts on the same running server can exchange requests, accept them, message and complete asynchronous multiplayer duels. Use two different browsers or private-browser sessions to try this.

`node --test tests/*.test.mjs` (or `npm test`) runs engine and server tests. The server tests create and remove an isolated temporary database, including a server-restart check.

## API

All mutation requests require `Content-Type: application/json` and the exact same-origin `Origin` header. Browser fetch supplies Origin automatically. Authentication is an HttpOnly SameSite=Strict cookie. `GET /api/session` returns `{user}` and `GET /api/state` returns the current account's authorized social and game state.

- Auth: `POST /api/auth/register` (`name, username, password`), `/login` (`username, password`), `/logout`.
- Profile: `PATCH /api/profile`. Names, biography, image, palette, section order, interests, aesthetics, self-selected descriptors, connection goals, skills, links, city and privacy preferences are editable.
- Publishing: `POST /api/posts`; kinds are `image`, `reflection`, `project`, `inspiration`. Inspiration needs creator `source` and `sourceUrl`. Projects and image posts need an image. Reflection needs text. `GET /api/posts?cursor=<ISO timestamp>` offers pages of up to 40 posts; initial state contains up to 120.
- Boards: `POST /api/boards`; `POST /api/boards/:id/items` (`postId`); `DELETE /api/boards/:id/items/:postId`.
- Social: `POST /api/follows` (`profileId`, toggles), `/api/likes` (`postId`, toggles), `/api/comments` (`postId,text`).
- Messaging: `POST /api/conversations` (`profileId`), `GET /api/conversations/:id`, `POST /api/conversations/:id/messages` (`text`), `/accept`, `/reject`, `/read`. Non-mutual followers require a request. The sender may include one introductory message; the recipient must accept before conversation continues. Reading state is stored separately for each participant; message `read` values represent whether the current viewer has read them.
- Safety: `POST /api/blocks` (`profileId`), `DELETE /api/blocks/:id`, `POST /api/reports` (`profileId,reason`), `PATCH /api/notifications/read`. Reports are stored for the server administrator; there is no staffed moderation service or administrator UI in this version.
- Games: `POST /api/invitations` (`profileId`), `POST /api/invitations/:id/respond` (`accept:boolean`), `GET /api/matches/:id`, `POST /api/matches/:id/moves` (`cardId`), `POST /api/matches/:id/abandon`. Responses wrap the resource in `{invitation}`, `{match}` or both. Matches are asynchronous and persist across disconnects and restarts; reconnect with GET to resume. A participant may end an abandoned game explicitly. The recipient can accept or reject an invitation; the sender can cancel it with `accept:false` but cannot accept on the recipient's behalf. Blocking cancels pending invitations and ends active games with that person.

## Access controls and data

SQLite models profiles, interests, posts/projects, boards/saved items, follows, likes, comments, conversations, messages, notifications, invitations, matches, moves, blocks and reports. Parameterized queries, foreign keys and uniqueness constraints protect writes. Passwords use salted scrypt; only hashed session tokens are stored. Sessions expire after seven days. Rate limits protect authentication and API traffic; same-origin mutation checks, same-site cookies and a restrictive Content Security Policy reduce cross-site attacks.

Every API read and write performs server-side authorization. The authenticated session determines the sender/player; client-provided identity fields never determine permissions. Private profiles are owner-only; connections visibility requires mutual follows. Message and invitation settings accept everyone, mutual connections or nobody. Blocking operates in both directions and prevents future messages and invitations. Only conversation participants can retrieve its messages. Only match participants can retrieve a match or move. Match serialization contains the viewer's own unplayed hand and already-revealed rounds; opponent hands and pending selections never leave the server. The server deals from one deck without replacement, validates cards and turn state, awards tie points, and computes results.

Uploaded images use verified PNG, JPEG, GIF or WebP magic bytes with a 2 MB limit; SVG uploads are rejected. Images are currently stored as data URLs inside the database, suitable for a small installation. External image URLs and links require HTTPS. User text is stored as text and must be rendered with DOM textContent or escaped template interpolation; never inject user text as HTML. Client uploads should also validate size before reading.

## Hosting and current limits

For access from another machine, bind `HOST=0.0.0.0` and use a trusted reverse proxy with HTTPS. Set `APP_ORIGIN` to the exact public HTTPS origin and `SECURE_COOKIES=true`. Use a persistent Node host and persistent filesystem for `DATABASE_PATH`; keep the database and `.env` private and backed up. This SQLite server is not compatible with ephemeral Vercel serverless filesystem storage. Hosting its static demo there is possible, but real accounts and multiplayer require a persistent backend or a database/storage migration. Only `public/` is served. Never expose the SQLite file. No deployment is performed by these instructions.

This is a single-process Node/SQLite implementation, not a Supabase integration. It needs no Supabase keys. A public, large-scale service would require deployment, operational backups, email verification/password recovery, moderation staffing and an admin workflow, scalable object storage and distributed rate limiting. Email verification and password reset are not provided. Do not run multiple server processes against the same database without revisiting concurrency and rate-limit design. Real activity refreshes on client navigation/polling rather than a WebSocket transport.
