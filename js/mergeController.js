import { state } from './state.js';
import { idbSet } from './db.js';
import { parseFileContent } from './parsers.js';
import { generateTMXXML } from './exporter.js';
import { els, renderMergeFileList, showMergeStatus } from './ui.js';
import { savePreferences } from './shared.js';

async function processMergeFiles(filesList) {
    const filesArray = Array.from(filesList);
    const validExts = ['tmx', 'xliff', 'xlf', 'sdlxliff', 'csv'];

    for (const file of filesArray) {
        const fileNameLower = file.name.toLowerCase();
        const ext = fileNameLower.split('.').pop();
        if (!validExts.includes(ext)) {
            showMergeStatus(`Skipped unsupported file: ${file.name}`, 'error');
            continue;
        }

        try {
            const text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsText(file);
            });

            const parsed = parseFileContent(file.name, text);

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

            if (state.mergeFiles.length === 1) {
                els.mergeSrcLang.value = fileData.sourceLanguage;
                els.mergeTgtLang.value = fileData.targetLanguage;
            }

            renderMergeFileList(state, removeMergeFile, moveMergeFile);
            idbSet('mergeFiles', state.mergeFiles);
            showMergeStatus(`Successfully uploaded ${file.name}`, 'info');
        } catch (error) {
            console.error("Error parsing merge file:", error);
            showMergeStatus(`Error parsing ${file.name}: ${error.message || error}`, 'error');
        }
    }
}

export function removeMergeFile(id) {
    state.mergeFiles = state.mergeFiles.filter(f => f.id !== id);
    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    idbSet('mergeFiles', state.mergeFiles);
    showMergeStatus('File removed from list', 'info');
}

export function moveMergeFile(id, direction) {
    const idx = state.mergeFiles.findIndex(f => f.id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= state.mergeFiles.length) return;

    const temp = state.mergeFiles[idx];
    state.mergeFiles[idx] = state.mergeFiles[targetIdx];
    state.mergeFiles[targetIdx] = temp;

    renderMergeFileList(state, removeMergeFile, moveMergeFile);
    idbSet('mergeFiles', state.mergeFiles);
}

export function initMergeController() {
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

        requestAnimationFrame(() => {
            try {
                const removeDuplicates = els.mergeRemoveDuplicates.checked;
                const combinedSrc = els.mergeSrcLang.value.trim() || 'en';
                const combinedTgt = els.mergeTgtLang.value.trim() || 'es';
                const author = els.mergeAuthor.value.trim() || 'MemoMemo Merger';
                const tool = els.mergeTool.value.trim() || 'MemoMemo';

                let mergedUnits = [];

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

                if (removeDuplicates) {
                    const seen = new Set();
                    mergedUnits = mergedUnits.filter(unit => {
                        const key = `${unit.source.trim()}|||${unit.target.trim()}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                }

                const totalCountAfter = mergedUnits.length;
                const duplicatesRemoved = totalCountBefore - totalCountAfter;

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

                const mergedTmxXml = generateTMXXML(mergedUnits, mergeMetadata);

                const blob = new Blob([mergedTmxXml], { type: 'text/xml;charset=utf-8;' });
                const link = document.createElement('a');
                const downloadName = 'merged_translation_memory.tmx';

                link.href = URL.createObjectURL(blob);
                link.setAttribute('download', downloadName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                showMergeStatus(`Successfully merged ${state.mergeFiles.length} files into ${downloadName}! Total units: ${totalCountAfter}${removeDuplicates ? ` (${duplicatesRemoved} duplicates removed)` : ''}. Download has started automatically.`, 'success');
            } catch (error) {
                console.error("Error executing merge:", error);
                showMergeStatus(`Failed to merge: ${error.message}`, 'error');
            } finally {
                els.executeMergeBtn.disabled = false;
            }
        });
    });
}
