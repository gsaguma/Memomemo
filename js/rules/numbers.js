const NUM_REGEX = /-?\d+(?:[.,]\d+)?%?/g;

function extractNumbers(text) {
    return (text.match(NUM_REGEX) || []).map(n => n.replace(/,/g, '.'));
}

export const numbers = {
    meta: { name: 'Numbers', category: 'Formatting', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcNums = extractNumbers(u.source || '');
            const tgtNums = extractNumbers(u.target || '');
            if (srcNums.length === 0) return;

            const missing = srcNums.filter(n => !tgtNums.includes(n));
            const extra = tgtNums.filter(n => !srcNums.includes(n));

            if (missing.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Missing number(s) in target: ${missing.join(', ')}`,
                    priority: 'error'
                });
            }
            if (extra.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Extra number(s) in target: ${extra.join(', ')}`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
