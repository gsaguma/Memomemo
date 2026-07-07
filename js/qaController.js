import { state } from './state.js';
import { els, escapeHtml } from './ui.js';
import { runChecks, getRulesList } from './qaEngine.js';
import { idbGet, idbSet } from './db.js';
import { getGlossary, setGlossary } from './rules/terminology.js';
import { preloadGrammarPatterns } from './rules/grammar.js';
import { preloadSpelling } from './rules/spelling.js';

let currentIssues = [];
let currentFilter = 'all';
let _lastRunRuleIds = null;
const _PAGE_SIZE = 200;
let _currentPage = 1;

function getFileInfo() {
    const fn = document.getElementById('fileName');
    const fs = document.getElementById('fileSize');
    const name = fn ? fn.textContent : '';
    const size = fs ? fs.textContent : '';
    return name ? `${name} ${size}` : 'No file loaded';
}

function updateFileInfo() {
    const infoEl = document.getElementById('qaFileInfo');
    if (infoEl) infoEl.textContent = getFileInfo();
}

function renderRuleCheckboxes() {
    const list = document.getElementById('qaRulesList');
    if (!list) return;
    list.innerHTML = '';

    const allRules = getRulesList();
    const groups = {};
    for (const rule of allRules) {
        if (!groups[rule.category]) groups[rule.category] = [];
        groups[rule.category].push(rule);
    }

    const savedState = loadRuleToggleState();

    for (const [category, rules] of Object.entries(groups)) {
        const catTitle = document.createElement('div');
        catTitle.className = 'col-span-1 md:col-span-3 text-xs font-semibold text-muted uppercase tracking-wide mt-2 mb-0.5';
        catTitle.textContent = category;
        list.appendChild(catTitle);

        for (const rule of rules) {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-0.5 px-1 rounded hover:bg-surface-alt cursor-pointer text-sm';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = 'qaRule-' + rule.id;
            cb.checked = savedState[rule.id] !== false;
            cb.className = 'rounded border-default text-primary focus:ring-primary';

            const name = document.createElement('span');
            name.textContent = rule.name;

            label.appendChild(cb);
            label.appendChild(name);
            list.appendChild(label);
        }
    }
}

