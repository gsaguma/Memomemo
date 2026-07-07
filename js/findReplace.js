import { state } from './state.js';
import { idbSet } from './db.js';
import { updateResults } from './ui.js';

export function findAndReplace(findText, replaceText, useRegex) {
    if (!findText) { alert('Enter text to find.'); return; }
    const units = state.tmxData.units;
    let totalReplaced = 0;
    let totalUnits = 0;

    try {
        for (const unit of units) {
            const t = unit.target || '';
            let newTarget;
            if (useRegex) {
                const flags = findText.startsWith('/') && findText.endsWith('/')
                    ? findText.slice(1, -1)
                    : findText;
                const pattern = findText.startsWith('/') && findText.endsWith('/')
                    ? new RegExp(flags, 'g')
                    : new RegExp(findText, 'g');
                newTarget = t.replace(pattern, replaceText);
            } else {
                newTarget = t.split(findText).join(replaceText);
            }
            if (newTarget !== t) {
                unit.target = newTarget;
                totalUnits++;
                totalReplaced += countMatches(t, findText, useRegex);
            }
        }
    } catch (err) {
        alert('Regex error: ' + err.message);
        return;
    }

    state.filteredUnits = [...units];
    idbSet('tmxData', state.tmxData);
    updateResults(state);

    if (totalUnits === 0) {
        alert('No matches found.');
    } else {
        const occ = totalReplaced === 1 ? 'occurrence' : 'occurrences';
        const un = totalUnits === 1 ? 'unit' : 'units';
        alert(`Replaced ${totalReplaced} ${occ} across ${totalUnits} ${un}.`);
    }
}

function countMatches(text, findText, useRegex) {
    try {
        if (useRegex) {
            const flags = findText.startsWith('/') && findText.endsWith('/')
                ? findText.slice(1, -1)
                : findText;
            const pattern = findText.startsWith('/') && findText.endsWith('/')
                ? new RegExp(flags, 'g')
                : new RegExp(findText, 'g');
            return (text.match(pattern) || []).length;
        }
        return text.split(findText).length - 1;
    } catch { return 0; }
}
