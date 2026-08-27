# RUNBOOK — Entertainment Radar weekly build

**Every scheduled/weekly run MUST read this file after cloning the repo and follow it.
This file is the canonical instruction channel between Lir's Cowork sessions and the
scheduled Friday task — project memory is NOT reliably visible to scheduled runs.
If Lir's project memory IS reachable (desktop connected), read it too; where they
conflict, the newer instruction wins and this file should be updated to match.**

## What this is
Single-page site (index.html, `var DATA=[...]` rendered client-side) at
https://radar.lir.coach — GitHub Pages from travellir/radar, CNAME set.
Edition numbering: weekly scour = new major (ed.N.0), same-day republish = minor.
Stamp appears twice: header `.stamp` and footer.

## Weekly run procedure
1. Clone repo, read this RUNBOOK fully.
2. **Token-efficient verify** — do NOT re-research everything:
   - Re-verify ONLY: items in the "⚡ Book soon" alertbox; anything Lir 🚩-flagged;
     items whose listed dates end within 14 days; items not verified for 28+ days.
   - Long-running theatre shows: monthly check unless a closing notice appears.
   - Purge anything whose dates have passed. Never list undated recurring events as dated.
3. **Hunt NEW listings** (the main weekly effort) — sources in Lir's taste profile
   (project memory) and previous editions. Cloud fetch only; login-walled sources
   (Eventbrite, OutSavvy, Instagram, Central Tickets, Audience Club) need her Chrome —
   skip when unattended and note the gap.
4. **Programme build-out rotation**: pick 2–3 venues/cards with thin `subs[]` and
   deepen their programme. Note which were done in the commit message so the next
   run rotates onward.
5. Set `n:1` on cards new vs the previous edition (diff slugs against git history);
   clear stale `n:1`.
6. Preserve ALL UI/JS outside the DATA line — nav design is deliberate
   (admin-mode toggle ⚙, collapsed Book soon / New section / My flags, ♥♥♥♥♥ chip,
   no Free filter, no Travel dropdown, ?pins= shared views). Do not regress it.
7. Verify: `node --check` extracted JS, Playwright smoke test
   (chromium at /opt/pw-browsers/chromium), THEN deploy.

## Deploy
- With deploy token (in the scheduled task prompt): clone with
  `https://x-access-token:<TOKEN>@github.com/travellir/radar.git`, commit
  `ed.N.N — summary`, push. NEVER print the token.
- Without token: fall back to Chrome upload via Lir's desktop (see project memory),
  or deliver the file and note the pending deploy.
- After push: `git fetch` and grep origin/main for the new ed number. Pages ~40s,
  Fastly cache up to 10 min.

## Content rules (page is shared with others)
- Neutral editorial voice; no second person; no "watchlist" wording on the page.
- Direct booking links only. Date-check everything against today.
- Link straight to the onward booking page, never an aggregator/listing page (e.g. immersiverumours.com/current-shows-london lists many shows on one page) — resolve each show to its own ticket link (e.g. "Our Failed State" -> https://www.eventbrite.com/e/our-failed-state-is-beautiful-tickets-1985363759449).
- Never relist (confirmed dead/closed): Gingerline, The Grand Expedition,
  The Lodge Space, Free Range open mic at The Glitch, Goldie Saloon,
  Queer Brewing Taproom.

## Flag semantics (from Lir's pasted "Copy my flags")
- ✓ booked → never resuggest that event; strongest more-like-this signal.
- 📌 to-book → keep prominent in Book soon while urgent; positive taste signal
  (~half booked weight). Absence of a previous pin from a new paste means NOTHING
  (flags are per-browser localStorage) — treat pastes as a union.
- ✕ less-like-this → down-weight the type. 🚩 → re-verify that listing.
