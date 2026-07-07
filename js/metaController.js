import { state } from './state.js';
import { lsGet } from './db.js';
import { parseFileContent } from './parsers.js';
import { generateTMXXML } from './exporter.js';
import { els, showMetaEditorStatus, formatFileSize } from './ui.js';
import { loadSharedFile, formatTmxDate } from './shared.js';

function processMetaEditorFile(file) {
    const fileNameLower = file.name.toLowerCase();
    const ext = fileNameLower.split('.').pop();
    const validExts = ['tmx', 'xliff', 'xlf', 'sdlxliff', 'csv'];
    if (!validExts.includes(ext)) {
        showMetaEditorStatus(`Unsupported file format: ${file.name}`, 'error');
        els.metadataCard.classList.add('hidden');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
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

export function initMetaController() {
    const metaDropZone = els.metaDropZone;
    if (metaDropZone) {
        metaDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            metaDropZone.classList.add('bg-surface-hover');
        });
        metaDropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            metaDropZone.classList.remove('bg-surface-hover');
        });
        metaDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            metaDropZone.classList.remove('bg-surface-hover');
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

    els.exportMetadataBtn.addEventListener('click', () => {
        if (!state.metaEditorData.units.length) return;

        const formattedDate = formatTmxDate(els.metaCreationDate.value.trim());
        els.metaCreationDate.value = formattedDate;

        state.metaEditorData.metadata.creationid = els.metaAuthor.value.trim();
        state.metaEditorData.metadata.creationtoolversion = els.metaToolVersion.value.trim();
        state.metaEditorData.metadata.creationdate = formattedDate;
        state.metaEditorData.metadata.srclang = els.metaSrcLang.value.trim();
        state.metaEditorData.metadata.adminlang = els.metaTgtLang.value.trim();
        state.metaEditorData.metadata.datatype = els.metaDatatype.value.trim();
        state.metaEditorData.metadata.segtype = els.metaSegtype.value.trim();

        const tmxXml = generateTMXXML(state.metaEditorData.units, state.metaEditorData.metadata);

        const blob = new Blob([tmxXml], { type: 'text/xml;charset=utf-8;' });
        const link = document.createElement('a');
        const originalName = els.metaFileInput.files[0]?.name || lsGet('metaFileName') || 'translation_memory.tmx';
        const downloadName = originalName.toLowerCase().endsWith('.tmx') ? originalName : (originalName.split('.')[0] + '.tmx');

        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', downloadName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    });

    const changeMetaFileBtn = document.getElementById('changeMetaFileBtn');
    if (changeMetaFileBtn) {
        changeMetaFileBtn.addEventListener('click', () => {
            els.metaFileInput.click();
        });
    }
}
