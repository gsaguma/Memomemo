const SUSPICIOUS = [
    [/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, 'Control character'],
    [/[\u200B-\u200D\uFEFF]/g, 'Zero-width character (U+200B-200D / BOM)'],
    [/[\u202A-\u202E]/g, 'Bi-directional override character'],
    [/[\u2060-\u2064]/g, 'Invisible formatting character'],
    [/[\uFFFD]/g, 'Replacement character (U+FFFD)'],
    [/[\uFFFE]/g, 'Non-character (U+FFFE)'],
    [/[\u00AD]/g, 'Soft hyphen (U+00AD)'],
    [/[\u2000-\u200A]/g, 'Unusual space character (en/em quad)'],
    [/[\u2028\u2029]/g, 'Line/paragraph separator (Unicode)'],
    [/[\uE000-\uF8FF]/g, 'Private Use Area character']
];

export const unicode = {
    meta: { name: 'Unicode', category: 'Formatting', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const tgt = u.target || '';
            for (const [re, desc] of SUSPICIOUS) {
                re.lastIndex = 0;
                const m = re.exec(tgt);
                if (m) {
                    const ch = m[0];
                    const code = 'U+' + ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0');
                    issues.push({
                        tuIndex: i, source: u.source || '', target: tgt,
                        message: `${desc} (${code}) found in target`,
                        priority: 'warning'
                    });
                }
            }
        });
        return issues;
    }
};
