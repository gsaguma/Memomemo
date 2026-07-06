export const length = {
    meta: { name: 'Length', category: 'Formatting', priority: 'info' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';
            if (!src.trim()) return;

            const srcLen = src.length;
            const tgtLen = tgt.length;
            const ratio = srcLen > 0 ? tgtLen / srcLen : 1;

            if (ratio > 2) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Target is ${Math.round(ratio * 100)}% of source length (very long)`,
                    priority: 'warning'
                });
            } else if (ratio < 0.5 && srcLen > 10) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Target is ${Math.round(ratio * 100)}% of source length (very short)`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
