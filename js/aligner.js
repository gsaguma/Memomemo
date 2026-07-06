export function splitSentences(text) {
    if (!text) return [];

    if (typeof Intl.Segmenter === 'function') {
        const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' });
        return Array.from(segmenter.segment(text), s => s.segment.trim()).filter(Boolean);
    }

    const paragraphs = text.split(/\r?\n/);
    const abbreviations = [
        'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr',
        'eg', 'ie', 'vs', 'etc', 'vol', 'ed', 'al',
        'am', 'pm', 'st', 'ave', 'rd', 'co', 'inc'
    ];
    const allSentences = [];

    paragraphs.forEach(para => {
        const trimmed = para.trim();
        if (!trimmed) return;

        const rawSplits = trimmed.split(/([.!?]\s+)/);
        let temp = '';

        for (let i = 0; i < rawSplits.length; i++) {
            const part = rawSplits[i];
            if (!part) continue;
            temp += part;

            if (i % 2 === 1) {
                const words = temp.trim().split(/[\s,]+/);
                const lastWord = words[words.length - 1]?.replace(/[.!?]/g, '').toLowerCase();
                if (!abbreviations.includes(lastWord)) {
                    allSentences.push(temp.trim());
                    temp = '';
                }
            }
        }
        if (temp.trim()) allSentences.push(temp.trim());
    });

    return allSentences;
}

function normalLogPdf(x) {
    return -0.5 * x * x - 0.5 * Math.log(2 * Math.PI);
}

function computeDelta(l1, l2, c, s2) {
    if (l1 === 0 && l2 === 0) return 0;
    if (l1 === 0) return l2 / Math.sqrt(s2);
    return (l2 - c * l1) / Math.sqrt(l1 * s2);
}

function alignCost(l1, l2, c, s2, srcCount, tgtCount, prior) {
    const logPrior = Math.log(prior);
    if (srcCount === 0 || tgtCount === 0) {
        const penalty = (l1 + l2) * 0.05;
        return -logPrior + penalty;
    }
    const delta = computeDelta(l1, l2, c, s2);
    return -logPrior - normalLogPdf(delta);
}

function extractAnchors(text) {
    const anchors = [];
    const numberRe = /\b\d+(?:[.,]\d+)?\b/g;
    let m;
    while ((m = numberRe.exec(text)) !== null) anchors.push(m[0]);
    const urlRe = /https?:\/\/[^\s]+/g;
    while ((m = urlRe.exec(text)) !== null) anchors.push(m[0]);
    const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    while ((m = emailRe.exec(text)) !== null) anchors.push(m[0]);
    const dateRe = /\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b/g;
    while ((m = dateRe.exec(text)) !== null) anchors.push(m[0]);
    return anchors;
}

function findAnchors(sourceSents, targetSents) {
    const MAX_FREQ = 5;
    const freq = {};
    const srcLists = sourceSents.map(s => {
        const a = extractAnchors(s);
        a.forEach(x => { freq[x] = (freq[x] || 0) + 1; });
        return a;
    });
    const tgtLists = targetSents.map(s => extractAnchors(s));

    const srcSets = srcLists.map(arr => new Set(arr.filter(a => freq[a] <= MAX_FREQ)));
    const tgtSets = tgtLists.map(arr => new Set(arr.filter(a => freq[a] <= MAX_FREQ)));

    const candidates = [];
    for (let i = 0; i < sourceSents.length; i++) {
        for (let j = 0; j < targetSents.length; j++) {
            const common = [...srcSets[i]].filter(a => tgtSets[j].has(a));
            if (common.length >= 1) {
                candidates.push({ srcIdx: i, tgtIdx: j, count: common.length });
            }
        }
    }

    candidates.sort((a, b) => b.count - a.count);
    const usedSrc = new Set();
    const usedTgt = new Set();
    const resolved = [];
    for (const c of candidates) {
        if (!usedSrc.has(c.srcIdx) && !usedTgt.has(c.tgtIdx)) {
            usedSrc.add(c.srcIdx);
            usedTgt.add(c.tgtIdx);
            resolved.push(c);
        }
    }
    return resolved.sort((a, b) => a.srcIdx - b.srcIdx);
}

