export function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// Helper to generate TMX XML string from units and metadata
export function generateTMXXML(units, metadata) {
    const creationDate = metadata.creationdate || new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const creationId = metadata.creationid || 'MemoMemo';
    const creationTool = metadata.creationtool || 'MemoMemo';
    const creationToolVersion = metadata.creationtoolversion || '1.0';
    const datatype = metadata.datatype || 'plaintext';
    const segtype = metadata.segtype || 'sentence';
    const adminlang = metadata.adminlang || 'en';
    const srclang = metadata.srclang || 'en';
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<!DOCTYPE tmx SYSTEM "tmx14.dtd">\n`;
    xml += `<tmx version="1.4">\n`;
    xml += `  <header creationtool="${escapeXml(creationTool)}" creationtoolversion="${escapeXml(creationToolVersion)}" segtype="${escapeXml(segtype)}" o-tmf="UTF-8" adminlang="${escapeXml(adminlang)}" srclang="${escapeXml(srclang)}" datatype="${escapeXml(datatype)}" creationdate="${escapeXml(creationDate)}" creationid="${escapeXml(creationId)}">\n`;
    xml += `  </header>\n`;
    xml += `  <body>\n`;
    
    units.forEach(unit => {
        const srcLang = unit.sourceLang || srclang;
        xml += `    <tu>\n`;
        xml += `      <tuv xml:lang="${escapeXml(srcLang)}">\n`;
        xml += `        <seg>${escapeXml(unit.source)}</seg>\n`;
        xml += `      </tuv>\n`;
        if (unit.targets && unit.targets.length > 0) {
            unit.targets.forEach(t => {
                const tl = t.lang || adminlang;
                xml += `      <tuv xml:lang="${escapeXml(tl)}">\n`;
                xml += `        <seg>${escapeXml(t.text)}</seg>\n`;
                xml += `      </tuv>\n`;
            });
        } else {
            const tgtLang = unit.targetLang || adminlang;
            xml += `      <tuv xml:lang="${escapeXml(tgtLang)}">\n`;
            xml += `        <seg>${escapeXml(unit.target)}</seg>\n`;
            xml += `      </tuv>\n`;
        }
        xml += `    </tu>\n`;
    });
    
    xml += `  </body>\n`;
    xml += `</tmx>\n`;
    return xml;
}
