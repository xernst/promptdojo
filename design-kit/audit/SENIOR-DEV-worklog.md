# Senior Dev Worklog — Refresh v1

## What shipped
- PR 1: refresh/01-fonts-and-colors — pending commit — in progress

## What didn't ship (and why)
- (TBD — log on stop)

## Unrelated bugs noticed
- `lib/generated/v2/manifest.toc.json` shows a timestamp-only diff after `pnpm build`. Reset before commit, but the prebuild stamping the file means it always shows in `git status` after a build. Worth gitignoring or making deterministic in V2.
- Pre-existing python solution failures during content build for `15-error-handling/exercise_1`, `15-error-handling/exercise_4`, etc. — content authoring issue, not within refresh scope.
- Legacy `components/ChapterNav.tsx:92` uses `text-ink-700` on a decorative `<Circle>` icon (not text). Per plan it's flagged but stays in tree until V2 deletion. Skipped.

## Brand-alignment self-grade
- Before: 5/10 (per Brand Guardian audit context)
- After: TBD

## Verification results
- (TBD — post final push)
