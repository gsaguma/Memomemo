export const duplicates = {
    meta: { name: 'Duplicates', category: 'Structure', priority: 'error' },
    check(units) {
        const issues = [];
        const seen = new Map();
        units.forEach((u, i) => {
            const key = (u.source + '|||' + u.target).toLowerCase().trim();
            if (seen.has(key)) {
                seen.get(key).push(i);
            } else {
                seen.set(key, [i]);
            }
        });
        for (const [, indices] of seen) {
            if (indices.length > 1) {
                const first = units[indices[0]];
                indices.forEach((tuIndex, idx) => {
                    issues.push({
                        tuIndex,
                        source: first.source,
                        target: first.target,
                        message: `Duplicate #${idx + 1} of ${indices.length}`,
                        priority: 'error',
                        fix: { type: 'delete', tuIndex }
                    });
                });
            }
        }
        return issues;
    }
};
