import { state } from './state.js';
import { idbGet, idbDelete, lsSet, lsGet, lsDel } from './db.js';
import {
    els,
    showSessionBanner,
    renderStats,
    updateResults,
    renderMergeFileList,
    renderAlignmentPreviewTable
} from './ui.js';
import { renderSearchTab } from './components/searchTab.js';
import { renderMetaTab } from './components/metaTab.js';
import { renderAlignTab } from './components/alignTab.js';
import { renderMergeTab } from './components/mergeTab.js';
import { renderQaTab } from './components/qaTab.js';
import { switchTab, loadSharedFile, savePreferences } from './shared.js';
import { initSearchController, updateSearchScopeUI } from './searchController.js';
import { initMergeController, removeMergeFile, moveMergeFile } from './mergeController.js';
import { initMetaController } from './metaController.js';
import { initAlignController, resetAlignment, handleAlignRowAction } from './alignController.js';
import { initQaController, clearQaState as resetQa, refreshQaFileInfo } from './qaController.js';

export async function clearSession() {
    if (!confirm("Are you sure you want to clear the session? All loaded files and unsaved changes will be permanently deleted.")) {
        return;
    }
    await Promise.all([
        idbDelete('tmxData'),
        idbDelete('mergeFiles'),
        idbDelete('metaEditorData'),
        idbDelete('alignedPairs')
    ]);
    ['searchQuery','sourceOnly','targetOnly','useRegex','currentPage','activeTab',
     'mergeSrcLang','mergeTgtLang','mergeAuthor','mergeTool','mergeRemoveDuplicates',
     'fileName','fileSize','metaFileName','metaFileSize','darkMode',
     'mm_qaRuleToggles'].forEach(lsDel);
    document.documentElement.classList.remove('dark');

    state.tmxData = { units: [], sourceLanguage: '', targetLanguage: '', metadata: {} };
    state.filteredUnits = [];
    state.mergeFiles = [];
    state.metaEditorData = { units: [], metadata: {} };
    state.currentPage = 1;
    state.alignedPairs = [];

    els.fileText.textContent = 'Select or drop your file';
    els.fileName.textContent = '';
    els.fileSize.textContent = '';

    const dropZone = document.getElementById('dropZoneContainer');
    const fUnits = document.getElementById('fileUnits');
    if (dropZone) dropZone.classList.remove('hidden');
    if (fUnits) fUnits.textContent = '';

    els.fileInfo.classList.add('hidden');
    els.searchAndResultsContainer.classList.add('hidden');
    els.statsPanel.classList.add('hidden');
    els.errorMessage.classList.add('hidden');
    els.searchInput.value = '';
    els.sourceOnly.checked = false;
    els.targetOnly.checked = false;
    els.useRegex.checked = false;
    if (els.downloadUpdatedTmxBtn) {
        els.downloadUpdatedTmxBtn.classList.add('hidden');
    }
    updateSearchScopeUI('both');

    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    els.mergeSrcLang.value = '';
    els.mergeTgtLang.value = '';
    els.mergeAuthor.value = '';
    els.mergeTool.value = 'MemoMemo';

    els.metaFileText.textContent = 'Select or drop file';
    els.metaFileName.textContent = '';
    els.metaFileSize.textContent = '';

    const metaDropZone = document.getElementById('metaDropZoneContainer');
    const mUnits = document.getElementById('metaFileUnits');
    if (metaDropZone) metaDropZone.classList.remove('hidden');
    if (mUnits) mUnits.textContent = '';

    els.metaFileInfo.classList.add('hidden');
    els.metadataCard.classList.add('hidden');
    els.metaEditorStatus.classList.add('hidden');

    resetAlignment();
    resetQa();

    document.getElementById('sessionBanner').classList.add('hidden');
    showSessionBanner('Session cleared successfully.', false);
}

