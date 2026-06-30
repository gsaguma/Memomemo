// Parse TMX file content
export function parseTMXContent(content) {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error("Invalid XML format");
    }
    
    const parsedData = {
        units: [],
        sourceLanguage: '',
        targetLanguage: '',
        metadata: {}
    };
    
    // Extract metadata from header
    const headerElement = xmlDoc.querySelector('header');
    parsedData.metadata = {
        creationtool: headerElement?.getAttribute('creationtool') || 'MemoMemo',
        creationtoolversion: headerElement?.getAttribute('creationtoolversion') || '1.0',
        datatype: headerElement?.getAttribute('datatype') || 'plaintext',
        segtype: headerElement?.getAttribute('segtype') || 'sentence',
        adminlang: headerElement?.getAttribute('adminlang') || 'en',
        srclang: headerElement?.getAttribute('srclang') || 'en',
        creationid: headerElement?.getAttribute('creationid') || 'Unknown',
        creationdate: headerElement?.getAttribute('creationdate') || new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    };
    
    // Extract translation units
    const tuElements = xmlDoc.getElementsByTagName('tu');
    
    // No translation units found
    if (tuElements.length === 0) {
        throw new Error("No translation units found in TMX file");
    }
    
    // Process each translation unit
    Array.from(tuElements).forEach(tu => {
        const tuvs = tu.getElementsByTagName('tuv');
        let sourceText = null;
        let targetText = null;
        let sourceLang = null;
        let targetLang = null;

        // Process each translation unit variant
        Array.from(tuvs).forEach(tuv => {
            const lang = tuv.getAttribute('xml:lang') || tuv.getAttribute('lang');
            const segElements = tuv.getElementsByTagName('seg');
            
            if (segElements.length > 0) {
                const segText = segElements[0].textContent.trim();
                
                if (sourceText === null) {
                    sourceText = segText;
                    sourceLang = lang;
                } else {
                    targetText = segText;
                    targetLang = lang;
                }
            }
        });

        // Only add if we have both source and target
        if (sourceText !== null && targetText !== null) {
            parsedData.units.push({
                source: sourceText,
                target: targetText,
                sourceLang,
                targetLang
            });
        }
    });
    
    // Set languages
    if (parsedData.units.length > 0) {
        parsedData.sourceLanguage = parsedData.units[0].sourceLang || parsedData.metadata.srclang || 'Unknown';
        parsedData.targetLanguage = parsedData.units[0].targetLang || parsedData.metadata.adminlang || 'Unknown';
    } else {
        parsedData.sourceLanguage = parsedData.metadata.srclang || 'Unknown';
        parsedData.targetLanguage = parsedData.metadata.adminlang || 'Unknown';
    }
    
    return parsedData;
}

// Parse XLIFF file content (including SDLXLIFF and Smartcat XLIFF)
export function parseXLIFFContent(content) {
    // Parse XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, "text/xml");
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
        throw new Error("Invalid XML format");
    }
    
    const parsedData = {
        units: [],
        sourceLanguage: '',
        targetLanguage: '',
        metadata: {}
    };
    
    // Get file element to extract language info
    const fileElement = xmlDoc.querySelector('file');
    if (fileElement) {
        parsedData.sourceLanguage = fileElement.getAttribute('source-language') || 'Unknown';
        parsedData.targetLanguage = fileElement.getAttribute('target-language') || 'Unknown';
    }
    
    parsedData.metadata = {
        creationtool: 'XLIFF Converter',
        creationtoolversion: '1.0',
        datatype: 'plaintext',
        segtype: 'sentence',
        adminlang: parsedData.targetLanguage || 'en',
        srclang: parsedData.sourceLanguage || 'en',
        creationid: 'MemoMemo',
        creationdate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    };
    
    // Find all translation units
    const transUnits = xmlDoc.querySelectorAll('trans-unit, unit');
    
    if (transUnits.length === 0) {
        throw new Error("No translation units found in XLIFF file");
    }
    
    // Process each translation unit
    Array.from(transUnits).forEach(unit => {
        let sourceText = null;
        let targetText = null;
        
        const sourceElement = unit.querySelector('source');
        const targetElement = unit.querySelector('target');
        
        if (sourceElement) {
            sourceText = sourceElement.textContent.trim();
        }
        
        if (targetElement) {
            targetText = targetElement.textContent.trim();
        }
        
        if (!sourceText || !targetText) {
            const segments = unit.querySelectorAll('segment');
            if (segments.length > 0) {
                Array.from(segments).forEach(segment => {
                    const source = segment.querySelector('source');
                    const target = segment.querySelector('target');
                    
                    if (source && !sourceText) {
                        sourceText = source.textContent.trim();
                    }
                    if (target && !targetText) {
                        targetText = target.textContent.trim();
                    }
                });
            }
        }
        
        if (!sourceText || !targetText) {
            const mrkElements = unit.querySelectorAll('mrk');
            if (mrkElements.length > 0) {
                Array.from(mrkElements).forEach(mrk => {
                    if (mrk.getAttribute('mtype') === 'seg') {
                        if (!sourceText) {
                            sourceText = mrk.textContent.trim();
                        } else if (!targetText) {
                            targetText = mrk.textContent.trim();
                        }
                    }
                });
            }
        }
        
        if (sourceText && targetText) {
            parsedData.units.push({
                source: sourceText,
                target: targetText,
                sourceLang: parsedData.sourceLanguage,
                targetLang: parsedData.targetLanguage
            });
        }
    });
    
    return parsedData;
}

