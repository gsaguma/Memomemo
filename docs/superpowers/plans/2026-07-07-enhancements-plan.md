# Enhancement Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add 4 lightweight features: Find & Replace, detailed stats, keyboard shortcuts, glossary CRUD

**Architecture:** All features are independent, operate on in-memory data, and use zero new dependencies. Each touches 1-2 files.

**Tech Stack:** Vanilla JS, ES modules, localStorage, IndexedDB

## Global Constraints

- Zero build step, no npm, no package.json
- No DOM-heavy operations (pagination at 100-200 items)
- Follow existing patterns in `js/` directory
- All color classes use theme-aware CSS variable classes (bg-surface, text-body, etc.)

---

### Task 1: Detailed File Statistics

**Files:**
- Modify: `js/shared.js`
- Modify: `js/components/searchTab.js` (already has `#fileStats` span)

**Interfaces:**
- Consumes: `state.tmxData` (units array, sourceLanguage, targetLanguage)
- Produces: Formatted stats string set on `els.fileStats.textContent`

- [ ] **Step 1: Read existing shared.js to understand loadSharedFile structure**

Read `js/shared.js` lines 50-70 to see where file info is rendered.

- [ ] **Step 2: Add statistics computation in loadSharedFile**

In `js/shared.js`, inside `loadSharedFile()`, after the existing `els.fileStats.textContent` line, add a single-pass stats computation:

```js
const units = parsedData.units;
const srcLang = parsedData.sourceLanguage || '?';
const tgtLang = parsedData.targetLanguage || '?';
let srcChars = 0, tgtChars = 0, srcWords = 0, tgtWords = 0, emptyTgt = 0, srcEqTgt = 0;
for (const u of units) {
    const s = u.source || '';
    const t = u.target || '';
    srcChars += s.length;
    tgtChars += t.length;
    srcWords += s.split(/\s+/).filter(Boolean).length;
    tgtWords += t.split(/\s+/).filter(Boolean).length;
    if (!t.trim()) emptyTgt++;
    if (s === t) srcEqTgt++;
}
const fmt = n => n.toLocaleString('en-US');
els.fileStats.textContent += ` · ${srcLang}→${tgtLang} · ${fmt(units.length)} segments · ${fmt(srcChars)} src chars · ${fmt(tgtChars)} tgt chars · ${fmt(srcWords)} src words · ${fmt(tgtWords)} tgt words · ${emptyTgt} empty · ${srcEqTgt} src=tgt`;
```

- [ ] **Step 3: Verify**

Open `index.html` on a static server, upload a TMX file, confirm stats line appears in file info bar.

- [ ] **Step 4: Commit**

```bash
git add js/shared.js
git commit -m "feat: add detailed file statistics (chars, words, empty, src=tgt)"
```

---

### Task 2: Find & Replace (Target only)

**Files:**
- Create: `js/findReplace.js`
- Modify: `js/components/searchTab.js`
- Modify: `js/searchController.js`

**Interfaces:**
- Consumes: `state.tmxData.units`, `idbSet` from `db.js`
- Produces: `window.findAndReplace(findText, replaceText, useRegex)` function

- [ ] **Step 1: Create js/findReplace.js**

