function normalize(s) {
    return s.replace(/\s+/g, ' ').trim().toLowerCase();
}

export const consistency = {
    meta: { name: 'Consistency', category: 'Consistency', priority: 'warning' },
    check(units) {
        const issues = [];
        const srcMap = new Map();

        units.forEach((u, i) => {
            const key = normalize(u.source || '');
            if (!key || key.length < 10) return;
            if (!srcMap.has(key)) srcMap.set(key, []);
            srcMap.get(key).push({ index: i, target: normalize(u.target || '') });
        });

        for (const [, entries] of srcMap) {
            if (entries.length < 2) continue;
            const uniqueTargets = new Set(entries.map(e => e.target));
            if (uniqueTargets.size < 2) continue;

            const targetGroups = new Map();
            for (const e of entries) {
                if (!targetGroups.has(e.target)) targetGroups.set(e.target, []);
                targetGroups.get(e.target).push(e.index);
            }

            const mainTarget = entries[0].target;
            for (const [tgt, indices] of targetGroups) {
                if (tgt === mainTarget) continue;
                const first = units[indices[0]];
                issues.push({
                    tuIndex: indices[0],
                    source: first.source,
                    target: first.target,
                    message: `Inconsistent translation found in ${indices.length} TU(s) (usual: "${mainTarget}")`,
                    priority: 'warning'
                });
            }
        }

        return issues;
    }
};
