# Mosaic verification

Verification snapshot: **11 October 2026**. Checks below were executed against the local Node server and two independent browser sessions.

## Executed checks

Command: `node --test tests/*.test.mjs`

**Result: 20 passing, 0 failing, 0 skipped.** The Node test runner count includes the enclosing server integration test. Tests use an isolated temporary database and remove it afterward; no real account data is used. Three UI-handler regression tests also verify first-match rules acknowledgement and the invitation API payload.

### Game engine and rendered game screens

- All 22 cards have unique identities, original illustrations, descriptions, and integer attributes between 1 and 10.
- Every card's attributes total 18; each attribute totals 132 across the deck, with varied distributions.
- One shuffled deck deals ten distinct cards across two five-card hands; 100 seeded shuffles are exercised.
- Scoring follows Imagination, Courage, Insight, Imagination, Courage; ties give half a point each.
- A complete bot duel uses each card once, commits the bot's move before the player's submission, and produces five recaps and valid totals.
- Illegal cards, repeated submissions, premature advances, and moves after completion are rejected.
- Practice state survives JSON serialization, including the bot's committed choice.
- Practice rendering hides unplayed bot cards and shows the committed card only after reveal.
- Multiplayer waiting screens hide selection controls after lock and escape untrusted profile names.

### Authentication, authorization, and persistence

- Registration, duplicate usernames, login failure, sessions, logout, and password hashing.
- Requests without an authenticated session cannot retrieve private server state.
- Cross-origin and missing-origin mutations are rejected; session cookies are HttpOnly and SameSite.
- Client-provided user identity cannot edit another profile.
- Projects, boards, saved items, likes, comments, follows, and notifications persist.
- Private and mutual-connection profile visibility is enforced on profiles, posts, and saved references.
- Another account cannot modify an owner's board.
- Only conversation participants can read private messages; a third account is rejected.
- A request sender cannot accept their own message request or continue sending before recipient acceptance.
- Contact preferences require mutual follows when configured; one-sided following is insufficient.
- Upload limits and file signatures are checked; unsupported SVG uploads and unsafe links are rejected.
- An actual server duel completes five rounds with server-calculated scores and no repeated cards.
- Opponent hands and pending selections remain absent from API responses. Foreign-player access and illegal card submissions are rejected.
- Invitations can be rejected or cancelled, and a sender cannot accept on the recipient's behalf.
- Matches, content, sessions, and message read state survive restarting the server against the same database.
- Abandoned games reject further moves. Blocking stops messages and invitations, cancels pending invitations, and ends active games.
- Reports persist for the server operator.

### Demo assets and references

- 9 total fictional profiles, 26 posts, 8 boards, and 7 portfolio projects are present.
- Every post's creator and every board's saved post ID resolves.
- All locally referenced SVG assets exist.
- All 18 remote Unsplash photograph endpoints returned HTTP 200 with an image content type during validation.
- Photo sources, license reference, original artwork, and fictional identity boundaries are recorded in `public/ASSET-SOURCES.md`.

## Executed browser checks

Tested in the Codex in-app browser, with desktop 1280×720 and mobile 390×844 viewports. The two real test accounts used separate cookie stores at localhost and 127.0.0.1 against the same local server. Their runtime database is excluded from the repository.

- **Discovery and boards:** opened post details, verified original-source attribution, posted a comment, created a board while saving, and searched by interest. The board and comment persisted across reloads.
- **Accounts and onboarding:** created two real accounts through the interface. Completed all five onboarding steps with interests, aesthetics, self-selected descriptors, goals, two visual inspirations, and profile preview. Verified the starter board contained both selected items and the real profile had no fabricated projects.
- **Optional onboarding on mobile:** completed a fresh demo profile with every optional step skipped. The new Sam profile had empty projects and posts, an empty starter board, and no inherited fictional portfolio work.
- **Profile and publishing:** published a written reflection; changed the bio and accent; moved Boards above Projects through accessible up/down controls; verified the updated page and persistence after reload.
- **Private messages:** sent a request from the first real account, accepted it in the second session, replied, refreshed the first session, and saw the correct private conversation. Also tested the labelled browser-local demo request and reply flow.
- **Social boundaries:** followed a real account; blocked it from the chat menu and observed its removal from People; unblocked it through Settings.
- **Practice:** played five rounds entirely through the visible card controls. Verified the final 5–0 result, five-round recap, and persisted match history.
- **Multiplayer:** sent and accepted a real invitation, entered the same server match in both sessions, locked each player's cards, observed the waiting state without an opponent card, refreshed for each reveal, and completed all five rounds. The final score was 2–3, including two tied rounds awarding 0.5 each. Verified both recaps and the results screen's Message action.
- **Responsive layouts:** inspected desktop Discover, profile, People, messaging, Play and duel screens; inspected the mobile feed, bottom navigation, game lobby, multiplayer results and recap. DOM measurements found no horizontal overflow at 390px.
- **Accessibility:** form controls and buttons had accessible names; native dialog Escape dismissal worked. Keyboard card selection focus is restored after rendering. Reduced-motion CSS and focus-visible styles are included.
- **Compact navigation:** verified the mobile Create control retained its accessible name after its visual text was hidden. The desktop sidebar footer stayed within the 720px viewport after the compact-height adjustment.
- **Assets and errors:** visible feed images loaded; browser console had no uncaught JavaScript errors in the final reviewed session. Empty real-account portfolio sections and unavailable people states displayed actionable explanations.

Browser review found and fixed invitation-dialog loss during hash navigation, a mismatched invitation request field, a nested form label, oversized reflection previews, and sidebar overflow at compact desktop heights. Invitation request-field regressions are covered by tests.

### Remaining verification limits

This is a targeted browser review, not a full accessibility audit or device-lab certification. Exhaustive keyboard traversal, screen-reader testing, a simulated offline network, reduced-motion OS emulation, and real file-picker uploads across operating systems were not exhaustively tested. Image type/byte/size boundaries, private-profile rules, report persistence, rejection/abandonment, and unauthorized requests are covered by automated server tests. Public-host HTTPS, distributed deployment, and production load were not tested.

## Deployment verification

No public deployment has been performed. The optional Dockerfile is provided but has not been built or run in this workspace. External HTTPS, secure-cookie configuration, persistent hosting, operational backups, and multi-device access require verification on the selected host.