```js
import { state } from './state.js';
import { idbSet } from './db.js';
import { updateResults } from './ui.js';

export function findAndReplace(findText, replaceText, useRegex) {
    if (!findText) { alert('Enter text to find.'); return; }
    const units = state.tmxData.units;
    let totalReplaced = 0;
    let totalUnits = 0;

    try {
        for (const unit of units) {
            const t = unit.target || '';
            let newTarget;
            if (useRegex) {
                const flags = findText.startsWith('/') && findText.endsWith('/')
                    ? findText.slice(1, -1)
                    : findText;
                const pattern = findText.startsWith('/') && findText.endsWith('/')
                    ? new RegExp(flags, 'g')
                    : new RegExp(findText, 'g');
                newTarget = t.replace(pattern, replaceText);
            } else {
                newTarget = t.split(findText).join(replaceText);
            }
            if (newTarget !== t) {
                unit.target = newTarget;
                totalUnits++;
                totalReplaced += countMatches(t, findText, useRegex);
            }
        }
    } catch (err) {
        alert('Regex error: ' + err.message);
        return;
    }

    state.filteredUnits = [...units];
    idbSet('tmxData', state.tmxData);
    updateResults(state);

    if (totalUnits === 0) {
        alert('No matches found.');
    } else {
        const occ = totalReplaced === 1 ? 'occurrence' : 'occurrences';
        const un = totalUnits === 1 ? 'unit' : 'units';
        alert(`Replaced ${totalReplaced} ${occ} across ${totalUnits} ${un}.`);
    }
}

function countMatches(text, findText, useRegex) {
    try {
        if (useRegex) {
            const flags = findText.startsWith('/') && findText.endsWith('/')
                ? findText.slice(1, -1)
                : findText;
            const pattern = findText.startsWith('/') && findText.endsWith('/')
                ? new RegExp(flags, 'g')
                : new RegExp(findText, 'g');
            return (text.match(pattern) || []).length;
        }
        return text.split(findText).length - 1;
    } catch { return 0; }
}
```

- [ ] **Step 2: Add F&R UI to searchTab.js**

Add this section after the scope buttons in the search tab template (`js/components/searchTab.js`):

```js
            <!-- Find & Replace -->
            <div class="bg-surface rounded-lg p-3 border border-default mt-3">
                <div class="flex flex-wrap gap-2 items-end">
                    <div class="flex-1 min-w-[120px]">
                        <label for="findReplaceFind" class="block text-xs text-muted mb-0.5">Find (target)</label>
                        <input type="text" id="findReplaceFind" placeholder="Text or /regex/" class="w-full px-2 py-1.5 text-sm border border-default rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <div class="flex-1 min-w-[120px]">
                        <label for="findReplaceReplace" class="block text-xs text-muted mb-0.5">Replace</label>
                        <input type="text" id="findReplaceReplace" placeholder="Replacement text" class="w-full px-2 py-1.5 text-sm border border-default rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary">
                    </div>
                    <div class="flex items-center gap-2 pb-1">
                        <label class="text-xs text-muted flex items-center gap-1 cursor-pointer">
                            <input type="checkbox" id="findReplaceRegex" class="rounded border-default text-primary focus:ring-primary">
                            Regex
                        </label>
                        <button id="findReplaceBtn" class="bg-primary hover:bg-opacity-90 text-white text-xs font-medium px-3 py-1.5 rounded transition">Replace All</button>
                    </div>
                </div>
            </div>
```

Locate the section right before `</div>` closing of the search section (after the scope buttons block).

- [ ] **Step 3: Wire F&R in searchController.js**

In `js/searchController.js`, at the end of `initSearchController()`:

```js
    const findReplaceBtn = document.getElementById('findReplaceBtn');
    if (findReplaceBtn) {
        findReplaceBtn.addEventListener('click', () => {
            const find = document.getElementById('findReplaceFind').value;
            const replace = document.getElementById('findReplaceReplace').value;
            const regex = document.getElementById('findReplaceRegex').checked;
            findAndReplace(find, replace, regex);
        });
    }
```

Also add the import at top: `import { findAndReplace } from './findReplace.js';`

- [ ] **Step 4: Commit**

```bash
git add js/findReplace.js js/components/searchTab.js js/searchController.js
git commit -m "feat: add Find & Replace (target only, regex optional)"
```

---

### Task 3: Keyboard Shortcuts (All Tabs)

**Files:**
- Modify: `js/main.js`

**Interfaces:**
- Consumes: `els.*` from `ui.js`, controller functions
- Produces: `document.addEventListener('keydown', ...)`

- [ ] **Step 1: Read main.js to find initialization section**

Read `js/main.js` lines 200-230 to find `init()` and where to add the keyboard listener.

- [ ] **Step 2: Add keyboard shortcut dispatcher in main.js**

Inside `init()` (before or after existing event wiring), add:

