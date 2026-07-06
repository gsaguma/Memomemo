const ACRONYM_RE = /\b[A-Z]{2,}(?:s|'s)?\b/g;

function firstWord(text) {
    const m = text.trim().match(/^(\S+)/);
    return m ? m[1] : '';
}

function isCapitalized(w) {
    return /^\p{Lu}/u.test(w);
}

export const capitalization = {
    meta: { name: 'Capitalization', category: 'Consistency', priority: 'info' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';
            if (!src.trim() || !tgt.trim()) return;

            const srcFirst = firstWord(src);
            const tgtFirst = firstWord(tgt);

            if (isCapitalized(srcFirst) && !isCapitalized(tgtFirst)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Target starts with lowercase but source is capitalized`,
                    priority: 'warning'
                });
            }

            const srcAcr = Array.from(src.matchAll(ACRONYM_RE), m => m[0].replace(/'s$/i, ''));
            const tgtAcr = Array.from(tgt.matchAll(ACRONYM_RE), m => m[0].replace(/'s$/i, ''));
            const missing = srcAcr.filter(a => !tgtAcr.includes(a));
            if (missing.length > 0) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `All-caps term(s) from source not found in target: ${missing.join(', ')}`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
