# Wasserball Strapi

This Strapi application models sponsor data and tournament data used by the
public website. The project is configured in TypeScript and follows Strapi's
supported migration path for existing applications.

## TypeScript setup

- Root server TypeScript config: `tsconfig.json`
- Admin TypeScript config: `src/admin/tsconfig.json`
- Strapi config, bootstrap, and sponsor API code are implemented as `.ts` files
- Content-type schemas remain JSON, as required by Strapi

## Sponsor model

The `Sponsor` collection type contains:

- `sponsor`
- `logo` (single media relation)
- `alt`
- `url`
- `selector`
- `tokenMultiplier`
- `sortOrder`
- `active`

On boot, the app syncs the existing sponsor configuration into Strapi from
`src/seed/sponsors.json`. The `logo` values in that file are upload URLs from the
Strapi Media Library, and those values are resolved to real upload records so
the sponsor entries store a media relation instead of a plain string path.

Seeding is controlled by `SEED_SPONSORS_ON_BOOT` and is enabled in the
Kubernetes production config so a fresh production database is populated during
Strapi startup.

## Tournament data model (group phase)

### Team (`api::team.team`)

- `name` (required, unique)
- `nationality` (required enum: `NL` | `DE`)
- `isPresent` (attendance flag, defaults to `true`)
- `knockoutSlot` (optional, unique manual knockout assignment `1` through `8`)
- `group` (many-to-one relation to Group)

### Group (`api::group.group`)

- `name` (required, unique)
- `teams` (one-to-many relation to Team)
- `matches` (one-to-many relation to Group Match)

### Group Match (`api::group-match.group-match`)

- `matchNumber` (required, unique integer)
- `phase` (`group_phase`, `lucky_second_playoff`, or `quarterfinal`)
- `matchStatus` (enum: `scheduled` | `completed`)
- `playedAt` (datetime, optional)
- Team 1 / Team 2 scores (optional integer >= 0)
- Team 1 / Team 2 penalty points (integer >= 0, default `0`)
- `group` (many-to-one relation to Group; only required logically for group matches)
- Team 1 / Team 2 relations (optional for future knockout matches)
- `roundSlot` (match slot within a knockout phase)

## Tournament API endpoints

All content APIs are under `/api`.

### Teams

- `GET /api/teams` → list all teams (default includes group relation)
- `GET /api/teams/:id` → fetch a single team by ID (default includes group relation)

### Groups

- `GET /api/groups`
- `GET /api/groups/:id`

### Group matches (results for public web)

- `GET /api/group-matches` (default includes group/homeTeam/awayTeam relations)
- `GET /api/group-matches/:id`
- `PUT /api/group-matches/:id` to update scores and set status to `completed`

## Group phase generator

A custom endpoint generates round-robin matches (3 matches per group):

- `POST /api/groups/generate-group-phase`

Validation rules:

- exactly 4 groups must exist
- each group must contain 2 to 4 present teams

Behavior:

- creates a complete round robin for all present teams in each group
- creates only missing matches (idempotent for existing pairings)
- cancels scheduled matches involving absent teams
- reactivates cancelled matches when both teams are present again
- refuses attendance changes that would invalidate completed matches
- assigns incremental `matchNumber`
- creates matches with `phase=group_phase` and `matchStatus=scheduled`

## Knockout round generator

Assign the eight knockout positions manually through `Team.knockoutSlot`. Once
all positions `1` through `8` are assigned, the generator creates the complete
knockout bracket:

- `POST /api/knockout/generate`

Positions `1–2`, `3–4`, `5–6`, and `7–8` form quarterfinals 1 through 4.
Semifinals 1 and 2 receive the winners of quarterfinals `1–2` and `3–4`.
The semifinal winners advance to the final and the losers to the third-place
match. Participant assignments happen automatically when a knockout match is
completed with a non-drawn result. Repeated generator calls reuse existing
matches and only create missing bracket matches.
