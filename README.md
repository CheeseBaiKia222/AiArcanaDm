# Parcana

Parcana is a free web prototype that connects tarot symbolism with self-expression, community sharing, and play. Six questions reveal a starting arcana, shape a profile, and give an explicit bonus in five-round Arcana Duels.

## Cultural intent

**Common Ground track: Culture × Tech**

We chose tarot because it brings visual culture, interpretation, and play together. Parcana explores how an inherited symbolic language can support digital self-expression.

Users bring their own interests to the cards. A board of robotics, sketchbooks, and handmade furniture might reinterpret the Magician as a contemporary maker. Another person might understand that same card differently. We want those differences to become invitations to conversation.

Our cultural contribution is to invite people to participate in interpretation. The prototype connects questionnaire personas, editable post arcana, and tarot duels. Collaborative storytelling and richer AI explanations are part of our broader vision.

## Current experience

The flow is landing → username/password account → presentation and questionnaire → home.

- **Persona:** Six questions produce The Moon, The Chariot, or The High Priestess. Nocturne (male presentation) and Velvet (female presentation) are visual choices available to anyone; answers determine the result independently of presentation.
- **Community:** Share images, videos, ideas, experiences, events, reflections, and projects. Like, comment, repost with original attribution, and save collections.
- **Interpretation:** Posts receive content arcana suggestions from their title, caption, and tags. Authors can select a different arcana.
- **Interests and connection:** Personal activity produces private interest labels. Matching explanations identify shared arcana and interests.
- **Play:** Practice against a bot or invite another member to asynchronous five-round PvP. Questionnaire arcana gives an explicit attribute bonus, fixed when a match starts.
- **Messaging:** Exchange private messages through the account and request flows.

Questionnaire scoring and keyword rules currently generate the suggestions. The app does not currently use a generative AI interpretation service. Content arcana and activity labels are separate from questionnaire arcana and do not change game bonuses. These are creative prompts for play, not a personality diagnosis.

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

To try multiplayer locally, create two accounts in separate browsers or private-browser sessions on the same running preview. Send an invitation from one account and accept it from the other. The localhost address is for local use; it is not a hosted demo link.

## Artwork and design

The card collection uses the 22 Rider–Waite–Smith Major Arcana scans credited to **Pamela Colman Smith (1909/1910)**, sourced through Wikimedia Commons pages marked public domain. Individual source links are recorded in [the tarot source manifest](frontend/assets/tarot/sources.json). [Asset credits](frontend/ASSET-SOURCES.md) also document original SVG artwork, Unsplash inspiration photography, and fictional demo identities. The current design uses charcoal and muted purple, editorial tarot imagery, and a focus on personality discovery. User-supplied male/female visual references are pending; cinematic intros have not been implemented. Earlier portrait concepts are archived in `docs/design/archive/`.

The supplied `parcana.pdf` is preserved in `docs/design/`; reference links are in `docs/references/`.

## Deploy

See [Sites deployment](docs/deployment.md). The existing project ID is preserved in `.openai/hosting.json`. `npm run package` packages the built app into `deployment/parcarna-deploy.tar.gz`. Publication requires the supported Sites source-sync workflow; a local archive is not a published version.

## Current scope and checks

The repository contains automated checks for accounts, privacy, game rules, persona scoring, social activity, concurrency, and the built Worker runtime. Run the commands above to verify your checkout. Earlier verification notes under `docs/legacy-verification.md` describe the preserved Node/SQLite application, not the current build.

The deployment guide describes an owner-private registered Site. A judge-accessible hosted demo has not been confirmed in this README. Password recovery, email verification, and a moderation administrator interface are not implemented.

## AI and resource attribution

Codex assisted repository inspection, submission drafting, and this README update. Development AI tools and model versions remain to be confirmed by the team. Current in-app arcana suggestions use explicit scoring and keyword rules. Artwork and photography credits are maintained in [frontend/ASSET-SOURCES.md](frontend/ASSET-SOURCES.md).
