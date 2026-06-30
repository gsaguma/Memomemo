export function splitIntoSentences(text) {
    if (!text) return [];
    
    const paragraphs = text.split(/\r?\n/);
    let allSentences = [];
    
    const abbreviations = [
        'mr', 'mrs', 'ms', 'dr', 'prof', 'sr', 'jr',
        'eg', 'ie', 'vs', 'etc', 'vol', 'ed', 'al',
        'am', 'pm', 'st', 'ave', 'rd', 'co', 'inc'
    ];
    
    paragraphs.forEach(para => {
        const trimmedPara = para.trim();
        if (!trimmedPara) return;
        
        const rawSplits = trimmedPara.split(/([.!?]\s+)/);
        let sentences = [];
        let tempSentence = "";
        
        for (let i = 0; i < rawSplits.length; i++) {
            const part = rawSplits[i];
            if (!part) continue;
            
            if (i % 2 === 0) {
                tempSentence += part;
            } else {
                tempSentence += part;
                const words = tempSentence.trim().split(/[\s,]+/);
                const lastWord = words[words.length - 1]?.replace(/[.!?]/g, '').toLowerCase();
                
                if (abbreviations.includes(lastWord)) {
                    continue;
                } else {
                    sentences.push(tempSentence.trim());
                    tempSentence = "";
                }
            }
        }
        
        if (tempSentence.trim()) {
            sentences.push(tempSentence.trim());
        }
        
        allSentences = allSentences.concat(sentences);
    });
    
    return allSentences;
}

export function alignTexts(sourceText, targetText) {
    const sourceSentences = splitIntoSentences(sourceText);
    const targetSentences = splitIntoSentences(targetText);
    
    const maxLen = Math.max(sourceSentences.length, targetSentences.length);
    const alignedPairs = [];
    
    for (let i = 0; i < maxLen; i++) {
        alignedPairs.push({
            id: 'align-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            source: sourceSentences[i] || '',
            target: targetSentences[i] || ''
        });
    }
    
    return alignedPairs;
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
