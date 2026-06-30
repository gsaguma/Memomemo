import { state } from './state.js';
import { idbSet, idbGet, idbDelete, lsSet, lsGet, lsDel } from './db.js';
import { parseFileContent } from './parsers.js';
import { generateTMXXML } from './exporter.js';
import {
    els,
    showError,
    showSessionBanner,
    renderStats,
    updateResults,
    renderMergeFileList,
    showMergeStatus,
    showMetaEditorStatus,
    updateTabUI,
    formatFileSize
} from './ui.js';

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function switchTab(tab) {
    updateTabUI(tab);
    lsSet('activeTab', tab);
}

function loadSharedFile(parsedData, fileName, fileSize) {
    // Synchronize in-memory state
    state.tmxData = parsedData;
    state.metaEditorData = {
        units: parsedData.units,
        metadata: parsedData.metadata
    };
    state.filteredUnits = [...parsedData.units];
    state.currentPage = 1;
    
    // Update Search UI
    els.fileText.textContent = 'File loaded!';
    els.fileName.textContent = fileName;
    els.fileSize.textContent = fileSize;
    
    const dropZone = document.getElementById('dropZoneContainer');
    if (dropZone) dropZone.classList.add('hidden');
    els.fileStats.textContent = ` • ${parsedData.units.length} units`;
    
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
    
    // Update Metadata UI
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

    // Persist to IndexedDB & localStorage
    idbSet('tmxData', state.tmxData);
    idbSet('metaEditorData', state.metaEditorData);
    lsSet('fileName', fileName);
    lsSet('fileSize', fileSize);
    lsSet('metaFileName', fileName);
    lsSet('metaFileSize', fileSize);
    
    savePreferences();
}

