function onlyPunctuationOrSymbols(s) {
    return /^[\s\p{P}\p{S}]+$/u.test(s);
}

function isNumericOnly(s) {
    return /^[\d\s.,%+\-€$¥£#]+$/.test(s);
}

export const quality = {
    meta: { name: 'Quality Flags', category: 'Formatting', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';

            if (src.trim() && src.trim().toLowerCase() === tgt.trim().toLowerCase()) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Source and target are identical',
                    priority: 'warning'
                });
            }
            if (src.trim() && onlyPunctuationOrSymbols(tgt)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Target contains only punctuation or symbols',
                    priority: 'warning'
                });
            }
            if (src.trim() && isNumericOnly(tgt) && !isNumericOnly(src)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Target appears to be numeric only (untranslated)',
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
