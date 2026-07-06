const PATTERN_CACHE = {};

function langBase(code) {
    if (!code) return '';
    return code.split(/[-_]/)[0].toLowerCase();
}

export async function preloadGrammarPatterns(langCode) {
    const lang = langBase(langCode);
    if (!lang || PATTERN_CACHE[lang] !== undefined) return;
    try {
        const mod = await import(`./patterns/${lang}.js`);
        PATTERN_CACHE[lang] = mod.patterns || [];
    } catch {
        PATTERN_CACHE[lang] = null;
    }
}

function getPatterns(langCode) {
    const lang = langBase(langCode);
    return lang ? (PATTERN_CACHE[lang] || null) : null;
}

export const grammar = {
    meta: { name: 'Grammar', category: 'Terminology', priority: 'info' },
    check(units) {
        const issues = [];
        const tgtLang = units.targetLanguage || units.sourceLanguage || '';
        const pats = getPatterns(tgtLang);
        if (!pats || pats.length === 0) return issues;

        units.forEach((u, i) => {
            const tgt = u.target || '';
            for (const { re, msg } of pats) {
                re.lastIndex = 0;
                const m = re.exec(tgt);
                if (m) {
                    let formatted = msg.replace(/\$&/g, m[0]);
                    for (let n = 1; n < m.length; n++) {
                        formatted = formatted.replace(new RegExp(`\\$${n}`, 'g'), m[n] || '');
                    }
                    issues.push({
                        tuIndex: i, source: u.source || '', target: tgt,
                        message: formatted,
                        priority: 'info'
                    });
                    break;
                }
            }
        });
        return issues;
    }
};