function handleFileSelect() {
    if (els.fileInput.files.length === 0) return;

    const file = els.fileInput.files[0];
    const fileNameLower = file.name.toLowerCase();
    const ext = fileNameLower.split('.').pop();

    // --- Extension validation ---
    const validExts = ['tmx','xliff','xlf','sdlxliff','csv'];
    if (!validExts.includes(ext)) {
        showError(
            `Unsupported file type: .${ext}`,
            '',
            `Supported formats: ${validExts.map(e => '.'+e).join(', ')}`
        );
        els.searchAndResultsContainer.classList.add('hidden');
        els.statsPanel.classList.add('hidden');
        return;
    }

    // --- File size pre-check (warn over 20 MB) ---
    const MB = 1024 * 1024;
    if (file.size > 20 * MB) {
        showError(
            'File too large to process in the browser',
            `File size: ${formatFileSize(file.size)} (limit ~20 MB)`,
            'Consider splitting the file before uploading.'
        );
        els.searchAndResultsContainer.classList.add('hidden');
        els.statsPanel.classList.add('hidden');
        return;
    }

    // Update UI loading state
    els.fileText.textContent = 'File selected!';
    els.fileName.textContent = file.name;
    els.fileSize.textContent = formatFileSize(file.size);
    els.fileInfo.classList.remove('hidden');
    els.errorMessage.classList.add('hidden');
    els.statsPanel.classList.add('hidden');
    els.loadingIndicator.classList.remove('hidden');
    els.searchAndResultsContainer.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const raw = e.target.result;

            // --- XML pre-validation for TMX / XLIFF ---
            if (['tmx','xliff','xlf','sdlxliff'].includes(ext)) {
                const trimmed = raw.trimStart();
                if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<tmx') && !trimmed.startsWith('<xliff')) {
                    throw { title: 'File does not appear to be valid XML', detail: `First characters: ${trimmed.slice(0,80)}`, hint: 'Make sure the file was not corrupted or saved in wrong format.' };
                }
                // Use DOMParser to get exact parse error location
                const tempDoc = new DOMParser().parseFromString(raw, 'text/xml');
                const pe = tempDoc.querySelector('parsererror');
                if (pe) {
                    const errText = pe.textContent.replace(/\s+/g, ' ').trim();
                    throw { title: 'XML parse error', detail: errText, hint: 'Check for unclosed tags, invalid characters, or encoding issues.' };
                }
                // TMX-specific: must have <tmx> root
                if (ext === 'tmx' && !tempDoc.querySelector('tmx')) {
                    throw { title: 'Not a valid TMX file', detail: `Root element is <${tempDoc.documentElement.tagName}>, expected <tmx>`, hint: 'Make sure the file is exported from a CAT tool as TMX 1.4.' };
                }
                // XLIFF-specific: must have <xliff> root
                if (['xliff','xlf','sdlxliff'].includes(ext) && !tempDoc.querySelector('xliff')) {
                    throw { title: 'Not a valid XLIFF file', detail: `Root element is <${tempDoc.documentElement.tagName}>, expected <xliff>`, hint: 'SDLXLIFF and XLF files must have an <xliff> root element.' };
                }
            }

            // --- CSV pre-validation ---
            if (ext === 'csv') {
                const firstLines = raw.split(/\r?\n/).slice(0, 5);
                const hasDelimiter = firstLines.some(l => l.includes(',') || l.includes(';') || l.includes('\t'));
                if (!hasDelimiter) {
                    throw { title: 'CSV format not detected', detail: `First line: ${firstLines[0]?.slice(0,100)}`, hint: 'The file must use comma (,), semicolon (;), or tab (\\t) as delimiter.' };
                }
            }

            const parsedData = parseFileContent(file.name, raw);
            els.loadingIndicator.classList.add('hidden');
            loadSharedFile(parsedData, file.name, formatFileSize(file.size));

        } catch (error) {
            console.error('Error parsing file:', error);
            els.loadingIndicator.classList.add('hidden');
            els.statsPanel.classList.add('hidden');
            if (error && error.title) {
                showError(error.title, error.detail, error.hint);
            } else {
                const extUp = ext.toUpperCase();
                const msg = error?.message || String(error);
                showError(
                    `Could not parse ${extUp} file`,
                    msg,
                    'Verify the file is a valid ' + extUp + ' exported from your CAT tool.'
                );
            }
        }
    };

    reader.onerror = function() {
        els.loadingIndicator.classList.add('hidden');
        showError('Could not read the file', 'The browser failed to read the file from disk.', 'Try again or use a different browser.');
    };

    reader.readAsText(file);
}

function performSearch() {
    const rawTerm = els.searchInput.value.trim();
    const isRegex = els.useRegex.checked;

    // Clear previous regex error
    els.regexError.classList.add('hidden');
    els.regexError.textContent = '';

    if (rawTerm === '') {
        state.filteredUnits = [...state.tmxData.units];
        state.currentPage = 1;
        updateResults(state);
        return;
    }

    let searchRegex;
    if (isRegex) {
        try {
            searchRegex = new RegExp(rawTerm, 'gi');
        } catch (e) {
            els.regexError.textContent = 'Invalid regex: ' + e.message;
            els.regexError.classList.remove('hidden');
            state.filteredUnits = [];
            state.currentPage = 1;
            updateResults(state);
            return;
        }
    } else {
        const escaped = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        searchRegex = new RegExp(escaped, 'gi');
    }

    state.filteredUnits = state.tmxData.units.filter(unit => {
        // Reset lastIndex between uses of the same regex object
        searchRegex.lastIndex = 0;
        const sourceMatch = searchRegex.test(unit.source);
        searchRegex.lastIndex = 0;
        const targetMatch = searchRegex.test(unit.target);

        if (els.sourceOnly.checked && !els.targetOnly.checked) return sourceMatch;
        if (els.targetOnly.checked && !els.sourceOnly.checked) return targetMatch;
        return sourceMatch || targetMatch;
    });

    state.currentPage = 1;
    updateResults(state);
    savePreferences();
}

