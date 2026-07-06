const TYPO_CDN = 'https://cdn.jsdelivr.net/npm/typo-js@1.2.4/typo.js';

const DICT_URLS = {
    en_US: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/en/en_US.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/en/en_US.dic' },
    en_GB: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/en/en_GB.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/en/en_GB.dic' },
    es_ANY: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/es/es_ANY.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/es/es_ANY.dic' },
    fr_FR: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/fr-FR/fr.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/fr-FR/fr.dic' },
    de_DE: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/de/de_DE_frami.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/de/de_DE_frami.dic' },
    pt_BR: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/pt_BR/pt_BR.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/pt_BR/pt_BR.dic' },
    pt_PT: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/pt_PT/pt_PT.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/pt_PT/pt_PT.dic' },
    it_IT: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/it/it_IT.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/it/it_IT.dic' },
    nl_NL: { aff: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/nl_NL/nl_NL.aff', dic: 'https://cdn.jsdelivr.net/gh/LibreOffice/dictionaries@master/nl_NL/nl_NL.dic' },
};

const LANG_MAP = {
    en: 'en_US', 'en-US': 'en_US', 'en-GB': 'en_GB', 'en-AU': 'en_GB',
    es: 'es_ANY', 'es-ES': 'es_ANY', 'es-MX': 'es_ANY',
    fr: 'fr_FR', 'fr-FR': 'fr_FR',
    de: 'de_DE', 'de-DE': 'de_DE',
    pt: 'pt_BR', 'pt-BR': 'pt_BR', 'pt-PT': 'pt_PT',
    it: 'it_IT', 'it-IT': 'it_IT',
    nl: 'nl_NL', 'nl-NL': 'nl_NL',
};

let _typoInstance = null;
let _typoLang = '';
let _typoLoaded = false;
let _typoLoading = null;

function langCode(dictId) {
    return dictId.replace('_', '-').toLowerCase();
}

function dictId(lang) {
    if (!lang) return null;
    const base = lang.split(/[-_]/)[0].toLowerCase();
    return LANG_MAP[lang] || LANG_MAP[base] || null;
}

async function loadTypoLib() {
    if (_typoLoaded) return;
    if (window.Typo) { _typoLoaded = true; return; }
    if (_typoLoading) return _typoLoading;

    _typoLoading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = TYPO_CDN;
        s.crossOrigin = 'anonymous';
        s.onload = () => { _typoLoaded = true; resolve(); };
        s.onerror = () => reject(new Error('Failed to load Typo.js'));
        document.head.appendChild(s);
    });

    return _typoLoading;
}

async function loadDictionary(lang) {
    const dId = dictId(lang);
    if (!dId) throw new Error(`No dictionary available for "${lang}"`);

    if (_typoInstance && _typoLang === dId) return;

    const urls = DICT_URLS[dId];
    if (!urls) throw new Error(`No dictionary URLs for "${dId}"`);

    const [affText, dicText] = await Promise.all([
        fetch(urls.aff).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); }),
        fetch(urls.dic).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
    ]);

    _typoInstance = new Typo(dId, affText, dicText);
    _typoLang = dId;
}

export async function preloadSpelling(lang) {
    try {
        await loadTypoLib();
        await loadDictionary(lang);
    } catch (e) {
        console.warn('Spell check preload failed:', e.message);
        _typoInstance = null;
    }
}

const SKIP_RE = /^(https?:\/\/|www\.|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|\d+[\d.,%+\-€$¥£#]*$|[\d]+|[.,!?;:])$/i;

function isProbablyCode(word) {
    if (word.includes('_') && /^[A-Z_]+$/.test(word)) return true;
    if (/^[A-Z]{2,}$/.test(word) && word.length <= 6) return false;
    if (/[<>{}[\]\\/]/.test(word)) return true;
    if (/\d/.test(word) && /[a-zA-Z]/.test(word)) return true;
    return false;
}

export const spelling = {
    meta: { name: 'Spelling', category: 'Terminology', priority: 'warning' },
    check(units) {
        const issues = [];
        if (!_typoInstance) return issues;

        const wordRe = /[а-яА-Яa-zA-ZáéíóúüñÁÉÍÓÚÜÑàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛäëïöüÄËÏÖÜçÇøØåÅæÆœŒñÑ]+(?:['´’][а-яА-Яa-zA-Z]+)?/g;

        units.forEach((u, i) => {
            const tgt = u.target || '';
            wordRe.lastIndex = 0;
            const knownBad = new Set();

            let m;
            while ((m = wordRe.exec(tgt)) !== null) {
                const word = m[0];
                const lower = word.toLowerCase();

                if (lower.length <= 1) continue;
                if (SKIP_RE.test(word)) continue;
                if (isProbablyCode(word)) continue;
                if (knownBad.has(lower)) continue;

                if (_typoInstance.check(word)) continue;

                if (word !== lower && _typoInstance.check(lower)) continue;

                knownBad.add(lower);
                const suggestions = _typoInstance.suggest(word);
                const sugText = suggestions.length > 0 ? ` (suggestions: ${suggestions.slice(0, 5).join(', ')})` : '';
                issues.push({
                    tuIndex: i,
                    source: u.source || '',
                    target: tgt,
                    message: `Possible misspelling: "${word}"${sugText}`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
