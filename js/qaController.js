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
        const catDiv = document.createElement('div');
        catDiv.className = 'mb-2';

        const catTitle = document.createElement('div');
        catTitle.className = 'text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1';
        catTitle.textContent = category;
        catDiv.appendChild(catTitle);

        for (const rule of rules) {
            const label = document.createElement('label');
            label.className = 'flex items-center gap-2 py-0.5 px-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-sm';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.id = 'qaRule-' + rule.id;
            cb.checked = savedState[rule.id] !== false;
            cb.className = 'rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary';

            const name = document.createElement('span');
            name.textContent = rule.name;

            label.appendChild(cb);
            label.appendChild(name);
            catDiv.appendChild(label);
        }

        list.appendChild(catDiv);
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
        container.innerHTML = '<div class="bg-white rounded-lg p-6 text-center text-gray-500 text-sm">No issues found for the selected filter.</div>';
        return;
    }

    const groups = {};
    for (const issue of filtered) {
        const key = issue.category + ' / ' + issue.ruleName;
        if (!groups[key]) groups[key] = { category: issue.category, rule: issue.ruleName, issues: [] };
        groups[key].issues.push(issue);
    }

    for (const [groupKey, group] of Object.entries(groups)) {
        const details = document.createElement('details');
        details.className = 'bg-white rounded-lg shadow-md border border-[#93C5FD] overflow-hidden';
        details.open = true;

        const summaryEl = document.createElement('summary');
        summaryEl.className = 'flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750 text-sm font-medium';

        const left = document.createElement('div');
        left.className = 'flex items-center gap-2';
        left.innerHTML = `
            <svg class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span>${escapeHtml(group.category)}</span>
            <span class="text-gray-400 font-normal">/</span>
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
            row.className = 'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm';
            row.setAttribute('data-tu-index', issue.tuIndex);

            const selTd = document.createElement('div');
            selTd.className = 'pt-0.5';
            const selCb = document.createElement('input');
            selCb.type = 'checkbox';
            selCb.checked = issue.selected;
            selCb.className = 'rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary issue-select';
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
            msg.className = 'text-gray-700 dark:text-gray-200';
            msg.textContent = issue.message;

            if (issue.source || issue.target) {
                const preview = document.createElement('div');
                preview.className = 'mt-1 text-xs text-gray-500 dark:text-gray-400 truncate';
                const s = (issue.source || '').length > 60 ? (issue.source || '').slice(0, 60) + '...' : (issue.source || '');
                const t = (issue.target || '').length > 60 ? (issue.target || '').slice(0, 60) + '...' : (issue.target || '');
                preview.textContent = `[${issue.tuIndex}] ${escapeHtml(s)} → ${escapeHtml(t)}`;
                content.appendChild(msg);
                content.appendChild(preview);
            } else {
                content.appendChild(msg);
            }

            const tuBadge = document.createElement('div');
            tuBadge.className = 'text-xs text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap pt-0.5';
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
            document.getElementById('qaLoading').classList.add('hidden');
            renderResults(currentIssues);
        }, 50);
    });
}

function setFilter(priority) {
    currentFilter = priority;
    renderResults(currentIssues);

    document.querySelectorAll('#qaFilters button').forEach(btn => {
        btn.className = 'px-2 py-1 rounded text-xs ' + (
            btn.id === 'qaFilter' + priority.charAt(0).toUpperCase() + priority.slice(1)
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        );
    });
}

function selectAllRules(checked) {
    document.querySelectorAll('#qaRulesList input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
    });
    saveRuleToggleState();
}

function renderGlossary() {
    const list = document.getElementById('qaGlossaryList');
    const count = document.getElementById('qaGlossaryCount');
    if (!list) return;
    const entries = getGlossary();
    count.textContent = entries.length + ' entr' + (entries.length === 1 ? 'y' : 'ies');
    if (entries.length === 0) {
        list.innerHTML = '<div class="text-xs text-gray-400 text-center py-2">No glossary entries.</div>';
        return;
    }
    list.innerHTML = '';
    entries.forEach((entry, idx) => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-2 px-2 py-1 rounded bg-gray-50 dark:bg-gray-800 text-sm';
        const label = document.createElement('span');
        label.className = 'truncate';
        label.textContent = entry.source + ' → ' + entry.target;
        row.appendChild(label);
        const del = document.createElement('button');
        del.className = 'text-red-500 hover:text-red-700 text-xs font-medium whitespace-nowrap ml-2';
        del.textContent = 'Delete';
        del.addEventListener('click', () => {
            const updated = getGlossary();
            updated.splice(idx, 1);
            setGlossary(updated);
            renderGlossary();
        });
        row.appendChild(del);
        list.appendChild(row);
    });
}

function addGlossaryEntry() {
    const srcInput = document.getElementById('qaGlossarySrc');
    const tgtInput = document.getElementById('qaGlossaryTgt');
    const src = srcInput.value.trim();
    const tgt = tgtInput.value.trim();
    if (!src || !tgt) return;
    const entries = getGlossary();
    entries.push({ source: src, target: tgt });
    setGlossary(entries);
    srcInput.value = '';
    tgtInput.value = '';
    renderGlossary();
}

export function initQaController() {
    renderRuleCheckboxes();
    renderGlossary();

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

    document.getElementById('qaGlossaryAddBtn').addEventListener('click', addGlossaryEntry);
    document.getElementById('qaGlossarySrc').addEventListener('keydown', e => { if (e.key === 'Enter') addGlossaryEntry(); });
    document.getElementById('qaGlossaryTgt').addEventListener('keydown', e => { if (e.key === 'Enter') addGlossaryEntry(); });

    setTimeout(updateFileInfo, 100);
}

export function refreshQaFileInfo() {
    updateFileInfo();
}

export function clearQaState() {
    currentIssues = [];
    currentFilter = 'all';
    _lastRunRuleIds = null;
    const container = document.getElementById('qaResults');
    if (container) { container.innerHTML = ''; container.classList.add('hidden'); }
    const summary = document.getElementById('qaSummary');
    if (summary) summary.classList.add('hidden');
    const actions = document.getElementById('qaActions');
    if (actions) actions.classList.add('hidden');
    updateFileInfo();
}
