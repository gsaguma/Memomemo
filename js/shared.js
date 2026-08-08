import { state } from './state.js';
import { idbSet, lsSet } from './db.js';
import {
    els, renderStats, updateResults, formatFileSize, updateTabUI
} from './ui.js';

export function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function savePreferences() {
    lsSet('searchQuery', els.searchInput?.value || '');
    lsSet('sourceOnly', els.sourceOnly?.checked || false);
    lsSet('targetOnly', els.targetOnly?.checked || false);
    lsSet('useRegex', els.useRegex?.checked || false);
    lsSet('currentPage', state.currentPage);
    lsSet('mergeSrcLang', els.mergeSrcLang?.value || '');
    lsSet('mergeTgtLang', els.mergeTgtLang?.value || '');
    lsSet('mergeAuthor', els.mergeAuthor?.value || '');
    lsSet('mergeTool', els.mergeTool?.value || '');
    lsSet('mergeRemoveDuplicates', els.mergeRemoveDuplicates?.checked ?? true);
}

export function switchTab(tab) {
    updateTabUI(tab);
    lsSet('activeTab', tab);
}

export function formatTmxDate(inputStr) {
    if (!inputStr) {
        return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    if (/^\d{8}T\d{6}Z$/.test(inputStr)) {
        return inputStr;
    }
    const timestamp = Date.parse(inputStr);
    if (isNaN(timestamp)) {
        return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    return new Date(timestamp).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function loadSharedFile(parsedData, fileName, fileSize) {
    state.tmxData = parsedData;
    state.metaEditorData = {
        units: parsedData.units,
        metadata: parsedData.metadata
    };
    state.filteredUnits = [...parsedData.units];
    state.currentPage = 1;

    els.fileText.textContent = 'File loaded!';
    els.fileName.textContent = fileName;
    els.fileSize.textContent = fileSize;

    const dropZone = document.getElementById('dropZoneContainer');
    if (dropZone) dropZone.classList.add('hidden');
    els.fileStats.textContent = ` • ${parsedData.units.length} translation units`;

    els.fileInfo.classList.remove('hidden');
    els.errorMessage.classList.add('hidden');
    els.searchAndResultsContainer.classList.remove('hidden');
    els.resultsSection.classList.remove('hidden');
    els.sourceLanguage.textContent = state.tmxData.sourceLanguage || '--';
    els.targetLanguage.textContent = state.tmxData.targetLanguage || '--';
    if (els.downloadUpdatedTmxBtn) {
        els.downloadUpdatedTmxBtn.classList.remove('hidden');
    }

    updateResults(state);
    renderStats(state.tmxData.units);

    els.metaFileText.textContent = 'File loaded!';
    els.metaFileName.textContent = fileName;
    els.metaFileSize.textContent = fileSize;

    const metaDropZone = document.getElementById('metaDropZoneContainer');
    if (metaDropZone) metaDropZone.classList.add('hidden');
    els.metaFileStats.textContent = ` • ${parsedData.units.length} units`;

    els.metaFileInfo.classList.remove('hidden');
    els.metaEditorStatus.classList.add('hidden');
    els.metadataCard.classList.remove('hidden');

    els.metaAuthor.value = state.metaEditorData.metadata.creationid || '';
    els.metaToolDisplay.textContent = state.metaEditorData.metadata.creationtool || 'MemoMemo';
    els.metaToolVersion.value = state.metaEditorData.metadata.creationtoolversion || '';
    els.metaCreationDate.value = state.metaEditorData.metadata.creationdate || '';
    els.metaSrcLang.value = state.metaEditorData.metadata.srclang || '';
    els.metaTgtLang.value = state.metaEditorData.metadata.adminlang || '';
    els.metaDatatype.value = state.metaEditorData.metadata.datatype || '';
    els.metaSegtype.value = state.metaEditorData.metadata.segtype || '';

    idbSet('tmxData', state.tmxData);
    idbSet('metaEditorData', state.metaEditorData);
    lsSet('fileName', fileName);
    lsSet('fileSize', fileSize);
    lsSet('metaFileName', fileName);
    lsSet('metaFileSize', fileSize);
    savePreferences();
}
