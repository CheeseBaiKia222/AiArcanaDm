# Architecture and file ownership

## Active application

- `frontend/index.html` loads modules from `/js/` and styles from `/styles/`. Vite copies `frontend/` to the published asset root.
- `frontend/js/entry.js` owns landing, account, questionnaire, and home views. `app.js` coordinates navigation and authenticated state; forms, messaging, and game UI live in adjacent modules.
- `frontend/js/persona.js` and `game-engine.js` are shared domain modules. The backend imports these to validate answers and compute authoritative scores.
- `backend/worker.ts` serves browser assets and routes API/upload requests to `backend/api.mjs`. D1 stores application data and R2 stores uploaded images.
- `database/migrations/` is the source of truth for ordered migrations. The Sites build plugin copies it to `dist/.openai/drizzle/` to preserve the hosting contract. `reference-schema.sql` documents the original relational schema; it is not applied alongside migrations.
- `platform/sites/` contains the framework shell, UI scaffold, connector helpers, and build integration. The app's visible browser UI is in `frontend/`. Example framework code is retained under `platform/sites/examples/` and excluded from type checking.
- `scripts/preview.mjs` runs the built Worker on port 4319, using ignored local state and a separate asset snapshot to avoid locked build output on Windows.

## Preserved references

The old flat files were restored to a self-contained `legacy/node-sqlite/` app with public assets, server, scripts, and tests. Its package and Dockerfile operate from that directory. It is retained for history and excluded from the current Sites build. Do not make current feature changes there.

The user's PDF and link list live under `docs/design/` and `docs/references/`. Old verification notes are explicitly labelled legacy. Generated nightclub portraits are archived under `docs/design/archive/` and are not published assets.

No database, account data, uploaded private images, node_modules, credentials, or local preview state belongs in the deployment archive or source control.