function updateSearchFilters(e) {
    const sourceOnly = els.sourceOnly;
    const targetOnly = els.targetOnly;
    // Make sure both can't be checked simultaneously
    if (sourceOnly.checked && targetOnly.checked) {
        if (e.target === sourceOnly) {
            targetOnly.checked = false;
        } else {
            sourceOnly.checked = false;
        }
    }
    
    // Re-run search with new filters
    performSearch();
}

function processMergeFiles(filesList) {
    const filesArray = Array.from(filesList);
    
    filesArray.forEach(file => {
        const fileNameLower = file.name.toLowerCase();
        const ext = fileNameLower.split('.').pop();
        const validExts = ['tmx','xliff','xlf','sdlxliff','csv'];
        if (!validExts.includes(ext)) {
            showMergeStatus(`Skipped unsupported file: ${file.name}`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = parseFileContent(file.name, e.target.result);
                
                // Add to mergeFiles list
                const fileData = {
                    id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    units: parsed.units,
                    sourceLanguage: parsed.sourceLanguage,
                    targetLanguage: parsed.targetLanguage,
                    metadata: parsed.metadata
                };
                
                state.mergeFiles.push(fileData);
                
                // If it's the first file, pre-populate Combined languages
                if (state.mergeFiles.length === 1) {
                    els.mergeSrcLang.value = fileData.sourceLanguage;
                    els.mergeTgtLang.value = fileData.targetLanguage;
                }
                
                renderMergeFileList(state, removeMergeFile, moveMergeFile);
                idbSet('mergeFiles', state.mergeFiles);
                showMergeStatus(`Successfully uploaded ${file.name}`, 'info');
            } catch (error) {
                console.error("Error parsing merge file:", error);
                showMergeStatus(`Error parsing ${file.name}: ${error.message}`, 'error');
            }
        };
        reader.readAsText(file);
    });
}

function removeMergeFile(id) {
    state.mergeFiles = state.mergeFiles.filter(f => f.id !== id);
    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    idbSet('mergeFiles', state.mergeFiles);
    showMergeStatus('File removed from list', 'info');
}

function moveMergeFile(id, direction) {
    const idx = state.mergeFiles.findIndex(f => f.id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.mergeFiles.length) return;

    // Swap indexes
    const temp = state.mergeFiles[idx];
    state.mergeFiles[idx] = state.mergeFiles[targetIdx];
    state.mergeFiles[targetIdx] = temp;

    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    idbSet('mergeFiles', state.mergeFiles);
}

function processMetaEditorFile(file) {
    const fileNameLower = file.name.toLowerCase();
    const ext = fileNameLower.split('.').pop();
    const validExts = ['tmx','xliff','xlf','sdlxliff','csv'];
    if (!validExts.includes(ext)) {
        showMetaEditorStatus(`Unsupported file format: ${file.name}`, 'error');
        els.metadataCard.classList.add('hidden');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedData = parseFileContent(file.name, e.target.result);
            loadSharedFile(parsedData, file.name, formatFileSize(file.size));
        } catch (error) {
            console.error("Error parsing meta editor file:", error);
            showMetaEditorStatus(`Error parsing ${file.name}: ${error.message}`, 'error');
            els.metadataCard.classList.add('hidden');
        }
    };
    reader.readAsText(file);
}

function savePreferences() {
    lsSet('searchQuery',          els.searchInput?.value || '');
    lsSet('sourceOnly',           els.sourceOnly?.checked || false);
    lsSet('targetOnly',           els.targetOnly?.checked || false);
    lsSet('useRegex',             els.useRegex?.checked  || false);
    lsSet('currentPage',          state.currentPage);
    lsSet('mergeSrcLang',         els.mergeSrcLang?.value || '');
    lsSet('mergeTgtLang',         els.mergeTgtLang?.value || '');
    lsSet('mergeAuthor',          els.mergeAuthor?.value  || '');
    lsSet('mergeTool',            els.mergeTool?.value    || '');
    lsSet('mergeRemoveDuplicates',els.mergeRemoveDuplicates?.checked ?? true);
}

