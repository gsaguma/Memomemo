const PATTERNS = [
    { name: 'Email', re: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { name: 'http(s) URL', re: /https?:\/\/[^\s<>"']+/gi },
    { name: 'IPv4', re: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
    { name: 'IPv6', re: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g },
    { name: 'UUID', re: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g },
    { name: 'ISBN-13', re: /\b978(?:-?\d){10}\b/g },
    { name: 'Phone', re: /\b(?:\+?\d{1,3}[-. ]?)?\(?\d{2,4}\)?[-. ]?\d{2,4}[-. ]?\d{2,4}\b/g }
];

export const patterns = {
    meta: { name: 'Pattern Detection', category: 'Consistency', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';

            for (const { name, re } of PATTERNS) {
                re.lastIndex = 0;
                const tgtMatches = Array.from(tgt.matchAll(re));
                if (tgtMatches.length === 0) continue;
                const srcMatches = new Set(Array.from(src.matchAll(re), m => m[0]));

                for (const m of tgtMatches) {
                    if (!srcMatches.has(m[0])) {
                        issues.push({
                            tuIndex: i, source: src, target: tgt,
                            message: `${name} "${m[0]}" appears in target but not in source`,
                            priority: 'warning'
                        });
                    }
                }
            }
        });
        return issues;
    }
};