function loadRuleToggleState() {
    try {
        const raw = localStorage.getItem('mm_qaRuleToggles');
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

function saveRuleToggleState() {
    const state = {};
    document.querySelectorAll('#qaRulesList input[type="checkbox"]').forEach(cb => {
        state[cb.id.replace('qaRule-', '')] = cb.checked;
    });
    localStorage.setItem('mm_qaRuleToggles', JSON.stringify(state));
}

function getActiveRuleIds() {
    const ids = [];
    document.querySelectorAll('#qaRulesList input[type="checkbox"]:checked').forEach(cb => {
        ids.push(cb.id.replace('qaRule-', ''));
    });
    return ids;
}

function renderPagination(totalItems, totalPages, currentPage) {
    const el = document.getElementById('qaPagination');
    if (!el) return;
    el.innerHTML = '';
    if (totalPages <= 1) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');

    const nav = document.createElement('div');
    nav.className = 'flex items-center justify-center gap-2 text-sm';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Prev';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.className = 'px-3 py-1 rounded text-xs ' + (currentPage <= 1 ? 'text-faint cursor-default' : 'text-primary hover:underline');
    prevBtn.addEventListener('click', () => { if (currentPage > 1) { _currentPage = currentPage - 1; renderResults(currentIssues); window.scrollTo(0, 0); } });
    nav.appendChild(prevBtn);

    const span = document.createElement('span');
    span.className = 'text-xs text-muted px-2';
    const start = (currentPage - 1) * _PAGE_SIZE + 1;
    const end = Math.min(currentPage * _PAGE_SIZE, totalItems);
    span.textContent = `${start}–${end} of ${totalItems}`;
    nav.appendChild(span);

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.className = 'px-3 py-1 rounded text-xs ' + (currentPage >= totalPages ? 'text-faint cursor-default' : 'text-primary hover:underline');
    nextBtn.addEventListener('click', () => { if (currentPage < totalPages) { _currentPage = currentPage + 1; renderResults(currentIssues); window.scrollTo(0, 0); } });
    nav.appendChild(nextBtn);

    el.appendChild(nav);
}

function renderResults(issues) {
    const container = document.getElementById('qaResults');
    const summary = document.getElementById('qaSummary');
    const actions = document.getElementById('qaActions');
    if (!container) return;

    container.innerHTML = '';
    container.classList.remove('hidden');
    summary.classList.remove('hidden');
    actions.classList.remove('hidden');

    document.getElementById('qaCountError').textContent = issues.filter(i => i.priority === 'error').length;
    document.getElementById('qaCountWarning').textContent = issues.filter(i => i.priority === 'warning').length;
    document.getElementById('qaCountInfo').textContent = issues.filter(i => i.priority === 'info').length;

    const filtered = currentFilter === 'all' ? issues : issues.filter(i => i.priority === currentFilter);

    if (filtered.length === 0) {
        container.innerHTML = '<div class="bg-surface rounded-lg p-6 text-center text-muted text-sm">No issues found for the selected filter.</div>';
        return;
    }

    const totalPages = Math.ceil(filtered.length / _PAGE_SIZE) || 1;
    if (_currentPage > totalPages) _currentPage = totalPages;
    const start = (_currentPage - 1) * _PAGE_SIZE;
    const pageSlice = filtered.slice(start, start + _PAGE_SIZE);

    const groups = {};
    for (const issue of pageSlice) {
        const key = issue.category + ' / ' + issue.ruleName;
        if (!groups[key]) groups[key] = { category: issue.category, rule: issue.ruleName, issues: [] };
        groups[key].issues.push(issue);
    }

    for (const [groupKey, group] of Object.entries(groups)) {
        const details = document.createElement('details');
        details.className = 'bg-surface rounded-lg shadow-md border border-default overflow-hidden';

        const summaryEl = document.createElement('summary');
        summaryEl.className = 'flex items-center justify-between px-4 py-3 bg-surface-alt cursor-pointer hover:bg-surface-hover text-sm font-medium';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-2';
        left.innerHTML = `
            <svg class="h-4 w-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span>${escapeHtml(group.category)}</span>
            <span class="text-faint font-normal">/</span>
            <span class="font-semibold">${escapeHtml(group.rule)}</span>
        `;

        const right = document.createElement('div');
        right.className = 'flex gap-2 text-xs';
        const ce = group.issues.filter(i => i.priority === 'error').length;
        const cw = group.issues.filter(i => i.priority === 'warning').length;
        const ci = group.issues.filter(i => i.priority === 'info').length;
        if (ce) right.innerHTML += `<span class="text-red-600 font-semibold">${ce} error${ce !== 1 ? 's' : ''}</span>`;
        if (cw) right.innerHTML += `<span class="text-yellow-600 font-semibold">${cw} warning${cw !== 1 ? 's' : ''}</span>`;
        if (ci) right.innerHTML += `<span class="text-blue-600 font-semibold">${ci} info</span>`;

        summaryEl.appendChild(left);
        summaryEl.appendChild(right);
        details.appendChild(summaryEl);

        const listDiv = document.createElement('div');
        listDiv.className = 'divide-y divide-gray-100 dark:divide-gray-700';

        for (const issue of group.issues) {
            const row = document.createElement('div');
            row.className = 'flex items-start gap-3 px-4 py-3 hover:bg-surface-alt transition text-sm';
            row.setAttribute('data-tu-index', issue.tuIndex);

            const selTd = document.createElement('div');
            selTd.className = 'pt-0.5';
            const selCb = document.createElement('input');
            selCb.type = 'checkbox';
            selCb.checked = issue.selected;
            selCb.className = 'rounded border-default text-primary focus:ring-primary issue-select';
            selCb.addEventListener('change', () => {
                issue.selected = selCb.checked;
                updateDeleteBtn();
            });
            selTd.appendChild(selCb);

            const prioDot = document.createElement('div');
            prioDot.className = 'pt-1';
            const dotColors = { error: 'bg-red-500', warning: 'bg-yellow-500', info: 'bg-blue-500' };
            prioDot.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${dotColors[issue.priority] || 'bg-gray-400'}"></span>`;

            const content = document.createElement('div');
            content.className = 'flex-grow min-w-0';

            const msg = document.createElement('div');
            msg.className = 'text-body';
            msg.textContent = issue.message;

            if (issue.source || issue.target) {
                const preview = document.createElement('div');
                preview.className = 'mt-1 text-xs text-muted truncate';
                const s = (issue.source || '').length > 60 ? (issue.source || '').slice(0, 60) + '...' : (issue.source || '');
                const t = (issue.target || '').length > 60 ? (issue.target || '').slice(0, 60) + '...' : (issue.target || '');
                preview.textContent = `[${issue.tuIndex}] ${s} → ${t}`;
                content.appendChild(msg);
                content.appendChild(preview);
            } else {
                content.appendChild(msg);
            }

            const tuBadge = document.createElement('div');
            tuBadge.className = 'text-xs text-faint font-mono whitespace-nowrap pt-0.5';
            tuBadge.textContent = `#${issue.tuIndex}`;

            row.appendChild(selTd);
            row.appendChild(prioDot);
            row.appendChild(content);
            row.appendChild(tuBadge);

            if (issue.fix && issue.fix.type === 'delete') {
                const fixBtn = document.createElement('button');
                fixBtn.className = 'ml-2 text-red-500 hover:text-red-700 text-xs font-medium whitespace-nowrap';
                fixBtn.title = 'Delete this TU';
                fixBtn.textContent = 'Delete';
                fixBtn.addEventListener('click', () => deleteSingleIssue(issue));
                tuBadge.appendChild(fixBtn);
            }

            listDiv.appendChild(row);
        }

        details.appendChild(listDiv);
        container.appendChild(details);
    }

    renderPagination(filtered.length, totalPages, _currentPage);
    updateDeleteBtn();
}

function updateDeleteBtn() {
    const btn = document.getElementById('qaDeleteSelectedBtn');
    if (!btn) return;
    const count = currentIssues.filter(i => i.selected).length;
    btn.disabled = count === 0;
    btn.textContent = count > 0 ? `Delete Selected (${count})` : 'Delete Selected';
}

function reRunWithLastRules() {
    if (!_lastRunRuleIds || _lastRunRuleIds.length === 0) return;
    const units = state.tmxData.units;
    if (!units || units.length === 0) {
        clearQaState();
        return;
    }
    const result = runChecks(units, _lastRunRuleIds);
    currentIssues = result.issues;
    currentFilter = 'all';
    _currentPage = 1;
    renderResults(currentIssues);
}

function deleteSingleIssue(issue) {
    if (issue.tuIndex === undefined || issue.tuIndex < 0 || issue.tuIndex >= state.tmxData.units.length) return;
    state.tmxData.units.splice(issue.tuIndex, 1);
    state.filteredUnits = [...state.tmxData.units];
    idbSet('tmxData', state.tmxData);
    reRunWithLastRules();
}

function deleteSelectedIssues() {
    const selected = currentIssues.filter(i => i.selected);
    if (selected.length === 0) return;

    const indices = new Set(selected.map(i => i.tuIndex).filter(idx => idx >= 0 && idx < state.tmxData.units.length));
    if (indices.size === 0) return;

    const sorted = [...indices].sort((a, b) => b - a);
    for (const idx of sorted) {
        state.tmxData.units.splice(idx, 1);
    }
    state.filteredUnits = [...state.tmxData.units];
    idbSet('tmxData', state.tmxData);

    reRunWithLastRules();
}

function runAllChecks() {
    const units = state.tmxData.units;
    if (!units || units.length === 0) {
        alert('No translation units loaded. Upload a file in the Search & View tab first.');
        return;
    }

    document.getElementById('qaLoading').classList.remove('hidden');
    document.getElementById('qaLoadingText').textContent = 'Running all checks...';

    const tgtLang = state.tmxData.targetLanguage || state.tmxData.sourceLanguage || '';
    const preloads = [preloadGrammarPatterns(tgtLang), preloadSpelling(tgtLang)];
    Promise.all(preloads).then(() => {
        setTimeout(() => {
            _lastRunRuleIds = getRulesList().map(r => r.id);
            const result = runChecks(units, _lastRunRuleIds);
            currentIssues = result.issues;
            currentFilter = 'all';
            _currentPage = 1;
            document.getElementById('qaLoading').classList.add('hidden');
            renderResults(currentIssues);
        }, 50);
    });
}

function runSelectedChecks() {
    const units = state.tmxData.units;
    if (!units || units.length === 0) {
        alert('No translation units loaded. Upload a file in the Search & View tab first.');
        return;
    }

    const activeIds = getActiveRuleIds();
    if (activeIds.length === 0) {
        alert('Select at least one check to run.');
        return;
    }

    document.getElementById('qaLoading').classList.remove('hidden');
    document.getElementById('qaLoadingText').textContent = 'Running selected checks...';

    const tgtLang = state.tmxData.targetLanguage || state.tmxData.sourceLanguage || '';
    const preloads = [preloadGrammarPatterns(tgtLang)];
    if (activeIds.includes('spelling')) preloads.push(preloadSpelling(tgtLang));
    Promise.all(preloads).then(() => {
        setTimeout(() => {
            _lastRunRuleIds = activeIds;
            const result = runChecks(units, _lastRunRuleIds);
            currentIssues = result.issues;
            currentFilter = 'all';
            _currentPage = 1;
            document.getElementById('qaLoading').classList.add('hidden');
            renderResults(currentIssues);
        }, 50);
    });
}

function setFilter(priority) {
    currentFilter = priority;
    _currentPage = 1;
    renderResults(currentIssues);

    document.querySelectorAll('#qaFilters button').forEach(btn => {
        btn.className = 'px-2 py-1 rounded text-xs ' + (
            btn.id === 'qaFilter' + priority.charAt(0).toUpperCase() + priority.slice(1)
                ? 'bg-primary text-white'
                : 'bg-surface-alt hover:bg-surface-hover text-body'
        );
    });
}

function selectAllRules(checked) {
    document.querySelectorAll('#qaRulesList input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
    });
    saveRuleToggleState();
}

function importGlossaryFromFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const raw = e.target.result;
            const ext = file.name.split('.').pop().toLowerCase();
            let pairs = [];

            if (ext === 'csv') {
                const lines = raw.split(/\r?\n/).filter(l => l.trim());
                for (const line of lines) {
                    const parts = line.split(',');
                    if (parts.length >= 2) pairs.push({ source: parts[0].trim(), target: parts[1].trim() });
                }
            } else if (['tmx', 'xlf', 'xliff', 'sdlxliff'].includes(ext)) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(raw, 'text/xml');
                const tus = xml.getElementsByTagName('tu');
                for (const tu of tus) {
                    const tuvs = tu.getElementsByTagName('tuv');
                    const texts = [];
                    for (const tuv of tuvs) {
                        const seg = tuv.getElementsByTagName('seg')[0];
                        if (seg) texts.push(seg.textContent.trim());
                    }
                    if (texts.length >= 2) pairs.push({ source: texts[0], target: texts[1] });
                }
            }

            if (pairs.length > 0) {
                const existing = getGlossary();
                setGlossary([...existing, ...pairs]);
                alert(`Imported ${pairs.length} glossary entr${pairs.length === 1 ? 'y' : 'ies'}.`);
            } else {
                alert('No valid term pairs found in the file.');
            }
        } catch (err) {
            alert('Failed to parse glossary file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

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

        sourceInput.addEventListener('input', () => {
            entry.source = sourceInput.value;
            setGlossary(entries);
        });
        targetInput.addEventListener('input', () => {
            entry.target = targetInput.value;
            setGlossary(entries);
        });

        row.appendChild(sourceInput);
        row.appendChild(arrow);
        row.appendChild(targetInput);
        row.appendChild(delBtn);
        table.appendChild(row);
    }

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

export function initQaController() {
    renderRuleCheckboxes();

    document.getElementById('qaSelectAllBtn').addEventListener('click', () => selectAllRules(true));
    document.getElementById('qaDeselectAllBtn').addEventListener('click', () => selectAllRules(false));

    document.getElementById('qaRunBtn').addEventListener('click', runSelectedChecks);
    document.getElementById('qaRunAllBtn').addEventListener('click', runAllChecks);

    document.getElementById('qaDeleteSelectedBtn').addEventListener('click', deleteSelectedIssues);

    document.getElementById('qaFilterAll').addEventListener('click', () => setFilter('all'));
    document.getElementById('qaFilterError').addEventListener('click', () => setFilter('error'));
    document.getElementById('qaFilterWarning').addEventListener('click', () => setFilter('warning'));
    document.getElementById('qaFilterInfo').addEventListener('click', () => setFilter('info'));

    document.getElementById('qaRulesList').addEventListener('change', saveRuleToggleState);

    const importBtn = document.getElementById('qaImportGlossaryBtn');
    const fileInput = document.getElementById('qaGlossaryFileInput');
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) { importGlossaryFromFile(fileInput.files[0]); renderGlossary(); }
            fileInput.value = '';
        });
    }

    document.getElementById('qaGlossaryAddBtn').addEventListener('click', () => {
        const all = getGlossary();
        all.unshift({ source: '', target: '' });
        setGlossary(all);
        _glossaryCurrentPage = 1;
        renderGlossary();
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

    setTimeout(updateFileInfo, 100);
}

export function refreshQaFileInfo() {
    updateFileInfo();
}

export function clearQaState() {
    currentIssues = [];
    currentFilter = 'all';
    _lastRunRuleIds = null;
    _currentPage = 1;
    const container = document.getElementById('qaResults');
    if (container) { container.innerHTML = ''; container.classList.add('hidden'); }
    const summary = document.getElementById('qaSummary');
    if (summary) summary.classList.add('hidden');
    const actions = document.getElementById('qaActions');
    if (actions) actions.classList.add('hidden');
    const pagination = document.getElementById('qaPagination');
    if (pagination) { pagination.innerHTML = ''; pagination.classList.add('hidden'); }
    updateFileInfo();
}