```js
    document.addEventListener('keydown', (e) => {
        const activeTab = document.querySelector('#tabSearchContent:not(.hidden), #tabMetaContent:not(.hidden), #tabAlignContent:not(.hidden), #tabMergeContent:not(.hidden), #tabQaContent:not(.hidden)');
        const isQa = activeTab && activeTab.id === 'tabQaContent';
        const isMeta = activeTab && activeTab.id === 'tabMetaContent';
        const isMerge = activeTab && activeTab.id === 'tabMergeContent';
        const isAlign = activeTab && activeTab.id === 'tabAlignContent';
        const isSearch = activeTab && activeTab.id === 'tabSearchContent';
        const tag = document.activeElement && document.activeElement.tagName;
        const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        if (e.key === 'F5' && isQa) {
            e.preventDefault();
            const qaRunAllBtn = document.getElementById('qaRunAllBtn');
            if (qaRunAllBtn) qaRunAllBtn.click();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    if (isMeta) { e.preventDefault(); const btn = document.getElementById('saveMetaBtn'); if (btn) btn.click(); }
                    break;
                case 'm':
                    if (isMerge) { e.preventDefault(); const btn = document.getElementById('startMergeBtn'); if (btn) btn.click(); }
                    break;
                case 'e':
                    if (isAlign) { e.preventDefault(); const btn = document.getElementById('alignDownloadBtn'); if (btn) btn.click(); }
                    break;
                case 'g':
                    if (isQa) { e.preventDefault(); const btn = document.getElementById('qaImportGlossaryBtn'); if (btn) btn.click(); }
                    break;
            }
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
            if (e.key.toLowerCase() === 'enter' && isQa) {
                e.preventDefault();
                const btn = document.getElementById('qaRunAllBtn');
                if (btn) btn.click();
            }
            return;
        }

        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && isQa) {
            e.preventDefault();
            const btn = document.getElementById('qaRunBtn');
            if (btn) btn.click();
            return;
        }

        if (e.key === 'Delete' && isQa && !inInput) {
            const btn = document.getElementById('qaDeleteSelectedBtn');
            if (btn && !btn.disabled) btn.click();
        }
    });
```

Note: The `Ctrl+Enter` and `Ctrl+Shift+Enter` cases are combined above. Let me restructure to avoid duplicate conditions. The correct logic:

