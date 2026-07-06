# Memo Memo — Agent Instructions

## Zero-build static app
No build step, no `npm install`, no package.json. Open `index.html` or serve with:

```
npx serve .
python -m http.server 8080
```

ES modules may fail from `file://` — use a static server.

## Architecture
- `index.html` — shell with tab navigation, CDN scripts (Tailwind CSS, JSZip)
- `js/state.js` — singleton mutable app state
- `js/db.js` — IndexedDB (`MemoMemo_DB`) for data; `mm_*` prefixed keys in localStorage for prefs
- `js/parsers.js` — TMX/XLIFF/CSV parsers
- `js/exporter.js` — TMX 1.4 XML builder
- `js/aligner.js` — positional sentence alignment (index-based, not ML)
- `js/ui.js` — DOM element registry (`els.*` getters), rendering helpers
- `js/main.js` — orchestrator, event wiring, session restore
- `js/components/*.js` — HTML template injection per tab

## Key conventions
- Files >20 MB rejected; extensions validated: `tmx, xliff, xlf, sdlxliff, csv`
- XML pre-validated via `DOMParser` before parsing
- All core functions imported as ES module `import`/`export`
- Session auto-saved to IndexedDB on edits; restored on load
- If UI seems broken after a change, check `els.*` getters in `ui.js` match actual DOM ids

## Keyboard shortcuts (Search tab only)
`Alt+S` search focus, `PgUp/PgDn` paginate, arrows navigate rows, `Enter` edit cell, `Alt+C`/`Alt+T` copy source/target.

## Design skill (`.skill` bundle)
`design-auditor-v1.2.13.skill` in the project root is a packaged OpenCode skill for design auditing. Load it with the `skill` tool when working on UI/design changes.

## No tests, no CI, no lint/format/typecheck config
The project has zero testing infrastructure. Verify changes manually.