function updateSearchScopeUI(scope) {
    const btnBoth = document.getElementById('searchScopeBoth');
    const btnSrc = document.getElementById('searchScopeSource');
    const btnTgt = document.getElementById('searchScopeTarget');
    
    const activeClasses = ['bg-primary', 'text-white'];
    const inactiveClasses = ['bg-white', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300', 'hover:bg-gray-50', 'dark:hover:bg-gray-650'];
    
    [btnBoth, btnSrc, btnTgt].forEach(btn => {
        if (!btn) return;
        activeClasses.forEach(c => btn.classList.remove(c));
        inactiveClasses.forEach(c => btn.classList.add(c));
    });
    
    let activeBtn;
    if (scope === 'both') {
        activeBtn = btnBoth;
        els.sourceOnly.checked = false;
        els.targetOnly.checked = false;
    } else if (scope === 'source') {
        activeBtn = btnSrc;
        els.sourceOnly.checked = true;
        els.targetOnly.checked = false;
    } else if (scope === 'target') {
        activeBtn = btnTgt;
        els.sourceOnly.checked = false;
        els.targetOnly.checked = true;
    }
    
    if (activeBtn) {
        inactiveClasses.forEach(c => activeBtn.classList.remove(c));
        activeClasses.forEach(c => activeBtn.classList.add(c));
    }
}

export async function clearSession() {
    if (!confirm("¿Estás seguro de que deseas limpiar la sesión? Se borrarán de forma permanente todos los archivos cargados y modificaciones de traducción no descargadas.")) {
        return;
    }
    await Promise.all([
        idbDelete('tmxData'),
        idbDelete('mergeFiles'),
        idbDelete('metaEditorData')
    ]);
    ['searchQuery','sourceOnly','targetOnly','useRegex','currentPage','activeTab',
     'mergeSrcLang','mergeTgtLang','mergeAuthor','mergeTool','mergeRemoveDuplicates',
     'fileName','fileSize','metaFileName','metaFileSize'].forEach(lsDel);

    // Reset in-memory state
    state.tmxData = { units: [], sourceLanguage: '', targetLanguage: '', metadata: {} };
    state.filteredUnits = [];
    state.mergeFiles = [];
    state.metaEditorData = { units: [], metadata: {} };
    state.currentPage = 1;

    // Reset Search & View UI
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

    // Reset Merge UI
    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    els.mergeSrcLang.value = '';
    els.mergeTgtLang.value = '';
    els.mergeAuthor.value  = '';
    els.mergeTool.value    = 'MemoMemo';

    // Reset Metadata UI
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

    document.getElementById('sessionBanner').classList.add('hidden');
    showSessionBanner('🗑️ Sesión limpiada correctamente.', false);
}

async function restoreSession() {
    // --- Lightweight prefs (localStorage) ---
    const savedTab = lsGet('activeTab', 'search');

    const savedQuery  = lsGet('searchQuery', '');
    const savedSrcO   = lsGet('sourceOnly', false);
    const savedTgtO   = lsGet('targetOnly', false);
    const savedRegex  = lsGet('useRegex', false);

    if (savedQuery)  els.searchInput.value     = savedQuery;
    if (savedRegex)  els.useRegex.checked       = true;
    state.currentPage = lsGet('currentPage', 1);

    if (savedSrcO) {
        updateSearchScopeUI('source');
    } else if (savedTgtO) {
        updateSearchScopeUI('target');
    } else {
        updateSearchScopeUI('both');
    }

    const msl = lsGet('mergeSrcLang');          if (msl !== null) els.mergeSrcLang.value = msl;
    const mtl = lsGet('mergeTgtLang');          if (mtl !== null) els.mergeTgtLang.value = mtl;
    const ma  = lsGet('mergeAuthor');           if (ma  !== null) els.mergeAuthor.value  = ma;
    const mt  = lsGet('mergeTool');             if (mt  !== null) els.mergeTool.value    = mt;
    const mrd = lsGet('mergeRemoveDuplicates'); if (mrd !== null) els.mergeRemoveDuplicates.checked = mrd;

    // --- Heavy data (IndexedDB) ---
    const [savedTmx, savedMerge, savedMeta] = await Promise.all([
        idbGet('tmxData'),
        idbGet('mergeFiles'),
        idbGet('metaEditorData')
    ]);

    let restored = false;

    // Restore Search & View
    if (savedTmx && savedTmx.units && savedTmx.units.length > 0) {
        state.tmxData       = savedTmx;
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
        restored = true;
    }

    // Restore Merge TMs
    if (savedMerge && savedMerge.length > 0) {
        state.mergeFiles = savedMerge;
        renderMergeFileList(state, removeMergeFile, moveMergeFile);
        restored = true;
    }

    // Restore Edit Metadata
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
        els.metaAuthor.value        = state.metaEditorData.metadata.creationid          || '';
        els.metaToolDisplay.textContent = state.metaEditorData.metadata.creationtool   || 'MemoMemo';
        els.metaToolVersion.value   = state.metaEditorData.metadata.creationtoolversion || '';
        els.metaCreationDate.value  = state.metaEditorData.metadata.creationdate        || '';
        els.metaSrcLang.value       = state.metaEditorData.metadata.srclang             || '';
        els.metaTgtLang.value       = state.metaEditorData.metadata.adminlang           || '';
        els.metaDatatype.value      = state.metaEditorData.metadata.datatype            || '';
        els.metaSegtype.value       = state.metaEditorData.metadata.segtype             || '';
        els.metadataCard.classList.remove('hidden');
        restored = true;
    }

    // Switch to the last active tab
    switchTab(savedTab);

    if (restored) {
        showSessionBanner(
            `<span>✓ Sesión anterior restaurada automáticamente.</span>` +
            `<button onclick="clearSession()" ` +
            `class="ml-4 px-3 py-1 rounded border border-current font-semibold text-xs hover:opacity-75 transition whitespace-nowrap">` +
            `Limpiar sesión</button>`,
            true
        );
    }

    // Auto-save merge config on input
    [els.mergeSrcLang, els.mergeTgtLang, els.mergeAuthor, els.mergeTool].forEach(el =>
        el.addEventListener('input', savePreferences)
    );
    els.mergeRemoveDuplicates.addEventListener('change', savePreferences);
}