```js
    document.addEventListener('keydown', (e) => {
        const activeTab = document.querySelector('#tabSearchContent:not(.hidden), #tabMetaContent:not(.hidden), #tabAlignContent:not(.hidden), #tabMergeContent:not(.hidden), #tabQaContent:not(.hidden)');
        if (!activeTab) return;
        const isQa = activeTab.id === 'tabQaContent';
        const isMeta = activeTab.id === 'tabMetaContent';
        const isMerge = activeTab.id === 'tabMergeContent';
        const isAlign = activeTab.id === 'tabAlignContent';
        const tag = document.activeElement && document.activeElement.tagName;
        const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

        if (e.key === 'F5' && isQa) {
            e.preventDefault();
            const btn = document.getElementById('qaRunAllBtn');
            if (btn) btn.click();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'enter' && isQa) {
            e.preventDefault();
            const btn = document.getElementById('qaRunBtn');
            if (btn) btn.click();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'enter' && isQa) {
            e.preventDefault();
            const btn = document.getElementById('qaRunAllBtn');
            if (btn) btn.click();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            switch (e.key.toLowerCase()) {
                case 's':
                    if (isMeta) { e.preventDefault(); const btn = document.getElementById('saveMetaBtn'); if (btn) btn.click(); }
                    break;
                case 'm':
                    if (isMerge) { e.preventDefault(); const btn = document.getElementById('startMergeBtn'); if (btn) btn.click(); }
                    break;
                case 'e':
                    if (isAlign) { e.preventDefault(); const btn = document.getElementById('alignDownloadBtn'); if (btn) btn.click(); }
                    break;
                case 'g':
                    if (isQa) { e.preventDefault(); const btn = document.getElementById('qaImportGlossaryBtn'); if (btn) btn.click(); }
                    break;
            }
            return;
        }

        if (e.key === 'Delete' && isQa && !inInput) {
            const btn = document.getElementById('qaDeleteSelectedBtn');
            if (btn && !btn.disabled) btn.click();
        }
    });
```

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: add keyboard shortcuts for Meta (Ctrl+S), Merge (Ctrl+M), Align (Ctrl+E), QA (Ctrl+Enter, F5, Delete, Ctrl+G)"
```

---

### Task 4: Glossary CRUD

**Files:**
- Modify: `js/components/qaTab.js`
- Modify: `js/qaController.js`

**Interfaces:**
- Consumes: `getGlossary()`, `setGlossary()` from `js/rules/terminology.js`
- Produces: Glossary CRUD section in QA tab with pagination, add/edit/delete

- [ ] **Step 1: Add glossary CRUD template to qaTab.js**

Add this after the rules list section (before the loading spinner), inside `renderQaTab()`:

```js
            <!-- Glossary CRUD -->
            <details id="qaGlossarySection" class="bg-surface rounded-lg shadow-md border border-default overflow-hidden">
                <summary class="flex items-center justify-between px-4 py-3 bg-surface-alt cursor-pointer hover:bg-surface-hover text-sm font-medium">
                    <span class="flex items-center gap-2">
                        <svg class="h-4 w-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        Glossary — <span id="qaGlossaryCount">0</span> entries
                    </span>
                    <div class="flex gap-2">
                        <button type="button" id="qaGlossaryAddBtn" class="text-xs bg-primary text-white font-medium px-2 py-1 rounded hover:bg-opacity-90 transition">+ Add Entry</button>
                        <button type="button" id="qaGlossaryImportBtn" class="text-xs text-primary hover:underline border border-primary rounded px-2 py-1">Import</button>
                    </div>
                </summary>
                <div class="p-3">
                    <div id="qaGlossaryTable" class="divide-y divide-default text-sm"></div>
                    <div id="qaGlossaryPagination" class="flex items-center justify-center gap-2 mt-2 text-xs"></div>
                </div>
            </details>
```

Place it right after the `</div>` closing of `#qaRulesList`'s parent div and its button row, before the `<!-- Loading -->` section.

- [ ] **Step 2: Add glossary CRUD functions to qaController.js**

Add these imports at top if not present: `import { getGlossary, setGlossary } from './rules/terminology.js';` (already imported).

Add the following functions before `initQaController()`:

