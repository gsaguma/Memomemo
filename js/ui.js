import { idbSet } from './db.js';

export const els = {
    fileInput: document.getElementById('fileInput'),
    fileText: document.getElementById('fileText'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    fileStats: document.getElementById('fileStats'),
    searchAndResultsContainer: document.getElementById('searchAndResultsContainer'),
    searchSection: document.getElementById('searchSection'),
    searchInput: document.getElementById('searchInput'),
    sourceOnly: document.getElementById('sourceOnly'),
    targetOnly: document.getElementById('targetOnly'),
    useRegex: document.getElementById('useRegex'),
    regexError: document.getElementById('regexError'),
    resultsCount: document.getElementById('resultsCount'),
    downloadUpdatedTmxBtn: document.getElementById('downloadUpdatedTmxBtn'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    errorTitle: document.getElementById('errorTitle'),
    errorDetail: document.getElementById('errorDetail'),
    errorHint: document.getElementById('errorHint'),
    statsPanel: document.getElementById('statsPanel'),
    statsToggle: document.getElementById('statsToggle'),
    statsBody: document.getElementById('statsBody'),
    statsChevron: document.getElementById('statsChevron'),
    resultsSection: document.getElementById('resultsSection'),
    sourceLanguage: document.getElementById('sourceLanguage'),
    targetLanguage: document.getElementById('targetLanguage'),
    resultsTable: document.getElementById('resultsTable'),
    pagination: document.getElementById('pagination'),
    
    // Tab switching
    tabSearchBtn: document.getElementById('tabSearchBtn'),
    tabMergeBtn: document.getElementById('tabMergeBtn'),
    tabMetaBtn: document.getElementById('tabMetaBtn'),
    tabSearchContent: document.getElementById('tabSearchContent'),
    tabMergeContent: document.getElementById('tabMergeContent'),
    tabMetaContent: document.getElementById('tabMetaContent'),
    
    // Merger
    mergeFileInput: document.getElementById('mergeFileInput'),
    mergeFileList: document.getElementById('mergeFileList'),
    mergeFileCountBadge: document.getElementById('mergeFileCountBadge'),
    mergeSrcLang: document.getElementById('mergeSrcLang'),
    mergeTgtLang: document.getElementById('mergeTgtLang'),
    mergeAuthor: document.getElementById('mergeAuthor'),
    mergeTool: document.getElementById('mergeTool'),
    mergeRemoveDuplicates: document.getElementById('mergeRemoveDuplicates'),
    executeMergeBtn: document.getElementById('executeMergeBtn'),
    mergeStatusContainer: document.getElementById('mergeStatusContainer'),
    mergeDropZone: document.querySelector('label[for="mergeFileInput"]'),
    
    // Metadata Editor
    metaFileInput: document.getElementById('metaFileInput'),
    metaFileText: document.getElementById('metaFileText'),
    metaFileInfo: document.getElementById('metaFileInfo'),
    metaFileName: document.getElementById('metaFileName'),
    metaFileSize: document.getElementById('metaFileSize'),
    metaFileStats: document.getElementById('metaFileStats'),
    metadataCard: document.getElementById('metadataCard'),
    metaEditorStatus: document.getElementById('metaEditorStatus'),
    metaDropZone: document.querySelector('label[for="metaFileInput"]'),
    exportMetadataBtn: document.getElementById('exportMetadataBtn'),
    metaAuthor: document.getElementById('metaAuthor'),
    metaToolDisplay: document.getElementById('metaToolDisplay'),
    metaToolVersion: document.getElementById('metaToolVersion'),
    metaCreationDate: document.getElementById('metaCreationDate'),
    metaSrcLang: document.getElementById('metaSrcLang'),
    metaTgtLang: document.getElementById('metaTgtLang'),
    metaDatatype: document.getElementById('metaDatatype'),
    metaSegtype: document.getElementById('metaSegtype')
};

export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function showError(title, detail, hint) {
    els.errorTitle.textContent = title;
    els.errorDetail.textContent = detail || '';
    els.errorHint.textContent = hint || '';
    els.errorMessage.classList.remove('hidden');
}

export function showSessionBanner(html, isSuccess = false) {
    const banner = document.getElementById('sessionBanner');
    if (!banner) return;
    banner.innerHTML = html;
    const base = 'flex items-center justify-between gap-3 rounded-lg px-4 py-2.5 text-sm mb-4 ';
    banner.className = base + (isSuccess
        ? 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
        : 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700');
    banner.classList.remove('hidden');
    if (isSuccess) setTimeout(() => banner.classList.add('hidden'), 7000);
}

export function renderStats(units) {
    if (!units || units.length === 0) return;

    const total = units.length;

    // Unique by source+target
    const seen = new Set();
    let dupes = 0;
    units.forEach(u => {
        const key = u.source.trim() + '|||' + u.target.trim();
        if (seen.has(key)) dupes++;
        else seen.add(key);
    });
    const unique = total - dupes;

    // Word counts
    const countWords = str => str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
    let srcWords = 0, tgtWords = 0, emptySrc = 0, emptyTgt = 0;
    const srcWordCounts = [];
    units.forEach(u => {
        const sw = countWords(u.source);
        const tw = countWords(u.target);
        srcWords += sw;
        tgtWords += tw;
        srcWordCounts.push(sw);
        if (!u.source.trim()) emptySrc++;
        if (!u.target.trim()) emptyTgt++;
    });

    const avgSrcWords = (srcWords / total).toFixed(1);
    const avgTgtWords = (tgtWords / total).toFixed(1);
    const avgSrcChars = Math.round(units.reduce((s, u) => s + u.source.length, 0) / total);
    const avgTgtChars = Math.round(units.reduce((s, u) => s + u.target.length, 0) / total);

    // Fill metric cards
    document.getElementById('statTotal').textContent = total.toLocaleString();
    document.getElementById('statUnique').textContent = unique.toLocaleString();
    document.getElementById('statDupes').textContent = dupes > 0 ? `${dupes.toLocaleString()} duplicate${dupes > 1 ? 's' : ''}` : 'no duplicates';
    document.getElementById('statSrcWords').textContent = srcWords.toLocaleString();
    document.getElementById('statSrcAvgWords').textContent = `avg ${avgSrcWords} per segment`;
    document.getElementById('statTgtWords').textContent = tgtWords.toLocaleString();
    document.getElementById('statTgtAvgWords').textContent = `avg ${avgTgtWords} per segment`;
    document.getElementById('statEmptySrc').textContent = emptySrc.toLocaleString();
    document.getElementById('statEmptyTgt').textContent = emptyTgt.toLocaleString();
    document.getElementById('statAvgChars').textContent = `${avgSrcChars} / ${avgTgtChars}`;

    // Histogram: bucket source word counts
    const buckets = [
        { label: '1–5',   min: 1,   max: 5   },
        { label: '6–15',  min: 6,   max: 15  },
        { label: '16–30', min: 16,  max: 30  },
        { label: '31–50', min: 31,  max: 50  },
        { label: '51–100',min: 51,  max: 100 },
        { label: '100+',  min: 101, max: Infinity }
    ];
    const counts = buckets.map(b => srcWordCounts.filter(w => w >= b.min && w <= b.max).length);
    const maxCount = Math.max(...counts, 1);

    const histEl = document.getElementById('statHistogram');
    const labelsEl = document.getElementById('statHistogramLabels');
    histEl.innerHTML = '';
    labelsEl.innerHTML = '';

    counts.forEach((count, i) => {
        const pct = Math.max(4, Math.round((count / maxCount) * 100));
        const bar = document.createElement('div');
        bar.className = 'flex-1 bg-primary rounded-t opacity-80 hover:opacity-100 transition cursor-default';
        bar.style.height = pct + '%';
        bar.title = `${buckets[i].label} words: ${count.toLocaleString()} segments`;
        histEl.appendChild(bar);

        const lbl = document.createElement('div');
        lbl.className = 'flex-1 text-center overflow-hidden';
        lbl.style.fontSize = '10px';
        lbl.textContent = buckets[i].label;
        labelsEl.appendChild(lbl);
    });

    els.statsPanel.classList.remove('hidden');
    // Keep stats panel closed by default
    els.statsBody.classList.add('hidden');
    els.statsChevron.style.transform = '';
}

export function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function highlightText(text, regex, shouldHighlight) {
    if (!shouldHighlight) return escapeHtml(text);
    
    regex.lastIndex = 0;
    let result = '';
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Avoid infinite loops on zero-length matches
        if (match.index === regex.lastIndex) { regex.lastIndex++; continue; }
        result += escapeHtml(text.slice(lastIndex, match.index));
        result += '<mark class="bg-yellow-200 dark:bg-yellow-700 rounded px-0.5">' + escapeHtml(match[0]) + '</mark>';
        lastIndex = regex.lastIndex;
    }
    result += escapeHtml(text.slice(lastIndex));
    return result;
}

export function copyTextToClipboard(e) {
    const text = e.currentTarget.getAttribute('data-text');
    const button = e.currentTarget;
    const originalHTML = button.innerHTML;
    const originalTitle = button.getAttribute('title') || 'Copy text';
    
    // Copy to clipboard
    navigator.clipboard.writeText(text)
        .then(() => {
            // Replace with green checkmark SVG
            button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
            button.setAttribute('title', 'Copied!');
            
            // Change back after a delay
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.setAttribute('title', originalTitle);
            }, 1500);
        })
        .catch(err => {
            console.error('Error copying text: ', err);
            button.style.color = '#ef4444';
            button.setAttribute('title', 'Copy failed');
            
            setTimeout(() => {
                button.style.color = '';
                button.setAttribute('title', originalTitle);
            }, 1500);
        });
    
    // Stop event propagation
    e.stopPropagation();
}