function handleGlobalKeydown(e) {
    // Focus search shortcut (Alt + S)
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

    // Check if user is typing in form inputs / edit textarea
    const isTyping = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.isContentEditable
    );

    // Row navigation & actions when a row is focused
    const focusedRow = document.activeElement && 
                       document.activeElement.tagName === 'TR' && 
                       els.resultsTable && 
                       els.resultsTable.contains(document.activeElement);

    if (focusedRow) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = document.activeElement.nextElementSibling;
            if (next && next.tagName === 'TR') {
                next.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = document.activeElement.previousElementSibling;
            if (prev && prev.tagName === 'TR') {
                prev.focus();
            }
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

    // Pagination shortcuts when NOT typing
    if (!isTyping && state.tmxData && state.tmxData.units.length > 0) {
        const pageCount = Math.ceil(state.filteredUnits.length / state.itemsPerPage);
        if (e.key === 'PageDown') {
            e.preventDefault();
            if (state.currentPage < pageCount) {
                state.currentPage++;
                updateResults(state);
            }
        } else if (e.key === 'PageUp') {
            e.preventDefault();
            if (state.currentPage > 1) {
                state.currentPage--;
                updateResults(state);
            }
        }
    }
}

function init() {
    window.addEventListener('keydown', handleGlobalKeydown);

    // Search page event listeners
    els.fileInput.addEventListener('change', handleFileSelect);

    const btnBoth = document.getElementById('searchScopeBoth');
    const btnSrc = document.getElementById('searchScopeSource');
    const btnTgt = document.getElementById('searchScopeTarget');
    
    if (btnBoth && btnSrc && btnTgt) {
        btnBoth.addEventListener('click', () => { updateSearchScopeUI('both'); performSearch(); });
        btnSrc.addEventListener('click', () => { updateSearchScopeUI('source'); performSearch(); });
        btnTgt.addEventListener('click', () => { updateSearchScopeUI('target'); performSearch(); });
    }

    if (els.downloadUpdatedTmxBtn) {
        els.downloadUpdatedTmxBtn.addEventListener('click', () => {
            if (!state.tmxData.units.length) return;

            // Generate TMX content
            const tmxXml = generateTMXXML(state.tmxData.units, state.tmxData.metadata);

            // Trigger file download
            const blob = new Blob([tmxXml], { type: 'text/xml;charset=utf-8;' });
            const link = document.createElement('a');
            
            // Get original filename or default
            const originalName = lsGet('fileName') || 'updated_translation_memory.tmx';
            const downloadName = originalName.toLowerCase().endsWith('.tmx') ? originalName : (originalName.split('.')[0] + '.tmx');
            
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    els.searchInput.addEventListener('input', debounce(performSearch, 300));
    els.sourceOnly.addEventListener('change', updateSearchFilters);
    els.targetOnly.addEventListener('change', updateSearchFilters);
    els.useRegex.addEventListener('change', () => {
        els.regexError.classList.add('hidden');
        els.regexError.textContent = '';
        performSearch();
    });

    els.statsToggle.addEventListener('click', () => {
        const open = !els.statsBody.classList.contains('hidden');
        els.statsBody.classList.toggle('hidden', open);
        els.statsChevron.style.transform = open ? '' : 'rotate(180deg)';
    });

    // Setup drag and drop for Search Input
    const dropZone = els.fileInput.closest('label');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('bg-gray-200', 'dark:bg-gray-700');
        });
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
        });
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
            
            if (e.dataTransfer.files.length) {
                els.fileInput.files = e.dataTransfer.files;
                handleFileSelect();
            }
        });
    }

    // Tab Switching Logic
    els.tabSearchBtn.addEventListener('click', () => switchTab('search'));
    els.tabMergeBtn.addEventListener('click', () => switchTab('merge'));
    els.tabMetaBtn.addEventListener('click', () => switchTab('meta'));

    // Merger event listeners
    const mergeDropZone = els.mergeDropZone;
    if (mergeDropZone) {
        mergeDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            mergeDropZone.classList.add('bg-gray-200', 'dark:bg-gray-700');
        });
        mergeDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            mergeDropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
        });
        mergeDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            mergeDropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
            
            if (e.dataTransfer.files.length) {
                processMergeFiles(e.dataTransfer.files);
            }
        });
    }

    els.mergeFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            processMergeFiles(e.target.files);
        }
    });

    els.executeMergeBtn.addEventListener('click', () => {
        if (state.mergeFiles.length === 0) return;

        showMergeStatus('Merging translation memories...', 'info');
        els.executeMergeBtn.disabled = true;

        setTimeout(() => {
            try {
                const removeDuplicates = els.mergeRemoveDuplicates.checked;
                const combinedSrc = els.mergeSrcLang.value.trim() || 'en';
                const combinedTgt = els.mergeTgtLang.value.trim() || 'es';
                const author = els.mergeAuthor.value.trim() || 'MemoMemo Merger';
                const tool = els.mergeTool.value.trim() || 'MemoMemo';
                
                let mergedUnits = [];
                
                // Combine all units
                state.mergeFiles.forEach(file => {
                    file.units.forEach(unit => {
                        mergedUnits.push({
                            source: unit.source,
                            target: unit.target,
                            sourceLang: combinedSrc,
                            targetLang: combinedTgt
                        });
                    });
                });

                const totalCountBefore = mergedUnits.length;

                // Deduplicate if checked
                if (removeDuplicates) {
                    const seen = new Set();
                    mergedUnits = mergedUnits.filter(unit => {
                        const key = `${unit.source.trim()}|||${unit.target.trim()}`;
                        if (seen.has(key)) {
                            return false;
                        }
                        seen.add(key);
                        return true;
                    });
                }

                const totalCountAfter = mergedUnits.length;
                const duplicatesRemoved = totalCountBefore - totalCountAfter;

                // Build metadata
                const mergeMetadata = {
                    creationtool: tool,
                    creationtoolversion: '1.0',
                    datatype: 'plaintext',
                    segtype: 'sentence',
                    adminlang: combinedTgt,
                    srclang: combinedSrc,
                    creationid: author,
                    creationdate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                };

                // Generate XML
                const mergedTmxXml = generateTMXXML(mergedUnits, mergeMetadata);

                // Download
                const blob = new Blob([mergedTmxXml], { type: 'text/xml;charset=utf-8;' });
                const link = document.createElement('a');
                const downloadName = 'merged_translation_memory.tmx';
                
                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', downloadName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showMergeStatus(`Successfully merged ${state.mergeFiles.length} files into ${downloadName}! Total units: ${totalCountAfter}${removeDuplicates ? ` (${duplicatesRemoved} duplicates removed)` : ''}. Download has started automatically.`, 'success');
            } catch (error) {
                console.error("Error executing merge:", error);
                showMergeStatus(`Failed to merge: ${error.message}`, 'error');
            } finally {
                els.executeMergeBtn.disabled = false;
            }
        }, 100);
    });

    // Metadata Editor event listeners
    const metaDropZone = els.metaDropZone;
    if (metaDropZone) {
        metaDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            metaDropZone.classList.add('bg-gray-200', 'dark:bg-gray-700');
        });
        metaDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            metaDropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
        });
        metaDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            metaDropZone.classList.remove('bg-gray-200', 'dark:bg-gray-700');
            
            if (e.dataTransfer.files.length) {
                processMetaEditorFile(e.dataTransfer.files[0]);
            }
        });
    }

    els.metaFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            processMetaEditorFile(e.target.files[0]);
        }
    });