```js
const _GLOSSARY_PAGE_SIZE = 100;
let _glossaryCurrentPage = 1;

function renderGlossary() {
    const table = document.getElementById('qaGlossaryTable');
    const count = document.getElementById('qaGlossaryCount');
    const pagination = document.getElementById('qaGlossaryPagination');
    if (!table) return;

    const entries = getGlossary();
    count.textContent = entries.length;

    const totalPages = Math.ceil(entries.length / _GLOSSARY_PAGE_SIZE) || 1;
    if (_glossaryCurrentPage > totalPages) _glossaryCurrentPage = totalPages;
    const start = (_glossaryCurrentPage - 1) * _GLOSSARY_PAGE_SIZE;
    const page = entries.slice(start, start + _GLOSSARY_PAGE_SIZE);

    table.innerHTML = '';
    if (entries.length === 0) {
        table.innerHTML = '<div class="py-4 text-center text-xs text-muted">No glossary entries. Add one above or import a file.</div>';
        pagination.innerHTML = '';
        return;
    }

    for (const [idx, entry] of page.entries()) {
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2 py-1.5';

        const sourceInput = document.createElement('input');
        sourceInput.type = 'text';
        sourceInput.value = entry.source;
        sourceInput.className = 'flex-1 min-w-0 px-2 py-1 text-xs border border-default rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary';

        const arrow = document.createElement('span');
        arrow.className = 'text-faint text-xs';
        arrow.textContent = '→';

        const targetInput = document.createElement('input');
        targetInput.type = 'text';
        targetInput.value = entry.target;
        targetInput.className = 'flex-1 min-w-0 px-2 py-1 text-xs border border-default rounded bg-surface focus:outline-none focus:ring-1 focus:ring-primary';

        const delBtn = document.createElement('button');
        delBtn.className = 'text-red-500 hover:text-red-700 text-xs font-medium px-1';
        delBtn.textContent = '✕';
        delBtn.title = 'Delete entry';
        delBtn.addEventListener('click', () => {
            const all = getGlossary();
            const realIdx = start + idx;
            all.splice(realIdx, 1);
            setGlossary(all);
            if (_glossaryCurrentPage > Math.ceil(all.length / _GLOSSARY_PAGE_SIZE)) _glossaryCurrentPage = Math.max(1, Math.ceil(all.length / _GLOSSARY_PAGE_SIZE));
            renderGlossary();
        });

        sourceInput.addEventListener('change', () => {
            const all = getGlossary();
            const realIdx = start + idx;
            all[realIdx].source = sourceInput.value;
            setGlossary(all);
        });
        targetInput.addEventListener('change', () => {
            const all = getGlossary();
            const realIdx = start + idx;
            all[realIdx].target = targetInput.value;
            setGlossary(all);
        });

        row.appendChild(sourceInput);
        row.appendChild(arrow);
        row.appendChild(targetInput);
        row.appendChild(delBtn);
        table.appendChild(row);
    }

    // Pagination
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = _glossaryCurrentPage <= 1;
    prevBtn.className = 'px-2 py-1 rounded text-xs ' + (_glossaryCurrentPage <= 1 ? 'text-faint cursor-default' : 'text-primary hover:underline');
    prevBtn.addEventListener('click', () => {
        if (_glossaryCurrentPage > 1) { _glossaryCurrentPage--; renderGlossary(); }
    });
    pagination.appendChild(prevBtn);

    const span = document.createElement('span');
    span.className = 'text-xs text-muted px-2';
    const end = Math.min(_glossaryCurrentPage * _GLOSSARY_PAGE_SIZE, entries.length);
    span.textContent = `${start + 1}–${end} of ${entries.length}`;
    pagination.appendChild(span);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = _glossaryCurrentPage >= totalPages;
    nextBtn.className = 'px-2 py-1 rounded text-xs ' + (_glossaryCurrentPage >= totalPages ? 'text-faint cursor-default' : 'text-primary hover:underline');
    nextBtn.addEventListener('click', () => {
        if (_glossaryCurrentPage < totalPages) { _glossaryCurrentPage++; renderGlossary(); }
    });
    pagination.appendChild(nextBtn);
}
```

- [ ] **Step 3: Wire glossary CRUD events in initQaController**

In `js/qaController.js`, inside `initQaController()`, add after existing event wiring:

```js
    document.getElementById('qaGlossaryAddBtn').addEventListener('click', () => {
        const all = getGlossary();
        all.unshift({ source: '', target: '' });
        setGlossary(all);
        _glossaryCurrentPage = 1;
        renderGlossary();
        // Focus the first source input after render
        setTimeout(() => {
            const firstInput = document.querySelector('#qaGlossaryTable input');
            if (firstInput) firstInput.focus();
        }, 50);
    });

    document.getElementById('qaGlossaryImportBtn').addEventListener('click', () => {
        const input = document.getElementById('qaGlossaryFileInput');
        if (input) input.click();
    });

    renderGlossary();
```

Also wire the existing glossary file input change event to re-render after import. Find the existing file input handler and add `renderGlossary();` at the end:

In `initQaController`, find:
```js
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) importGlossaryFromFile(fileInput.files[0]);
            fileInput.value = '';
        });
```

Change to:
```js
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) { importGlossaryFromFile(fileInput.files[0]); renderGlossary(); }
            fileInput.value = '';
        });
```

- [ ] **Step 4: Commit**

```bash
git add js/components/qaTab.js js/qaController.js
git commit -m "feat: add glossary CRUD with inline edit, pagination, add/delete"
```

---

### Self-Review

Check spec coverage:
- [x] Find & Replace → Task 2
- [x] Detailed statistics → Task 1
- [x] Keyboard shortcuts → Task 3
- [x] Glossary CRUD → Task 4

No placeholders, no contradictions, all signatures consistent.