export function updateResults(state) {
    // Update count
    els.resultsCount.textContent = `${state.filteredUnits.length} results`;
    
    // Calculate pagination
    const pageCount = Math.ceil(state.filteredUnits.length / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = Math.min(startIndex + state.itemsPerPage, state.filteredUnits.length);
    const currentUnits = state.filteredUnits.slice(startIndex, endIndex);
    
    // Clear previous results
    els.resultsTable.innerHTML = '';
    
    // Build search regex for highlighting
    const rawTerm = els.searchInput.value.trim();
    let highlightRegex = null;
    if (rawTerm) {
        try {
            if (els.useRegex.checked) {
                highlightRegex = new RegExp(rawTerm, 'gi');
            } else {
                const escaped = rawTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                highlightRegex = new RegExp(escaped, 'gi');
            }
        } catch (e) {
            highlightRegex = null;
        }
    }
    
    currentUnits.forEach((unit, index) => {
        const row = document.createElement('tr');
        row.setAttribute('tabindex', '0');
        row.setAttribute('aria-label', 'Segment ' + (startIndex + index + 1));
        row.className = 'group hover:bg-gray-50 dark:hover:bg-gray-750 focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition cursor-pointer';
        
        // Create source cell with copy button
        const sourceCell = document.createElement('td');
        sourceCell.className = 'px-3 py-2 whitespace-pre-wrap relative text-sm';
        
        // Create wrapper div to position the text and button
        const sourceCellContent = document.createElement('div');
        sourceCellContent.className = 'flex items-start';
        
        // Text content div
        const sourceTextDiv = document.createElement('div');
        sourceTextDiv.className = 'flex-grow pr-8';
        sourceTextDiv.innerHTML = highlightRegex ? 
            highlightText(unit.source, highlightRegex, els.sourceOnly.checked || (!els.sourceOnly.checked && !els.targetOnly.checked)) : 
            escapeHtml(unit.source);
        
        // Copy button for source
        const sourceCopyBtn = document.createElement('button');
        sourceCopyBtn.className = 'ml-2 p-1 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-75 group-focus-within:opacity-75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary rounded absolute right-4 top-3 transition-opacity';
        sourceCopyBtn.title = 'Copy source text';
        sourceCopyBtn.setAttribute('aria-label', 'Copy source text for segment ' + (startIndex + index + 1));
        sourceCopyBtn.setAttribute('data-text', unit.source);
        sourceCopyBtn.addEventListener('click', copyTextToClipboard);
        
        // Add text and button to cell
        sourceCellContent.appendChild(sourceTextDiv);
        sourceCell.appendChild(sourceCellContent);
        sourceCell.appendChild(sourceCopyBtn);
        
        // Create target cell with copy button & edit button
        const targetCell = document.createElement('td');
        targetCell.className = 'px-3 py-2 whitespace-pre-wrap relative text-sm';
        
        // Create wrapper div for target
        const targetCellContent = document.createElement('div');
        targetCellContent.className = 'flex items-start';
        
        // Text content div
        const targetTextDiv = document.createElement('div');
        targetTextDiv.className = 'flex-grow pr-16 cursor-pointer';
        targetTextDiv.innerHTML = highlightRegex ? 
            highlightText(unit.target, highlightRegex, els.targetOnly.checked || (!els.sourceOnly.checked && !els.targetOnly.checked)) : 
            escapeHtml(unit.target);
        targetTextDiv.title = 'Double-click to edit segment';
        
        // Edit button for target
        const targetEditBtn = document.createElement('button');
        targetEditBtn.className = 'ml-2 p-1 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-75 group-focus-within:opacity-75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary rounded absolute right-10 top-3 transition-opacity';
        targetEditBtn.title = 'Edit target text';
        targetEditBtn.setAttribute('aria-label', 'Edit target text for segment ' + (startIndex + index + 1));
        
        // Copy button for target
        const targetCopyBtn = document.createElement('button');
        targetCopyBtn.className = 'ml-2 p-1 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-75 group-focus-within:opacity-75 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary rounded absolute right-4 top-3 transition-opacity';
        targetCopyBtn.title = 'Copy target text';
        targetCopyBtn.setAttribute('aria-label', 'Copy target text for segment ' + (startIndex + index + 1));
        targetCopyBtn.setAttribute('data-text', unit.target);
        targetCopyBtn.addEventListener('click', copyTextToClipboard);

        // Edit handlers
        const startEditing = () => {
            if (targetCell.classList.contains('is-editing')) return;
            targetCell.classList.add('is-editing');
            
            // Hide normal view
            targetCellContent.style.display = 'none';
            targetCopyBtn.style.display = 'none';
            targetEditBtn.style.display = 'none';
            
            // Create edit UI container
            const editWrapper = document.createElement('div');
            editWrapper.className = 'w-full flex flex-col gap-2 py-1';
            
            const textarea = document.createElement('textarea');
            textarea.className = 'w-full px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-400 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800';
            textarea.value = unit.target;
            textarea.rows = Math.max(2, unit.target.split('\n').length);
            
            const btnContainer = document.createElement('div');
            btnContainer.className = 'flex gap-2 justify-end';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition';
            cancelBtn.textContent = 'Cancel';
            
            const saveBtn = document.createElement('button');
            saveBtn.className = 'px-2 py-0.5 text-xs bg-primary hover:bg-opacity-90 text-white rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-gray-800 transition';
            saveBtn.textContent = 'Save';
            
            btnContainer.appendChild(cancelBtn);
            btnContainer.appendChild(saveBtn);
            editWrapper.appendChild(textarea);
            editWrapper.appendChild(btnContainer);
            targetCell.appendChild(editWrapper);
            
            textarea.focus();
            textarea.select();
            
            const saveChanges = () => {
                const newValue = textarea.value;
                unit.target = newValue;
                
                // Persist changes to IndexedDB
                idbSet('tmxData', state.tmxData);
                
                // Re-render
                updateResults(state);
            };
            
            const cancelEditing = () => {
                editWrapper.remove();
                targetCell.classList.remove('is-editing');
                targetCellContent.style.display = '';
                targetCopyBtn.style.display = '';
                targetEditBtn.style.display = '';
            };
            
            saveBtn.addEventListener('click', saveChanges);
            cancelBtn.addEventListener('click', cancelEditing);
            
            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    saveChanges();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelEditing();
                }
            });
        };
        
        // Expose edit trigger directly on the row DOM node for keyboard controller use
        row.startEditing = startEditing;
        
        targetTextDiv.addEventListener('dblclick', startEditing);
        targetEditBtn.addEventListener('click', startEditing);
        
        // Add text and button to cell
        targetCellContent.appendChild(targetTextDiv);
        targetCell.appendChild(targetCellContent);
        targetCell.appendChild(targetEditBtn);
        targetCell.appendChild(targetCopyBtn);
        
        // Add cells to row
        row.appendChild(sourceCell);
        row.appendChild(targetCell);
        
        // Add row to table
        els.resultsTable.appendChild(row);
    });
    
    // Update pagination
    updatePagination(pageCount, state);
    
    // Show/hide no results message
    if (state.filteredUnits.length === 0) {
        const noResults = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 2;
        cell.className = 'px-4 py-6 text-center text-gray-500 dark:text-gray-400';
        cell.textContent = 'No matching translation units found';
        noResults.appendChild(cell);
        els.resultsTable.appendChild(noResults);
    }
}

