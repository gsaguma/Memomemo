const END_PUNCT = /[.!?:;…!¡¿‽]+$/;
const QUOTE_PAIRS = [['"', '"'], ["'", "'"], ['«', '»'], ['“', '”'], ['‘', '’'], ['「', '」']];
const BRACKET_PAIRS = [['(', ')'], ['[', ']'], ['{', '}'], ['<', '>']];

function endPunct(s) {
    const m = END_PUNCT.exec(s.trim());
    return m ? m[0] : '';
}

function checkBalanced(text, pairs) {
    const issues = [];
    for (const [open, close] of pairs) {
        let depth = 0;
        for (const ch of text) {
            if (ch === open) depth++;
            else if (ch === close) depth--;
        }
        if (depth !== 0) {
            issues.push({ char: open + close, diff: depth });
        }
    }
    return issues;
}

export const punctuation = {
    meta: { name: 'Punctuation', category: 'Consistency', priority: 'warning' },
    check(units) {
        const issues = [];
        units.forEach((u, i) => {
            const src = u.source || '';
            const tgt = u.target || '';
            if (!src.trim() || !tgt.trim()) return;

            const srcEnd = endPunct(src);
            const tgtEnd = endPunct(tgt);

            if (srcEnd && tgtEnd && srcEnd !== tgtEnd) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `End punctuation differs: "${srcEnd}" vs "${tgtEnd}"`,
                    priority: 'warning'
                });
            } else if (srcEnd && !tgtEnd) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Missing ending punctuation in target`,
                    priority: 'info'
                });
            } else if (!srcEnd && tgtEnd) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Target has ending punctuation but source does not`,
                    priority: 'info'
                });
            }

            const bqIssues = checkBalanced(tgt, BRACKET_PAIRS);
            for (const bi of bqIssues) {
                issues.push({
                    tuIndex: i, source: src, target: tgt,
                    message: `Unbalanced bracket "${bi.char}" (${bi.diff > 0 ? 'more opens' : 'more closes'})`,
                    priority: 'warning'
                });
            }

            const qtIssues = checkBalanced(tgt, QUOTE_PAIRS);
            for (const qi of qtIssues) {
                if (Math.abs(qi.diff) > 1) {
                    issues.push({
                        tuIndex: i, source: src, target: tgt,
                        message: `Unbalanced quote "${qi.char}" (${qi.diff > 0 ? 'more opens' : 'more closes'})`,
                        priority: 'info'
                    });
                }
            }
        });
        return issues;
    }
};
