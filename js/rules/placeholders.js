const PLACEHOLDER_PATTERNS = [
    /%[dsfrtn]/g,
    /%[+-]?\d*(?:\.\d+)?[dsf]/g,
    /\{\d+\}/g,
    /\{\{[^}]+\}\}/g,
    /\{[\w.]+\}/g,
    /<[^>]+>/g
];

function extractPlaceholders(text) {
    const set = new Set();
    for (const pat of PLACEHOLDER_PATTERNS) {
        let m;
        while ((m = pat.exec(text)) !== null) {
            set.add(m[0]);
        }
    }
    return set;
}

export const placeholders = {
    meta: { name: 'Placeholders', category: 'Formatting', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcPh = extractPlaceholders(u.source || '');
            const tgtPh = extractPlaceholders(u.target || '');
            if (srcPh.size === 0) return;

            const missing = [...srcPh].filter(p => !tgtPh.has(p));
            const extra = [...tgtPh].filter(p => !srcPh.has(p));

            if (missing.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Missing placeholder(s): ${missing.join(', ')}`,
                    priority: 'error'
                });
            }
            if (extra.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Extra placeholder(s) in target: ${extra.join(', ')}`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