export function updatePagination(pageCount, state) {
    els.pagination.innerHTML = '';
    
    if (pageCount <= 1) return;
    
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '&laquo;';
    prevButton.className = `px-3 py-1 rounded ${state.currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:bg-gray-200 dark:hover:bg-gray-700'}`;
    prevButton.disabled = state.currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateResults(state);
        }
    });
    els.pagination.appendChild(prevButton);
    
    // Page buttons
    const maxPages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(pageCount, startPage + maxPages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPages) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = `px-3 py-1 rounded ${i === state.currentPage ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`;
        pageButton.addEventListener('click', () => {
            state.currentPage = i;
            updateResults(state);
        });
        els.pagination.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '&raquo;';
    nextButton.className = `px-3 py-1 rounded ${state.currentPage === pageCount ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:bg-gray-200 dark:hover:bg-gray-700'}`;
    nextButton.disabled = state.currentPage === pageCount;
    nextButton.addEventListener('click', () => {
        if (state.currentPage < pageCount) {
            state.currentPage++;
            updateResults(state);
        }
    });
    els.pagination.appendChild(nextButton);
}

export function renderMergeFileList(state, removeMergeCallback, moveMergeCallback) {
    els.mergeFileList.innerHTML = '';
    els.mergeFileCountBadge.textContent = state.mergeFiles.length;

    if (state.mergeFiles.length === 0) {
        els.mergeFileList.innerHTML = '<div class="text-sm text-gray-500 text-center py-6">No files uploaded yet.</div>';
        els.executeMergeBtn.disabled = true;
        return;
    }

    // Enable merge button if we have at least one file (for conversion / metadata updates too)
    els.executeMergeBtn.disabled = false;

    state.mergeFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'flex justify-between items-center bg-white dark:bg-gray-700 p-2.5 rounded border border-gray-200 dark:border-gray-600 shadow-sm text-sm';
        
        const fileInfoDiv = document.createElement('div');
        fileInfoDiv.className = 'flex-grow truncate pr-2';
        
        const nameSpan = document.createElement('div');
        nameSpan.className = 'font-medium truncate text-gray-900 dark:text-white';
        nameSpan.textContent = file.name;
        
        const detailsSpan = document.createElement('div');
        detailsSpan.className = 'text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex gap-2';
        detailsSpan.innerHTML = `<span>${file.units.length} units</span> &bull; <span>${formatFileSize(file.size)}</span> &bull; <span>${file.sourceLanguage} &rarr; ${file.targetLanguage}</span>`;
        
        fileInfoDiv.appendChild(nameSpan);
        fileInfoDiv.appendChild(detailsSpan);
        
        const btnContainer = document.createElement('div');
        btnContainer.className = 'flex items-center gap-1';
        
        // Up button
        const upBtn = document.createElement('button');
        upBtn.className = 'text-gray-500 dark:text-gray-400 hover:text-primary focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition';
        upBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>';
        upBtn.title = 'Move up';
        upBtn.setAttribute('aria-label', `Move ${file.name} up`);
        if (index === 0) {
            upBtn.disabled = true;
            upBtn.classList.add('opacity-30', 'cursor-not-allowed');
        } else {
            upBtn.addEventListener('click', () => {
                if (moveMergeCallback) moveMergeCallback(file.id, -1);
            });
        }
        
        // Down button
        const downBtn = document.createElement('button');
        downBtn.className = 'text-gray-500 dark:text-gray-400 hover:text-primary focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition';
        downBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>';
        downBtn.title = 'Move down';
        downBtn.setAttribute('aria-label', `Move ${file.name} down`);
        if (index === state.mergeFiles.length - 1) {
            downBtn.disabled = true;
            downBtn.classList.add('opacity-30', 'cursor-not-allowed');
        } else {
            downBtn.addEventListener('click', () => {
                if (moveMergeCallback) moveMergeCallback(file.id, 1);
            });
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-gray-600 p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 dark:focus:ring-offset-gray-700 transition';
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
        deleteBtn.title = 'Remove file';
        deleteBtn.setAttribute('aria-label', `Remove ${file.name}`);
        deleteBtn.addEventListener('click', () => {
            removeMergeCallback(file.id);
        });

        btnContainer.appendChild(upBtn);
        btnContainer.appendChild(downBtn);
        btnContainer.appendChild(deleteBtn);

        item.appendChild(fileInfoDiv);
        item.appendChild(btnContainer);
        els.mergeFileList.appendChild(item);
    });
}

