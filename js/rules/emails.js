const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function extractEmails(text) {
    return text.match(EMAIL_REGEX) || [];
}

export const emails = {
    meta: { name: 'Emails', category: 'Consistency', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const srcEmails = extractEmails(u.source || '');
            const tgtEmails = extractEmails(u.target || '');
            if (srcEmails.length === 0) return;

            const missing = srcEmails.filter(e => !tgtEmails.includes(e));
            if (missing.length > 0) {
                issues.push({
                    tuIndex: i,
                    source: u.source,
                    target: u.target,
                    message: `Email modified or missing in target`,
                    priority: 'error'
                });
            }
        });
        return issues;
    }
};
