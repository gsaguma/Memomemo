import { state } from './state.js';
import { idbSet } from './db.js';
import { updateResults } from './ui.js';

function parseFindPattern(findText) {
    const match = findText.match(/^\/(.+)\/([gimsu]*)$/);
    if (match) {
        const flags = 'g' + (match[2] || '').replace(/g/g, '');
        return new RegExp(match[1], flags);
    }
    return new RegExp(findText, 'g');
}

export function findAndReplace(findText, replaceText, useRegex) {
    if (!findText) { alert('Enter text to find.'); return; }
    const units = state.tmxData.units;
    let totalReplaced = 0;
    let totalUnits = 0;

    let pattern;
    if (useRegex) {
        try { pattern = parseFindPattern(findText); }
        catch (err) { alert('Invalid regex: ' + err.message); return; }
    }

    try {
        for (const unit of units) {
            const t = unit.target || '';
            let newTarget;
            if (useRegex) {
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
            const pattern = parseFindPattern(findText);
            return (text.match(pattern) || []).length;
        }
        return text.split(findText).length - 1;
    } catch { return 0; }
}
