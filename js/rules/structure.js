export const structure = {
    meta: { name: 'Structure', category: 'Structure', priority: 'error' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = (u.source || '').trim();
            const tgt = (u.target || '').trim();
            if (!src && !tgt) {
                issues.push({
                    tuIndex: i,
                    source: u.source || '',
                    target: u.target || '',
                    message: 'Both source and target are empty',
                    priority: 'error'
                });
            } else if (!src) {
                issues.push({
                    tuIndex: i,
                    source: '',
                    target: u.target || '',
                    message: 'Empty source segment',
                    priority: 'error'
                });
            } else if (!tgt) {
                issues.push({
                    tuIndex: i,
                    source: u.source || '',
                    target: '',
                    message: 'Empty target segment',
                    priority: 'error'
                });
            }
        });
        return issues;
    }
};
