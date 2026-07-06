import { state } from './state.js';
import { lsGet } from './db.js';
import { parseFileContent } from './parsers.js';
import { generateTMXXML } from './exporter.js';
import { els, showError, formatFileSize, updateResults } from './ui.js';
import { loadSharedFile, savePreferences, debounce } from './shared.js';
import { refreshQaFileInfo } from './qaController.js';

function handleFileSelect() {
    if (els.fileInput.files.length === 0) return;

    const file = els.fileInput.files[0];
    const fileNameLower = file.name.toLowerCase();
    const ext = fileNameLower.split('.').pop();

    const validExts = ['tmx', 'xliff', 'xlf', 'sdlxliff', 'csv'];
    if (!validExts.includes(ext)) {
        showError(
            `Unsupported file type: .${ext}`,
            '',
            `Supported formats: ${validExts.map(e => '.' + e).join(', ')}`
        );
        els.searchAndResultsContainer.classList.add('hidden');
        els.statsPanel.classList.add('hidden');
        return;
    }

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

    els.fileText.textContent = 'File selected!';
    els.fileName.textContent = file.name;
    els.fileSize.textContent = formatFileSize(file.size);
    els.fileInfo.classList.remove('hidden');
    refreshQaFileInfo();
    els.errorMessage.classList.add('hidden');
    els.statsPanel.classList.add('hidden');
    els.loadingIndicator.classList.remove('hidden');
    els.searchAndResultsContainer.classList.add('hidden');

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const raw = e.target.result;

            if (['tmx', 'xliff', 'xlf', 'sdlxliff'].includes(ext)) {
                const trimmed = raw.trimStart();
                if (!trimmed.startsWith('<?xml') && !trimmed.startsWith('<tmx') && !trimmed.startsWith('<xliff')) {
                    throw { title: 'File does not appear to be valid XML', detail: `First characters: ${trimmed.slice(0, 80)}`, hint: 'Make sure the file was not corrupted or saved in wrong format.' };
                }
                const tempDoc = new DOMParser().parseFromString(raw, 'text/xml');
                const pe = tempDoc.querySelector('parsererror');
                if (pe) {
                    const errText = pe.textContent.replace(/\s+/g, ' ').trim();
                    throw { title: 'XML parse error', detail: errText, hint: 'Check for unclosed tags, invalid characters, or encoding issues.' };
                }
                if (ext === 'tmx' && tempDoc.documentElement.localName !== 'tmx') {
                    throw { title: 'Not a valid TMX file', detail: `Root element is <${tempDoc.documentElement.tagName}>, expected <tmx>`, hint: 'Make sure the file is exported from a CAT tool as TMX 1.4.' };
                }
                if (['xliff', 'xlf', 'sdlxliff'].includes(ext) && tempDoc.documentElement.localName !== 'xliff') {
                    throw { title: 'Not a valid XLIFF file', detail: `Root element is <${tempDoc.documentElement.tagName}>, expected <xliff>`, hint: 'SDLXLIFF and XLF files must have an <xliff> root element.' };
                }
            }

            if (ext === 'csv') {
                const firstLines = raw.split(/\r?\n/).slice(0, 5);
                const hasDelimiter = firstLines.some(l => l.includes(',') || l.includes(';') || l.includes('\t'));
                if (!hasDelimiter) {
                    throw { title: 'CSV format not detected', detail: `First line: ${firstLines[0]?.slice(0, 100)}`, hint: 'The file must use comma (,), semicolon (;), or tab (\\t) as delimiter.' };
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

    reader.onerror = function () {
        els.loadingIndicator.classList.add('hidden');
        showError('Could not read the file', 'The browser failed to read the file from disk.', 'Try again or use a different browser.');
    };

    reader.readAsText(file);
}

function performSearch() {
    const rawTerm = els.searchInput.value.trim();
    const isRegex = els.useRegex.checked;

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
    if (sourceOnly.checked && targetOnly.checked) {
        if (e.target === sourceOnly) {
            targetOnly.checked = false;
        } else {
            sourceOnly.checked = false;
        }
    }
    performSearch();
}

export function updateSearchScopeUI(scope) {
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

export function initSearchController() {
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
            const tmxXml = generateTMXXML(state.tmxData.units, state.tmxData.metadata);
            const blob = new Blob([tmxXml], { type: 'text/xml;charset=utf-8;' });
            const link = document.createElement('a');
            const originalName = lsGet('fileName') || 'updated_translation_memory.tmx';
            const downloadName = originalName.toLowerCase().endsWith('.tmx') ? originalName : (originalName.split('.')[0] + '.tmx');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', downloadName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
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

    const changeFileBtn = document.getElementById('changeFileBtn');
    if (changeFileBtn) {
        changeFileBtn.addEventListener('click', () => {
            els.fileInput.click();
        });
    }
}