// Helper function to split CSV row correctly handling quoted fields
export function splitCSVRow(row, delimiter = ',') {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // Add the last value
    result.push(currentValue);
    
    // Remove quotes from values
    return result.map(value => {
        if (value.startsWith('"') && value.endsWith('"')) {
            return value.slice(1, -1).replace(/""/g, '"');
        }
        return value;
    });
}

// Parse CSV file content
export function parseCSVContent(content) {
    const parsedData = {
        units: [],
        sourceLanguage: 'Source',
        targetLanguage: 'Target',
        metadata: {}
    };
    
    // Split content into lines
    const lines = content.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
        throw new Error("No content found in CSV file");
    }
    
    // Detect delimiter (comma, tab, or semicolon)
    let delimiter = ',';
    const firstLine = lines[0];
    if (firstLine.includes('\t')) {
        delimiter = '\t';
    } else if (firstLine.includes(';')) {
        delimiter = ';';
    }
    
    // Check if there's a header row
    let startIndex = 0;
    const headerRow = splitCSVRow(firstLine, delimiter);
    
    if (headerRow.length === 2) {
        parsedData.sourceLanguage = headerRow[0].trim() || 'Source';
        parsedData.targetLanguage = headerRow[1].trim() || 'Target';
        startIndex = 1;
    }
    
    parsedData.metadata = {
        creationtool: 'CSV Converter',
        creationtoolversion: '1.0',
        datatype: 'plaintext',
        segtype: 'sentence',
        adminlang: parsedData.targetLanguage || 'en',
        srclang: parsedData.sourceLanguage || 'en',
        creationid: 'MemoMemo',
        creationdate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    };
    
    // Process each line
    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i];
        const columns = splitCSVRow(line, delimiter);
        
        if (columns.length < 2) continue;
        
        const sourceText = columns[0].trim();
        const targetText = columns[1].trim();
        
        if (sourceText && targetText) {
            parsedData.units.push({
                source: sourceText,
                target: targetText,
                sourceLang: parsedData.sourceLanguage,
                targetLang: parsedData.targetLanguage
            });
        }
    }
    
    if (parsedData.units.length === 0) {
        throw new Error("No valid translation pairs found in CSV file");
    }
    
    return parsedData;
}

// Router for parsing contents based on file extensions
export function parseFileContent(name, content) {
    const fileName = name.toLowerCase();
    if (fileName.endsWith('.tmx')) {
        return parseTMXContent(content);
    } else if (fileName.endsWith('.xliff') || fileName.endsWith('.xlf') || fileName.endsWith('.sdlxliff')) {
        return parseXLIFFContent(content);
    } else if (fileName.endsWith('.csv')) {
        return parseCSVContent(content);
    } else {
        throw new Error("Unsupported file format");
    }
}

// Old interface functions wrapper for backwards compatibility
export function parseTMX(content) {
    return parseTMXContent(content);
}

export function parseXLIFF(content) {
    return parseXLIFFContent(content);
}

export function parseCSV(content) {
    return parseCSVContent(content);
}
