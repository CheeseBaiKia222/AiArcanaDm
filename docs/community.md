# Community posts and content arcana

The existing home, profile, card, and modal components host the new behavior. The landing page, navigation, colors, and general layout are unchanged.

## Posts and media

Posts support images, video, ideas, experiences, events, reflections, projects, and attributed inspiration. PNG/JPEG/GIF/WebP uploads remain limited to 2 MB. MP4/WebM video uploads use an authenticated binary endpoint and a 20 MB limit. Direct HTTPS media URLs are supported; video URLs must point to an MP4 or WebM. Playback is manual, with byte-range responses for uploaded files. Uploads inherit their owner's visibility and block rules. Media container signatures are checked; this version does not transcode video or scan its visual contents.

Reposts reference the original post and retain its creator, caption, media, source, and arcana. Reposting twice is idempotent. Undoing a repost removes it from My World. A private or blocked source disappears from other members' reposts and activity signals.

## Arcana

Content arcana is independent of the questionnaire's game arcana. Suggestions use word-boundary keyword matches in the title, caption, and tags; an author can select a better fit. No image recognition or paid AI service is required. Existing posts get a suggestion when read.

| Content | Arcana | Interest persona |
| --- | --- | --- |
| Marvel, superheroes, heroism | The Chariot | Hero |
| Fantasy, myths, worldbuilding | The Moon | Dreamweaver |
| Art, design, making | The Magician | Maker |
| Nature, care, food | The Empress | Cultivator |
| Books, learning, reflection | The Hermit | Seeker |
| Music, performance, film | The Star | Muse |
| Friendship, celebrations | The Sun | Connector |
| Travel, new experiences, unmatched topics | The Fool | Explorer |

## Activity signals

Only the signed-in member receives their activity summary. Each distinct post contributes author +3, repost +2, like +1, comment +1, capped at five points per post. Repeated comments count once. Undoing a like or repost removes its contribution. Scores aggregate the member's latest 1,000 eligible posts by post date; the top three labels appear in the existing persona panel. These are creative interest signals, not a personality diagnosis. Viewing alone does not create an interest signal. Questionnaire results and game bonuses are unchanged.

## Storage and checks

The new reposts migration preserves existing posts and accounts. Local previews apply pending migrations using an explicit ledger, including upgrades from the old preview format. Sites applies the tracked production migrations through its normal hosting workflow.

Run npm test and npm run test:runtime. Social tests cover classification, reversible scores, duplicate reposts, attribution, blocked/private sources, media ownership, invalid and oversized uploads, cross-origin rejection, byte ranges, and existing-preview migration.
