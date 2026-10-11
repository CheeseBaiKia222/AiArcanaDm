# Deploy Parcarna with Sites

This directory contains the complete Sites application: the dark Parcarna frontend, a Worker API, D1 database migrations, and private R2 image storage.

## Existing Site

Reuse `.openai/hosting.json`: project `appgprj_6acb163f1e14819195b844da124a0502`. Do not create a second Site. The registered Site is owner-private; publishing does not change its audience.

## Prepare on Windows

Install Node.js 24+ with npm and Git. With the Sites plugin installed, run from this directory:

```powershell
.\prepare-deployment.ps1 -SitesPluginRoot 'C:\path\to\sites\1.0.1'
```

The script installs dependencies, runs the 21 integration/game checks, builds the Worker and frontend, and creates `outputs/parcarna-deploy.tar.gz` using native `tar`. Use `-SkipInstall` only when dependencies are already installed and unchanged. The archive contains build output, hosting configuration, and migrations; it contains no local database or credentials. The Codex Sites workflow still performs its own source synchronization and verified packaging when publishing.

## Publish through Codex Sites

1. Read this directory's hosting manifest and the Sites skill.
2. Get the existing Site and a fresh source repository write credential.
3. Run the Sites `site-workflow.mjs` helper from this directory. Supply the credential through its hidden stdin prompt, never an argument, file, or committed secret. Use the prepared build with `commands: []` and an absolute deployment archive path.
4. Pass the helper's exact `project_id`, pushed `commit_sha`, and `archive` to `save_version_and_deploy_private` while access remains owner-private.
5. Wait for successful deployment and report its returned URL. A registered URL alone does not mean deployment succeeded.

Sites provisions `DB` and `BUCKET` and applies the tracked Drizzle migrations. New hosted accounts start empty. Local SQLite data, demo browser storage, and preview test accounts are not uploaded.

## Validation and operational scope

`node --test tests/concurrency.test.mjs tests/game.test.mjs tests/server.test.mjs` checks accounts, privacy, conversations, uploads, game rules, persistence, and conflicting moves. `node tests/worker-runtime.mjs` additionally exercises the built Cloudflare runtime with a temporary database and bucket.

Conflicting mutations return HTTP 409; refresh before retrying. This is a small-instance design. Password recovery, email verification, and a moderation administrator interface are not implemented.

If the environment rejects stdin to the Sites helper, publication cannot proceed in that session. Retain this project ID and resume in a session permitting the standard Sites workflow. Do not save credentials to work around the restriction.