function dpAlign(srcSents, tgtSents, c, s2, priors) {
    const N = srcSents.length;
    const M = tgtSents.length;

    const dp = Array.from({ length: N + 1 }, () => Array(M + 1).fill(Infinity));
    const bt = Array.from({ length: N + 1 }, () => Array(M + 1).fill(null));
    dp[0][0] = 0;

    const transitionCost = (i1, i2, j1, j2) => {
        const srcLen = i1 < i2 ? srcSents.slice(i1, i2).reduce((s, x) => s + x.length, 0) : 0;
        const tgtLen = j1 < j2 ? tgtSents.slice(j1, j2).reduce((s, x) => s + x.length, 0) : 0;
        const srcCount = i2 - i1;
        const tgtCount = j2 - j1;
        const key = `${srcCount}-${tgtCount}`;
        if (!priors[key]) return Infinity;
        return alignCost(srcLen, tgtLen, c, s2, srcCount, tgtCount, priors[key]);
    };

    const tryUpdate = (i, j, ni, nj, cost, step) => {
        if (cost === Infinity) return;
        if (dp[i][j] + cost < dp[ni][nj]) {
            dp[ni][nj] = dp[i][j] + cost;
            bt[ni][nj] = step;
        }
    };

    for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= M; j++) {
            if (dp[i][j] === Infinity) continue;

            if (i < N && j < M) tryUpdate(i, j, i + 1, j + 1, transitionCost(i, i + 1, j, j + 1), { di: 1, dj: 1 });
            if (i < N) tryUpdate(i, j, i + 1, j, transitionCost(i, i + 1, j, j), { di: 1, dj: 0 });
            if (j < M) tryUpdate(i, j, i, j + 1, transitionCost(i, i, j, j + 1), { di: 0, dj: 1 });
            if (i + 1 < N && j < M) tryUpdate(i, j, i + 2, j + 1, transitionCost(i, i + 2, j, j + 1), { di: 2, dj: 1 });
            if (i < N && j + 1 < M) tryUpdate(i, j, i + 1, j + 2, transitionCost(i, i + 1, j, j + 2), { di: 1, dj: 2 });
        }
    }

    const pairs = [];
    let pi = N, pj = M;
    while (pi > 0 || pj > 0) {
        const step = bt[pi][pj];
        if (!step) break;
        const srcIdxs = [];
        for (let k = step.di; k > 0; k--) srcIdxs.push(pi - k);
        const tgtIdxs = [];
        for (let k = step.dj; k > 0; k--) tgtIdxs.push(pj - k);
        pairs.unshift({ srcIdx: srcIdxs, tgtIdx: tgtIdxs });
        pi -= step.di;
        pj -= step.dj;
    }
    return pairs;
}

