# Parcarna

A free personality-discovery and creative-play app. Six questions reveal a starting arcana; the result shapes a profile and gives a transparent bonus in tarot duels. Nocturne (male presentation) and Velvet (female presentation) are visual choices available to anyone. Answers determine traits independently of presentation.

## Project structure

| Folder | Responsibility |
| --- | --- |
| `frontend/` | Browser entry, JavaScript modules, styles, and public artwork |
| `backend/` | Worker entry and authenticated API |
| `database/` | D1 schema, migrations, and SQL reference |
| `platform/sites/` | Sites/Vinext integration and framework scaffold |
| `tests/` | Account, privacy, game, persona, concurrency, and Worker checks |
| `scripts/` | Build, local preview, artwork, and deployment tooling |
| `deployment/` | Prepared deployment archive and checksum |
| `docs/` | Deployment instructions, design references, and project notes |
| `legacy/node-sqlite/` | Preserved original Node/SQLite app; not part of the Sites build |

The root package runs the current app. There is no second active `sites/` copy. See [architecture](docs/architecture.md) for the source-to-build mapping.

## Run locally

Use Node.js 24+ and npm. From the repository root:

```sh
npm ci
npm test
npm run build
npm run test:runtime
npm run preview
```

Open http://127.0.0.1:4319/. Local accounts and uploads persist in ignored `.wrangler/preview/`. Stop the preview before starting another process on the same port. `npm run dev` provides the framework development server; the built preview is the full application verification path.

The flow is landing → username/password account → presentation and questionnaire → home. Members can create posts, collect work, message, and play five-round Arcana Duels. All features are free.

The existing home and profile layouts now include an image/video community feed. Posts can describe ideas, experiences, and events; members can like, comment, repost with original attribution, and save collections. Each post has a separate content arcana, suggested from its title, caption, and tags, with an author override. Your own activity builds private interest labels alongside the questionnaire persona.

## Artwork and design

The card collection uses the 22 Rider–Waite–Smith Major Arcana scans. Credits and source links are in [frontend/ASSET-SOURCES.md](frontend/ASSET-SOURCES.md). The current design uses charcoal and muted purple, editorial tarot imagery, and a focus on personality discovery. User-supplied male/female visual references are pending; cinematic intros have not been implemented. Earlier portrait concepts are archived in `docs/design/archive/`.

The supplied `parcana.pdf` is preserved in `docs/design/`; reference links are in `docs/references/`.

## Deploy

See [Sites deployment](docs/deployment.md). The existing project ID is preserved in `.openai/hosting.json`. `npm run package` packages the built app into `deployment/parcarna-deploy.tar.gz`. Publication requires the supported Sites source-sync workflow; a local archive is not a published version.

Password recovery, email verification, and a moderation administrator interface are not implemented.
