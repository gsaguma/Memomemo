export function getGlossary() {
    try {
        const raw = localStorage.getItem('mm_qaGlossary');
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function setGlossary(entries) {
    localStorage.setItem('mm_qaGlossary', JSON.stringify(entries));
}

export const terminology = {
    meta: { name: 'Terminology', category: 'Terminology', priority: 'error' },
    check(units) {
        const issues = [];
        const glossary = getGlossary();
        if (glossary.length === 0) return issues;

        const srcLower = glossary.map(e => ({ source: e.source.toLowerCase(), target: e.target.toLowerCase() }));

        units.forEach((u, i) => {
            const src = (u.source || '').toLowerCase();
            const tgt = (u.target || '').toLowerCase();
            if (!src.trim()) return;

            for (const entry of srcLower) {
                const srcIdx = src.indexOf(entry.source);
                if (srcIdx === -1) continue;
                const tgtIdx = tgt.indexOf(entry.target);
                if (tgtIdx === -1) {
                    issues.push({
                        tuIndex: i, source: u.source, target: u.target,
                        message: `Glossary term "${entry.source}" should be translated as "${entry.target}"`,
                        priority: 'error'
                    });
                }
            }
        });

        return issues;
    }
};