function galeChurchAlign(sourceSents, targetSents) {
    const n = sourceSents.length;
    const m = targetSents.length;

    if (n === 0 && m === 0) return [];

    const totalSrcLen = sourceSents.reduce((s, sen) => s + sen.length, 0);
    const totalTgtLen = targetSents.reduce((s, sen) => s + sen.length, 0);
    const c = totalSrcLen > 0 ? totalTgtLen / totalSrcLen : 1;
    const s2 = 7.0;

    const priors = {
        '1-1': 0.89,
        '1-0': 0.0099,
        '0-1': 0.0099,
        '2-1': 0.089,
        '1-2': 0.089
    };

    const anchors = findAnchors(sourceSents, targetSents);

    let blocks;
    if (anchors.length > 0) {
        blocks = [];
        let prevSrc = 0, prevTgt = 0;
        for (const a of anchors) {
            if (prevSrc < a.srcIdx || prevTgt < a.tgtIdx) {
                blocks.push({ srcStart: prevSrc, srcEnd: a.srcIdx, tgtStart: prevTgt, tgtEnd: a.tgtIdx, anchor: null });
            }
            blocks.push({ srcStart: a.srcIdx, srcEnd: a.srcIdx + 1, tgtStart: a.tgtIdx, tgtEnd: a.tgtIdx + 1, anchor: true });
            prevSrc = a.srcIdx + 1;
            prevTgt = a.tgtIdx + 1;
        }
        if (prevSrc < n || prevTgt < m) {
            blocks.push({ srcStart: prevSrc, srcEnd: n, tgtStart: prevTgt, tgtEnd: m, anchor: null });
        }
    } else {
        blocks = [{ srcStart: 0, srcEnd: n, tgtStart: 0, tgtEnd: m, anchor: null }];
    }

    function computeConfidence(l1, l2) {
        const delta = computeDelta(l1, l2, c, s2);
        return Math.round(Math.max(0, Math.min(100, 100 * Math.exp(-delta * delta / 8))));
    }

    const result = [];
    for (const block of blocks) {
        if (block.anchor) {
            const srcText = sourceSents[block.srcStart];
            const tgtText = targetSents[block.tgtStart];
            const conf = computeConfidence(srcText.length, tgtText.length);
            result.push({
                id: 'align-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                source: srcText,
                target: tgtText,
                confidence: conf,
                suggestion: ''
            });
            continue;
        }

        const srcBlock = sourceSents.slice(block.srcStart, block.srcEnd);
        const tgtBlock = targetSents.slice(block.tgtStart, block.tgtEnd);
        if (srcBlock.length === 0 && tgtBlock.length === 0) continue;

        const blockPairs = dpAlign(srcBlock, tgtBlock, c, s2, priors);

        for (const p of blockPairs) {
            const srcText = p.srcIdx.map(i => srcBlock[i]).join(' ').trim();
            const tgtText = p.tgtIdx.map(j => tgtBlock[j]).join(' ').trim();
            const l1 = srcText.length;
            const l2 = tgtText.length;
            const conf = computeConfidence(l1, l2);

            let suggestion = '';
            if (p.srcIdx.length > 1 && p.tgtIdx.length === 1) suggestion = 'merge-down';
            else if (p.srcIdx.length === 1 && p.tgtIdx.length > 1) suggestion = 'split-target';

            result.push({
                id: 'align-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
                source: srcText,
                target: tgtText,
                confidence: conf,
                suggestion
            });
        }
    }

    return result;
}

export function alignTexts(sourceText, targetText) {
    const sourceSentences = splitSentences(sourceText);
    const targetSentences = splitSentences(targetText);
    return galeChurchAlign(sourceSentences, targetSentences);
}

export async function extractTextFromDocx(arrayBuffer) {
    if (!window.JSZip) {
        throw new Error('JSZip library is not loaded. Make sure you are online.');
    }
    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const docXmlStr = await zip.file("word/document.xml").async("text");
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXmlStr, "text/xml");
    const paragraphs = xmlDoc.getElementsByTagName("w:p");
    let text = "";

    for (let p of paragraphs) {
        let pText = "";
        const texts = p.getElementsByTagName("w:t");
        for (let t of texts) {
            pText += t.textContent;
        }
        if (pText.trim()) {
            text += pText + "\n";
        }
    }
    return text;
}

export async function extractTextFromPptx(arrayBuffer) {
    if (!window.JSZip) {
        throw new Error('JSZip library is not loaded. Make sure you are online.');
    }
    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const slideFiles = Object.keys(zip.files).filter(name => name.startsWith("ppt/slides/slide") && name.endsWith(".xml"));

    slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^\d]/g, ""), 10);
        const numB = parseInt(b.replace(/[^\d]/g, ""), 10);
        return numA - numB;
    });

    let text = "";
    for (let slideFile of slideFiles) {
        const slideXmlStr = await zip.file(slideFile).async("text");
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(slideXmlStr, "text/xml");
        const texts = xmlDoc.getElementsByTagName("a:t");
        let slideText = "";
        for (let t of texts) {
            slideText += t.textContent + " ";
        }
        if (slideText.trim()) {
            text += slideText.trim() + "\n";
        }
    }
    return text;
}