async function restoreSession() {
    const savedTab = lsGet('activeTab', 'search');

    const savedQuery = lsGet('searchQuery', '');
    const savedSrcO = lsGet('sourceOnly', false);
    const savedTgtO = lsGet('targetOnly', false);
    const savedRegex = lsGet('useRegex', false);

    if (savedQuery) els.searchInput.value = savedQuery;
    if (savedRegex) els.useRegex.checked = true;
    state.currentPage = lsGet('currentPage', 1);

    if (savedSrcO) {
        updateSearchScopeUI('source');
    } else if (savedTgtO) {
        updateSearchScopeUI('target');
    } else {
        updateSearchScopeUI('both');
    }

    const msl = lsGet('mergeSrcLang'); if (msl !== null) els.mergeSrcLang.value = msl;
    const mtl = lsGet('mergeTgtLang'); if (mtl !== null) els.mergeTgtLang.value = mtl;
    const ma = lsGet('mergeAuthor'); if (ma !== null) els.mergeAuthor.value = ma;
    const mt = lsGet('mergeTool'); if (mt !== null) els.mergeTool.value = mt;
    const mrd = lsGet('mergeRemoveDuplicates'); if (mrd !== null) els.mergeRemoveDuplicates.checked = mrd;

    const savedDark = lsGet('darkMode', false);
    if (savedDark) {
        document.documentElement.classList.add('dark');
        const sun = document.getElementById('darkModeSun');
        const moon = document.getElementById('darkModeMoon');
        if (sun) sun.classList.remove('hidden');
        if (moon) moon.classList.add('hidden');
    }

    const [savedTmx, savedMerge, savedMeta] = await Promise.all([
        idbGet('tmxData'),
        idbGet('mergeFiles'),
        idbGet('metaEditorData')
    ]);

    let restored = false;

    if (savedTmx && savedTmx.units && savedTmx.units.length > 0) {
        state.tmxData = savedTmx;
        state.filteredUnits = [...state.tmxData.units];

        const fn = lsGet('fileName', '');
        const fs = lsGet('fileSize', '');
        els.fileText.textContent = 'File loaded!';
        if (fn) els.fileName.textContent = fn;
        if (fs) els.fileSize.textContent = fs;

        const dropZone = document.getElementById('dropZoneContainer');
        const fUnits = document.getElementById('fileUnits');
        if (dropZone) dropZone.classList.add('hidden');
        if (fUnits) fUnits.textContent = ` • ${state.tmxData.units.length} units`;

        els.fileInfo.classList.remove('hidden');
        els.fileStats.textContent = `${state.tmxData.units.length} translation units`;
        els.sourceLanguage.textContent = state.tmxData.sourceLanguage || '--';
        els.targetLanguage.textContent = state.tmxData.targetLanguage || '--';
        els.errorMessage.classList.add('hidden');
        els.searchAndResultsContainer.classList.remove('hidden');
        els.resultsSection.classList.remove('hidden');
        if (els.downloadUpdatedTmxBtn) {
            els.downloadUpdatedTmxBtn.classList.remove('hidden');
        }
        updateResults(state);
        renderStats(state.tmxData.units);
        refreshQaFileInfo();
        restored = true;
    }

    if (savedMerge && savedMerge.length > 0) {
        state.mergeFiles = savedMerge;
    renderMergeFileList(state, removeMergeFile, moveMergeFile);
        restored = true;
    }

    if (savedMeta && savedMeta.units && savedMeta.units.length > 0) {
        state.metaEditorData = savedMeta;
        const mfn = lsGet('metaFileName', '');
        const mfs = lsGet('metaFileSize', '');
        els.metaFileText.textContent = 'File loaded!';
        if (mfn) els.metaFileName.textContent = mfn;
        if (mfs) els.metaFileSize.textContent = mfs;

        const metaDropZone = document.getElementById('metaDropZoneContainer');
        const mUnits = document.getElementById('metaFileUnits');
        if (metaDropZone) metaDropZone.classList.add('hidden');
        if (mUnits) mUnits.textContent = ` • ${state.metaEditorData.units.length} units`;

        els.metaFileInfo.classList.remove('hidden');
        els.metaFileStats.textContent =
            `${state.metaEditorData.units.length} translation units found`;
        els.metaAuthor.value = state.metaEditorData.metadata.creationid || '';
        els.metaToolDisplay.textContent = state.metaEditorData.metadata.creationtool || 'MemoMemo';
        els.metaToolVersion.value = state.metaEditorData.metadata.creationtoolversion || '';
        els.metaCreationDate.value = state.metaEditorData.metadata.creationdate || '';
        els.metaSrcLang.value = state.metaEditorData.metadata.srclang || '';
        els.metaTgtLang.value = state.metaEditorData.metadata.adminlang || '';
        els.metaDatatype.value = state.metaEditorData.metadata.datatype || '';
        els.metaSegtype.value = state.metaEditorData.metadata.segtype || '';
        els.metadataCard.classList.remove('hidden');
        restored = true;
    }

    const savedAlign = await idbGet('alignedPairs');
    if (savedAlign && savedAlign.length > 0) {
        state.alignedPairs = savedAlign;
        if (els.alignInputSection) els.alignInputSection.classList.add('hidden');
        if (els.alignPreviewSection) els.alignPreviewSection.classList.remove('hidden');
        renderAlignmentPreviewTable(state.alignedPairs, handleAlignRowAction);
        restored = true;
    }

    switchTab(savedTab);

    if (restored) {
        showSessionBanner(
            `<span>✓ Previous session restored automatically.</span>` +
            `<button onclick="clearSession()" ` +
            `class="ml-4 px-3 py-1 rounded border border-current font-semibold text-xs hover:opacity-75 transition whitespace-nowrap">` +
            `Clear session</button>`,
            true
        );
    }

    [els.mergeSrcLang, els.mergeTgtLang, els.mergeAuthor, els.mergeTool].forEach(el =>
        el.addEventListener('input', savePreferences)
    );
    els.mergeRemoveDuplicates.addEventListener('change', savePreferences);
}

