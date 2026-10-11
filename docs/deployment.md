# Deploy Parcarna with Sites

The repository contains the complete Sites application: the dark Parcarna frontend, a Worker API, D1 database migrations, and private R2 image storage.

## Existing Site

Reuse `.openai/hosting.json`: project `appgprj_6acb163f1e14819195b844da124a0502`. Do not create a second Site. The registered Site is owner-private; publishing does not change its audience.

## Prepare on Windows

Install Node.js 24+ with npm and Git. With the Sites plugin installed, run from the repository root:

```powershell
.\scripts\prepare-deployment.ps1 -SitesPluginRoot 'C:\path\to\sites\1.0.1'
```

The script installs dependencies, runs the integration/game/persona/social checks, builds the Worker and frontend, tests the built Worker runtime, and creates `deployment/parcarna-deploy.tar.gz` using native `tar`. Use `-SkipInstall` only when dependencies are already installed and unchanged. The archive contains build output, hosting configuration, and migrations; it contains no local database or credentials. The Codex Sites workflow still performs its own source synchronization and verified packaging when publishing.

## Publish through Codex Sites

1. Read the root hosting manifest and the Sites skill.
2. Get the existing Site and a fresh source repository write credential.
3. Run the Sites `site-workflow.mjs` helper from the repository root. Supply the credential through its hidden stdin prompt, never an argument, file, or committed secret. Use the prepared build with `commands: []` and an absolute deployment archive path.
4. Pass the helper's exact `project_id`, pushed `commit_sha`, and `archive` to `save_version_and_deploy_private` while access remains owner-private.
5. Wait for successful deployment and report its returned URL. A registered URL alone does not mean deployment succeeded.

Sites provisions `DB` and `BUCKET` and applies the tracked migrations in `database/migrations/`. New hosted accounts start empty. Local SQLite data, demo browser storage, and preview test accounts are not uploaded.

## Validation and operational scope

`node --test tests/*.test.mjs` checks accounts, privacy, conversations, uploads, game rules, persona scoring, persistence, and conflicting moves. `node tests/worker-runtime.mjs` additionally exercises the built Cloudflare runtime with a temporary database and bucket, including server-derived arcana, reposts, video byte ranges, and bonuses fixed when a match starts.

For a persistent local preview after building, run `node scripts/preview.mjs` and open `http://127.0.0.1:4319/`. Its development database and uploads stay under ignored `.wrangler/preview/`; they are never included in the deployment archive.

Conflicting mutations return HTTP 409; refresh before retrying. This is a small-instance design. Password recovery, email verification, and a moderation administrator interface are not implemented.

If the environment rejects stdin to the Sites helper, publication cannot proceed in that session. Retain this project ID and resume in a session permitting the standard Sites workflow. Do not save credentials to work around the restriction.
