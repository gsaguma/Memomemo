export const spaces = {
    meta: { name: 'Spaces', category: 'Formatting', priority: 'info' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';

            if (tgt !== tgt.trimEnd()) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Trailing whitespace in target',
                    priority: 'warning'
                });
            }
            if (tgt !== tgt.trimStart()) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Leading whitespace in target',
                    priority: 'warning'
                });
            }
            if (/\t/.test(tgt)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Tab character found in target',
                    priority: 'info'
                });
            }
            if (/\r?\n/.test(tgt)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Line break in target',
                    priority: 'info'
                });
            }
            if (/ {2,}/.test(tgt)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Multiple consecutive spaces in target',
                    priority: 'info'
                });
            }
            if (/\u00A0/.test(tgt)) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: 'Non-breaking space (NBSP) in target',
                    priority: 'info'
                });
            }
        });
        return issues;
    }
};
