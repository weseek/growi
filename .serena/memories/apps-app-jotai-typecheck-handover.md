Handover Tips for Jotai migration & TS typecheck (support/use-jotai)

Context:
- Goal: Eliminate TS2488 errors caused by legacy tuple-style custom hooks after migrating to Jotai single-value hooks.
- Command per CLAUDE.md: `cd apps/app && pnpm run lint:typecheck` (ONLY this for type checking).
- Branch: support/use-jotai

Current Status (at interruption):
- All identified tuple destructuring patterns converted to single-value usage (e.g. `const value = useXxx();`).
- Last edited file: `src/client/components/Sidebar/SidebarNav/SecondaryItems.tsx` (removed `[isAdmin]`, `[growiCloudUri]`, `[isGuestUser]`).
- A rerun of typecheck after this final change was attempted but the command execution was cancelled, so confirmation of 0 remaining TS2488 errors is still pending.
- Previously remaining single TS error (TS2488) was always of the same form: `const [something] = useHook();`.
- Other non-blocking lint issues still present (console logs in `PageView.tsx`, `<img>` tags without `alt` or Next.js `<Image>` replacement, `any` types). These do NOT affect `vue-tsc` typecheck success but will appear when running full lint tasks.

Likely Next Step:
1. Run: `cd apps/app && pnpm run lint:typecheck`.
2. If TS2488 still appears, fix by:
   - Change `const [name] = useSomeHook();` to `const name = useSomeHook();`.
   - Remove unused variable names if no longer needed.
3. Repeat until typecheck passes with no errors.

Useful Grep (do manually in next session):
- Search residual tuple patterns: `grep -R "const \[" apps/app/src/client apps/app/src/components | grep use`.

Patterns Already Normalized:
- `useCurrentUser`, `useCurrentPageData`, `useCurrentPageId`, `useCurrentPagePath`, `useLatestRevision`, `usePageNotFound`, `useIsEditable`, all `useIsGuestUser|ReadOnlyUser|SharedUser|Admin|DefaultLogo`, server config atoms (showPageLimitation*, isMailerSetup, etc.), remote revision hooks.

Remote Revision Migration:
- All former imports from `~/stores/remote-latest-page` replaced by hooks in `~/states/page` (e.g. `useSetRemoteLatestPageData`, `useRemoteRevisionId`, etc.). If any stragglers appear, replace path and remove tuple destructuring.

Caveats:
- Do NOT reintroduce tuple destructuring; hooks now return single values.
- Avoid modifying console logs, `<img>` tags, or lint-only issues unless explicitly tasked (keep scope focused so auto-approve remains stable).

Definition of Done:
- `pnpm run lint:typecheck` exits 0 with no TS errors.

If Additional Errors Appear:
- TS2307 (old remote-latest-page path): update import to `~/states/page` and adjust variable names to direct values.
- TS2724/TS2305 (missing exports for removed legacy hooks): replace usage with the new atom-based hook listed in `/states/*` directories.

After Success (Optional Future Tasks):
- Remove debug `console.log` in `PageView.tsx`.
- Replace `<img>` with Next `<Image>` and add `alt` attributes where flagged.
- Tighten `any` usages in files like `ProfileImageSettings.tsx`, `CustomizeLogoSetting.tsx`.

Quick Checklist For Next Session:
[ ] Run typecheck command
[ ] Fix any residual TS2488
[ ] Re-run until clean
[ ] Commit with message: "chore(app): remove remaining tuple destructuring for jotai migration"
