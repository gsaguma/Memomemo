import { state } from './state.js';
import { idbSet, idbDelete } from './db.js';
import { generateTMXXML } from './exporter.js';
import { alignTexts, extractTextFromDocx, extractTextFromPptx } from './aligner.js';
import { els, showError, showSessionBanner, renderAlignmentPreviewTable } from './ui.js';
import { loadSharedFile, switchTab as sw } from './shared.js';

async function handleAlignFileUpload(file, isSource) {
    try {
        const text = await parseAlignmentFile(file);
        if (isSource) {
            els.alignSourceText.value = text;
            els.alignSourceDropZone.classList.add('hidden');
            els.alignSourceFileInfo.classList.remove('hidden');
            els.alignSourceFileName.textContent = file.name;
        } else {
            els.alignTargetText.value = text;
            els.alignTargetDropZone.classList.add('hidden');
            els.alignTargetFileInfo.classList.remove('hidden');
            els.alignTargetFileName.textContent = file.name;
        }
    } catch (err) {
        console.error('Failed to parse alignment file:', err);
        showError('Error loading alignment file', err.message, 'Make sure the file is a supported format: .txt, .csv, .docx, .pptx');
    }
}

async function parseAlignmentFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'docx') {
        const buffer = await file.arrayBuffer();
        return await extractTextFromDocx(buffer);
    } else if (ext === 'pptx') {
        const buffer = await file.arrayBuffer();
        return await extractTextFromPptx(buffer);
    } else {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    }
}

export function handleAlignRowAction(action, index) {
    if (action === 'merge') {
        if (index < state.alignedPairs.length - 1) {
            const current = state.alignedPairs[index];
            const next = state.alignedPairs[index + 1];
            current.source = (current.source + ' ' + next.source).trim();
            current.target = (current.target + ' ' + next.target).trim();
            current.confidence = 100;
            current.suggestion = '';
            state.alignedPairs.splice(index + 1, 1);
        }
    } else if (action === 'shift') {
        let prevTarget = "";
        for (let i = index; i < state.alignedPairs.length; i++) {
            const temp = state.alignedPairs[i].target;
            state.alignedPairs[i].target = prevTarget;
            state.alignedPairs[i].confidence = 100;
            state.alignedPairs[i].suggestion = '';
            prevTarget = temp;
        }
        if (prevTarget.trim()) {
            state.alignedPairs.push({
                id: 'align-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                source: '',
                target: prevTarget,
                confidence: 100,
                suggestion: ''
            });
        }
    } else if (action === 'delete') {
        state.alignedPairs.splice(index, 1);
    }
    idbSet('alignedPairs', state.alignedPairs);
    renderAlignmentPreviewTable(state.alignedPairs, handleAlignRowAction);
}

export function resetAlignment() {
    state.alignedPairs = [];
    idbDelete('alignedPairs');

    if (els.alignSourceFileInput) els.alignSourceFileInput.value = '';
    if (els.alignSourceFileName) els.alignSourceFileName.textContent = '';
    if (els.alignSourceFileInfo) els.alignSourceFileInfo.classList.add('hidden');
    if (els.alignSourceDropZone) els.alignSourceDropZone.classList.remove('hidden');
    if (els.alignSourceText) els.alignSourceText.value = '';

    if (els.alignTargetFileInput) els.alignTargetFileInput.value = '';
    if (els.alignTargetFileName) els.alignTargetFileName.textContent = '';
    if (els.alignTargetFileInfo) els.alignTargetFileInfo.classList.add('hidden');
    if (els.alignTargetDropZone) els.alignTargetDropZone.classList.remove('hidden');
    if (els.alignTargetText) els.alignTargetText.value = '';

    if (els.alignPreviewTable) els.alignPreviewTable.innerHTML = '';
    if (els.alignPreviewSection) els.alignPreviewSection.classList.add('hidden');
    if (els.alignInputSection) els.alignInputSection.classList.remove('hidden');
}

