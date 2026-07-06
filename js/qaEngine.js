import * as rules from './rules/index.js';

export function runChecks(units, activeRuleIds) {
    const issues = [];

    for (const [ruleId, ruleFn] of Object.entries(rules)) {
        if (!activeRuleIds.includes(ruleId)) continue;
        const ruleMeta = ruleFn.meta || { name: ruleId, category: 'Other', priority: 'info' };
        const unitIssues = ruleFn.check(units);
        for (const issue of unitIssues) {
            issues.push({
                id: crypto.randomUUID ? crypto.randomUUID() : 'qai-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                rule: ruleId,
                ruleName: ruleMeta.name,
                category: ruleMeta.category,
                priority: issue.priority || ruleMeta.priority || 'info',
                tuIndex: issue.tuIndex,
                source: issue.source ?? '',
                target: issue.target ?? '',
                message: issue.message,
                fix: issue.fix || null,
                selected: false
            });
        }
    }

    issues.sort((a, b) => {
        const prio = { error: 0, warning: 1, info: 2 };
        const ap = prio[a.priority] ?? 2;
        const bp = prio[b.priority] ?? 2;
        if (ap !== bp) return ap - bp;
        return a.tuIndex - b.tuIndex;
    });

    const counts = { error: 0, warning: 0, info: 0 };
    for (const i of issues) counts[i.priority]++;

    return { issues, counts };
}

export function getRulesList() {
    return Object.entries(rules).map(([id, fn]) => ({
        id,
        ...(fn.meta || { name: id, category: 'Other', priority: 'info' })
    })).sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
}