function formatTmxDate(inputStr) {
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

    els.exportMetadataBtn.addEventListener('click', () => {
        if (!state.metaEditorData.units.length) return;

        const formattedDate = formatTmxDate(els.metaCreationDate.value.trim());
        els.metaCreationDate.value = formattedDate;

        // Gather values (Creation Tool remains unchanged/read-only)
        state.metaEditorData.metadata.creationid = els.metaAuthor.value.trim();
        state.metaEditorData.metadata.creationtoolversion = els.metaToolVersion.value.trim();
        state.metaEditorData.metadata.creationdate = formattedDate;
        state.metaEditorData.metadata.srclang = els.metaSrcLang.value.trim();
        state.metaEditorData.metadata.adminlang = els.metaTgtLang.value.trim();
        state.metaEditorData.metadata.datatype = els.metaDatatype.value.trim();
        state.metaEditorData.metadata.segtype = els.metaSegtype.value.trim();

        // Generate TMX content
        const tmxXml = generateTMXXML(state.metaEditorData.units, state.metaEditorData.metadata);

        // Trigger file download
        const blob = new Blob([tmxXml], { type: 'text/xml;charset=utf-8;' });
        const link = document.createElement('a');
        const originalName = els.metaFileInput.files[0]?.name || 'translation_memory.tmx';
        const downloadName = originalName.toLowerCase().endsWith('.tmx') ? originalName : (originalName.split('.')[0] + '.tmx');
        
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    const changeFileBtn = document.getElementById('changeFileBtn');
    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', () => {
            els.fileInput.click();
        });
    }
    const changeMetaFileBtn = document.getElementById('changeMetaFileBtn');
    if (changeMetaFileBtn) {
        changeMetaFileBtn.addEventListener('click', () => {
            els.metaFileInput.click();
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