function handleGlobalKeydown(e) {
    if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (els.searchInput) {
            switchTab('search');
            els.searchInput.focus();
            els.searchInput.select();
        }
        return;
    }

    const activeTab = lsGet('activeTab', 'search');
    if (activeTab !== 'search') return;

    const isTyping = document.activeElement && (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA' ||
        document.activeElement.isContentEditable
    );

    const focusedRow = document.activeElement &&
        document.activeElement.tagName === 'TR' &&
        els.resultsTable &&
        els.resultsTable.contains(document.activeElement);

    if (focusedRow) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = document.activeElement.nextElementSibling;
            if (next && next.tagName === 'TR') next.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = document.activeElement.previousElementSibling;
            if (prev && prev.tagName === 'TR') prev.focus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (typeof document.activeElement.startEditing === 'function') {
                document.activeElement.startEditing();
            }
        } else if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            const copyBtn = document.activeElement.querySelector('button[aria-label^="Copy source"]');
            if (copyBtn) copyBtn.click();
        } else if (e.altKey && e.key.toLowerCase() === 't') {
            e.preventDefault();
            const copyBtn = document.activeElement.querySelector('button[aria-label^="Copy target"]');
            if (copyBtn) copyBtn.click();
        }
        return;
    }

    if (!isTyping && state.tmxData && state.tmxData.units.length > 0) {
        const pageCount = Math.ceil(state.filteredUnits.length / state.itemsPerPage);
        if (e.key === 'PageDown') {
            e.preventDefault();
            if (state.currentPage < pageCount) { state.currentPage++; updateResults(state); }
        } else if (e.key === 'PageUp') {
            e.preventDefault();
            if (state.currentPage > 1) { state.currentPage--; updateResults(state); }
        }
    }
}

function init() {
    const tabSearchContent = document.getElementById('tabSearchContent');
    const tabMetaContent = document.getElementById('tabMetaContent');
    const tabAlignContent = document.getElementById('tabAlignContent');
    const tabMergeContent = document.getElementById('tabMergeContent');

    if (tabSearchContent) tabSearchContent.innerHTML = renderSearchTab();
    if (tabMetaContent) tabMetaContent.innerHTML = renderMetaTab();
    if (tabAlignContent) tabAlignContent.innerHTML = renderAlignTab();
    if (tabMergeContent) tabMergeContent.innerHTML = renderMergeTab();

    const tabQaContent = document.getElementById('tabQaContent');
    if (tabQaContent) tabQaContent.innerHTML = renderQaTab();

    window.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('idb-error', (e) => showSessionBanner(`⚠️ ${e.detail}`, false));

    els.tabSearchBtn.addEventListener('click', () => switchTab('search'));
    els.tabMergeBtn.addEventListener('click', () => switchTab('merge'));
    els.tabMetaBtn.addEventListener('click', () => switchTab('meta'));
    els.tabQaBtn.addEventListener('click', () => switchTab('qa'));

    initSearchController();
    initMergeController();
    initMetaController();
    initAlignController();
    initQaController();

    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            lsSet('darkMode', isDark);
            const sun = document.getElementById('darkModeSun');
            const moon = document.getElementById('darkModeMoon');
            if (sun) sun.classList.toggle('hidden', !isDark);
            if (moon) moon.classList.toggle('hidden', isDark);
        });
    }

    restoreSession();
}

window.clearSession = clearSession;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
