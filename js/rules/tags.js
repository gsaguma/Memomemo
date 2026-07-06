const TAG_REGEX = /<\/?[\w.-]+(?:\s[^>]*?)?\/?>/g;

function extractTags(text) {
    const tags = [];
    let m;
    while ((m = TAG_REGEX.exec(text)) !== null) {
        tags.push(m[0]);
    }
    return tags;
}

function normalizeTag(t) {
    return t.replace(/\s+/g, ' ').replace(/\s+>/g, '>').replace(/<\s+/g, '<').toLowerCase();
}

export const tags = {
    meta: { name: 'Tags', category: 'Formatting', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcTags = extractTags(u.source || '');
            const tgtTags = extractTags(u.target || '');
            if (srcTags.length === 0) return;

            const srcNorm = srcTags.map(normalizeTag);
            const tgtNorm = tgtTags.map(normalizeTag);

            const missing = srcNorm.filter(t => !tgtNorm.includes(t));
            const extra = tgtNorm.filter(t => !srcNorm.includes(t));

            if (missing.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Missing tag(s) in target: ${missing.join(', ')}`,
                    priority: 'error'
                });
            }
            if (extra.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Extra tag(s) in target: ${extra.join(', ')}`,
                    priority: 'warning'
                });
            }
        });
        return issues;
    }
};
