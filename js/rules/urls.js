const URL_REGEX = /https?:\/\/[^\s<>"']+(?:\/[^\s<>"']*)?/gi;

function extractUrls(text) {
    return text.match(URL_REGEX) || [];
}

function domainOf(url) {
    try { return new URL(url).hostname; } catch { return url; }
}

export const urls = {
    meta: { name: 'URLs', category: 'Consistency', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcUrls = extractUrls(u.source || '');
            const tgtUrls = extractUrls(u.target || '');
            if (srcUrls.length === 0) return;

            const missing = srcUrls.filter(url => !tgtUrls.includes(url));
            const changed = srcUrls.filter(url => {
                const found = tgtUrls.find(t => domainOf(t).toLowerCase() !== domainOf(url).toLowerCase());
                return !tgtUrls.includes(url) && found;
            });

            if (missing.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `URL modified or missing in target`,
                    priority: 'error'
                });
            }
            if (changed.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Domain changed in target URL`,
                    priority: 'error'
                });
            }
        });
        return issues;
    }
};
