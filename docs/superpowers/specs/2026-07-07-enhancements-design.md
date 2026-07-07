# Memo Memo — Enhancement Features Design

Date: 2026-07-07

## Overview

Four independent, lightweight features that add high value without degrading performance. Zero new dependencies, zero DOM-heavy operations.

---

## Feature 1: Find & Replace (Target only)

**File:** `js/findReplace.js` (new), integrated into Search tab via button.

**UI:**
- Section in search tab with two inputs: Find (text/regex) and Replace (text)
- Checkbox "Use Regex"
- Button "Replace All"
- Counter output: `alert("Replaced N occurrences across M units.")`

**Logic:**
- Iterates `state.tmxData.units`, applies replacement only on `unit.target`
- If regex, uses `new RegExp(find, 'g')`; else uses `String.split(find).join(replace)`
- Single `idbSet('tmxData', ...)` call after all replacements
- Refreshes search results if visible

**Edge cases:**
- Empty find input → no-op
- Regex invalid → catch + alert error message
- No matches → alert "No matches found"
- Regex without `g` flag → auto-appended

---

## Feature 2: Detailed File Statistics

**File:** `js/shared.js` (calculation in `loadSharedFile`)

**Display:** Single line appended to existing `#fileStats` element.

**Metrics computed in one O(n) pass:**
- Source language → Target language
- Total segments (already shown)
- Total source chars (sum of `unit.source.length`)
- Total target chars (sum of `unit.target.length`)
- Total source words (`split(/\s+/).filter(Boolean).length`)
- Total target words
- Empty target count (`unit.target.trim() === ''`)
- Source=target count (`unit.source === unit.target`)

**Format:**
```
ES→EN · 25,234 segments · 1,234,567 src chars · 1,456,789 tgt chars · 230,456 src words · 280,123 tgt words · 34 empty · 12 src=tgt
```

---

## Feature 3: Keyboard Shortcuts (All Tabs)

**File:** `js/main.js` — single `document.addEventListener('keydown', dispatch)`

**Table:**

| Tab   | Shortcut     | Action                              |
|-------|-------------|--------------------------------------|
| Meta  | `Ctrl+S`     | Click `#saveMetaBtn`                |
| Merge | `Ctrl+M`     | Click `#startMergeBtn`              |
| Align | `↑` `↓`      | Focus prev/next row in align table  |
|       | `Ctrl+E`     | Click download/export button        |
| QA    | `Ctrl+Enter` | `runSelectedChecks()`               |
|       | `Ctrl+Shift+Enter` | `runAllChecks()`              |
|       | `↑` `↓`      | Focus prev/next issue row           |
|       | `Delete`     | `deleteSelectedIssues()`            |
|       | `Ctrl+G`     | Click import glossary button        |
|       | `F5`         | Re-run last checks (`_lastRunRuleIds`) |

**Constraints:**
- Do not override native browser shortcuts (e.g., `Ctrl+N`, `Ctrl+T`)
- Disabled when input/textarea is focused (unless shortcut targets input)
- Tab-scoped: shortcut only fires when its tab is active

---

## Feature 4: Glossary CRUD

**File:** `js/qaController.js` (logic), `js/components/qaTab.js` (template)

**UI placement:** After rule checkboxes, before loading spinner. Collapsible `<details>` summary: "Glossary — N entries".

**Components:**
- `details` with `summary` showing entry count
- "Add Entry" button → creates editable row at top of list
- "Import Glossary" button (existing, moved inside)
- Paginated table (100 entries/page) with source/target text inputs per row
- Delete checkbox per row + "Delete Selected" button
- Prev/Next pagination (identical pattern to QA results)
- Inline edit: clicking a row makes source/target editable (same pattern as search inline edit)

**Data:** `localStorage` key `mm_qaGlossary`, same format as `terminology.js`.

**Operations:**
- Add: `prepend` to array + `setGlossary()` + re-render page 1
- Edit: update entry in array + `setGlossary()`
- Delete single: `splice` + `setGlossary()` + re-render
- Delete selected: sort indices descending + `splice` each + `setGlossary()` + re-render

---

## Files Changed

| File | Change |
|------|--------|
| `js/findReplace.js` | **New** — Find & Replace logic |
| `js/components/searchTab.js` | Add F&R UI section |
| `js/searchController.js` | Wire F&R button, init F&R handler |
| `js/shared.js` | Add statistics computation in `loadSharedFile` |
| `js/main.js` | Add keyboard shortcut dispatcher |
| `js/components/qaTab.js` | Add glossary CRUD template section |
| `js/qaController.js` | Add glossary add/edit/delete/pagination functions |

---

## Non-Goals

- Fuzzy match / leverage analysis
- Batch operations on source text
- Edit history / undo
- Multi-user collaboration
- Any server-side feature