export function showMergeStatus(message, type) {
    els.mergeStatusContainer.classList.remove('hidden', 'bg-blue-50', 'dark:bg-blue-900', 'border-blue-500', 'text-blue-700', 'dark:text-blue-200', 'bg-green-50', 'dark:bg-green-900', 'border-green-500', 'text-green-700', 'dark:text-green-200', 'bg-red-50', 'dark:bg-red-900', 'border-red-500', 'text-red-700', 'dark:text-red-200');
    
    if (type === 'error') {
        els.mergeStatusContainer.classList.add('bg-red-50', 'dark:bg-red-900', 'border-l-4', 'border-red-500', 'text-red-700', 'dark:text-red-200');
    } else if (type === 'success') {
        els.mergeStatusContainer.classList.add('bg-green-50', 'dark:bg-green-900', 'border-l-4', 'border-green-500', 'text-green-700', 'dark:text-green-200');
    } else {
        els.mergeStatusContainer.classList.add('bg-blue-50', 'dark:bg-blue-900', 'border-l-4', 'border-blue-500', 'text-blue-700', 'dark:text-blue-200');
    }
    
    els.mergeStatusContainer.textContent = message;
    els.mergeStatusContainer.classList.remove('hidden');
}

export function showMetaEditorStatus(message, type) {
    els.metaEditorStatus.textContent = message;
    els.metaEditorStatus.classList.remove('hidden');
}

export function updateTabUI(tab) {
    const buttons = [els.tabSearchBtn, els.tabMergeBtn, els.tabMetaBtn];
    const contents = [els.tabSearchContent, els.tabMergeContent, els.tabMetaContent];
    const activeBtn = tab === 'search' ? els.tabSearchBtn : (tab === 'merge' ? els.tabMergeBtn : els.tabMetaBtn);
    const activeContent = tab === 'search' ? els.tabSearchContent : (tab === 'merge' ? els.tabMergeContent : els.tabMetaContent);

    buttons.forEach(btn => {
        if (btn === activeBtn) {
            btn.classList.add('border-primary', 'text-primary');
            btn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        } else {
            btn.classList.remove('border-primary', 'text-primary');
            btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400');
        }
    });

    contents.forEach(content => {
        if (content === activeContent) {
            content.classList.remove('hidden');
        } else {
            content.classList.add('hidden');
        }
    });
}