export function initAlignController() {
    if (els.tabAlignBtn) {
        els.tabAlignBtn.addEventListener('click', () => sw('align'));
    }

    if (els.alignSourceDropZone) {
        els.alignSourceDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.alignSourceDropZone.classList.add('bg-gray-100');
        });
        els.alignSourceDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            els.alignSourceDropZone.classList.remove('bg-gray-100');
        });
        els.alignSourceDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            els.alignSourceDropZone.classList.remove('bg-gray-100');
            if (e.dataTransfer.files.length) {
                handleAlignFileUpload(e.dataTransfer.files[0], true);
            }
        });
    }

    if (els.alignSourceFileInput) {
        els.alignSourceFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleAlignFileUpload(e.target.files[0], true);
            }
        });
    }

    if (els.changeAlignSourceBtn) {
        els.changeAlignSourceBtn.addEventListener('click', () => {
            els.alignSourceFileInput.value = '';
            els.alignSourceFileName.textContent = '';
            els.alignSourceFileInfo.classList.add('hidden');
            els.alignSourceDropZone.classList.remove('hidden');
            els.alignSourceText.value = '';
        });
    }

    if (els.alignTargetDropZone) {
        els.alignTargetDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.alignTargetDropZone.classList.add('bg-gray-100');
        });
        els.alignTargetDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            els.alignTargetDropZone.classList.remove('bg-gray-100');
        });
        els.alignTargetDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            els.alignTargetDropZone.classList.remove('bg-gray-100');
            if (e.dataTransfer.files.length) {
                handleAlignFileUpload(e.dataTransfer.files[0], false);
            }
        });
    }

    if (els.alignTargetFileInput) {
        els.alignTargetFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleAlignFileUpload(e.target.files[0], false);
            }
        });
    }

    if (els.changeAlignTargetBtn) {
        els.changeAlignTargetBtn.addEventListener('click', () => {
            els.alignTargetFileInput.value = '';
            els.alignTargetFileName.textContent = '';
            els.alignTargetFileInfo.classList.add('hidden');
            els.alignTargetDropZone.classList.remove('hidden');
            els.alignTargetText.value = '';
        });
    }

    if (els.startAlignBtn) {
        els.startAlignBtn.addEventListener('click', () => {
            const srcText = els.alignSourceText.value;
            const tgtText = els.alignTargetText.value;

            if (!srcText.trim() || !tgtText.trim()) {
                showError('Missing text', 'Please enter text or upload files for both source and target languages.', 'Both source and target inputs must be non-empty.');
                return;
            }

            const originalHTML = els.startAlignBtn.innerHTML;
            els.startAlignBtn.innerHTML = '<svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Aligning...';
            els.startAlignBtn.disabled = true;
            els.errorMessage.classList.add('hidden');

            requestAnimationFrame(() => {
                state.alignedPairs = alignTexts(srcText, tgtText);
                els.startAlignBtn.innerHTML = originalHTML;
                els.startAlignBtn.disabled = false;
                idbSet('alignedPairs', state.alignedPairs);

                const lowConf = state.alignedPairs.filter(p => (p.confidence ?? 100) < 60).length;
                const medConf = state.alignedPairs.filter(p => {
                    const c = p.confidence ?? 100;
                    return c >= 60 && c < 85;
                }).length;
                if (lowConf > 0) {
                    const pct = Math.round((lowConf / state.alignedPairs.length) * 100);
                    showSessionBanner(`⚠️ ${lowConf} of ${state.alignedPairs.length} pairs have low confidence (${pct}%). Low-confidence rows are marked with a red left border. Use Merge/Shift/Delete to fix alignment.`, false);
                } else if (medConf > 0) {
                    const pct = Math.round((medConf / state.alignedPairs.length) * 100);
                    showSessionBanner(`ℹ️ ${medConf} of ${state.alignedPairs.length} pairs have medium confidence (${pct}%). Review yellow-bordered rows for accuracy.`, false);
                }

                if (els.alignInputSection) els.alignInputSection.classList.add('hidden');
                if (els.alignPreviewSection) els.alignPreviewSection.classList.remove('hidden');
                renderAlignmentPreviewTable(state.alignedPairs, handleAlignRowAction);
            });
        });
    }

    if (els.alignOpenInAppBtn) {
        els.alignOpenInAppBtn.addEventListener('click', () => {
            const validPairs = state.alignedPairs.filter(p => p.source.trim() || p.target.trim());
            if (!validPairs.length) return;

            const alignedData = {
                units: validPairs.map(p => ({
                    source: p.source,
                    target: p.target
                })),
                sourceLanguage: 'en',
                targetLanguage: 'es',
                metadata: {
                    creationid: 'MemoMemo Align',
                    creationtool: 'MemoMemo',
                    creationtoolversion: '1.0',
                    creationdate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
                    srclang: 'en',
                    adminlang: 'es',
                    datatype: 'plaintext',
                    segtype: 'sentence'
                }
            };

            loadSharedFile(alignedData, 'aligned_translations.tmx', 'Dynamic');
            sw('search');
            showSessionBanner('✓ Alignments loaded into MemoMemo successfully.', true);
        });
    }

    if (els.alignDownloadBtn) {
        els.alignDownloadBtn.addEventListener('click', () => {
            const validPairs = state.alignedPairs.filter(p => p.source.trim() || p.target.trim());
            if (!validPairs.length) return;

            const format = els.alignExportFormat?.value || 'tmx';
            let fileContent = "";
            let mimeType = "text/plain;charset=utf-8;";
            let fileExtension = "txt";

            if (format === 'tmx') {
                fileContent = generateTMXXML(
                    validPairs.map(p => ({ source: p.source, target: p.target })),
                    {
                        creationid: 'MemoMemo Align',
                        creationtool: 'MemoMemo',
                        creationtoolversion: '1.0',
                        creationdate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
                        srclang: 'en',
                        adminlang: 'es',
                        datatype: 'plaintext',
                        segtype: 'sentence'
                    }
                );
                mimeType = "text/xml;charset=utf-8;";
                fileExtension = "tmx";
            } else if (format === 'txt') {
                fileContent = validPairs.map(p => `${p.source}\t${p.target}`).join('\n');
                mimeType = "text/plain;charset=utf-8;";
                fileExtension = "txt";
            } else if (format === 'csv') {
                const sanitizeCSV = (v) => {
                    const escaped = v.replace(/"/g, '""');
                    if (/^[=+\-@]/.test(escaped)) return "'" + escaped;
                    return escaped;
                };
                const header = '"Source","Target"\n';
                const rows = validPairs.map(p => {
                    const srcEscaped = sanitizeCSV(p.source);
                    const tgtEscaped = sanitizeCSV(p.target);
                    return `"${srcEscaped}","${tgtEscaped}"`;
                }).join('\n');
                fileContent = header + rows;
                mimeType = "text/csv;charset=utf-8;";
                fileExtension = "csv";
            }

            const blob = new Blob([fileContent], { type: mimeType });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', `aligned_translation_memory.${fileExtension}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        });
    }

    if (els.alignBackBtn) {
        els.alignBackBtn.addEventListener('click', () => {
            if (els.alignPreviewSection) els.alignPreviewSection.classList.add('hidden');
            if (els.alignInputSection) els.alignInputSection.classList.remove('hidden');
        });
    }

    const triggerClearAlignment = () => {
        if (confirm('Are you sure you want to clear the current alignment and all loaded texts to start a new one?')) {
            resetAlignment();
        }
    };

    if (els.alignClearBtn) {
        els.alignClearBtn.addEventListener('click', triggerClearAlignment);
    }
    if (els.alignClearInputsBtn) {
        els.alignClearInputsBtn.addEventListener('click', triggerClearAlignment);
    }
}
