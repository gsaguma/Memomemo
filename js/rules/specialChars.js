const REPEATED_CHAR = /(.)\1{3,}/;
const REPEATED_WORD = /\b(\p{L}{2,})\s+\1\s+\1\b/gu;
const SUSPICIOUS_SEQ = /[×÷±∞≈≠≡≤≥√∛∜∑∏∫∂∇∆∏∐]/g;

export const specialChars = {
    meta: { name: 'Special Chars', category: 'Formatting', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const tgt = u.target || '';
            const src = u.source || '';

            const rm = REPEATED_CHAR.exec(tgt);
            if (rm) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Repeated character "${rm[1]}" (${rm[0].length}x) in target`,
                    priority: 'warning'
                });
            }

            const rwm = REPEATED_WORD.exec(tgt);
            if (rwm) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Repeated word "${rwm[1]}" (3+ times) in target`,
                    priority: 'warning'
                });
            }

            const sm = SUSPICIOUS_SEQ.exec(tgt);
            if (sm) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Math symbol "${sm[0]}" in target (possibly untranslated)`,
                    priority: 'info'
                });
            }
        });
        return issues;
    }
};
