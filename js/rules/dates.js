const DATE_PATTERNS = [
    /\d{4}-\d{2}-\d{2}/g,
    /\d{2}\/\d{2}\/\d{4}/g,
    /\d{2}\.\d{2}\.\d{4}/g,
    /\d{2}-\d{2}-\d{4}/g,
    /\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2},?\s+\d{4}/gi,
    /(?:january|february|march|april|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi
];

function extractDates(text) {
    const all = [];
    for (const pat of DATE_PATTERNS) {
        let m;
        while ((m = pat.exec(text)) !== null) {
            all.push(m[0]);
        }
    }
    return all;
}

export const dates = {
    meta: { name: 'Dates', category: 'Consistency', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcDates = extractDates(u.source || '');
            const tgtDates = extractDates(u.target || '');
            if (srcDates.length === 0) return;

            const missing = srcDates.filter(d => !tgtDates.some(t => t.replace(/[^a-zA-Z0-9]/g, '') === d.replace(/[^a-zA-Z0-9]/g, '')));
            if (missing.length > 0) {
                issues.push({
                    tuIndex: i, source: u.source, target: u.target,
                    message: `Date(s) from source missing or changed in target`,
                    priority: 'error'
                });
            }
        });
        return issues;
    }
};
