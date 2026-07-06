# Memo Memo — Architecture

## Module Structure

```
Memomemo/
├── index.html                  # Shell: tab nav, CDN scripts (Tailwind, JSZip, Typo.js)
└── js/
    ├── main.js                 # Orchestrator: init, event wiring, session restore
    ├── state.js                # Singleton shared state
    ├── db.js                   # IndexedDB + localStorage persistence
    ├── ui.js                   # DOM element registry (Proxy) + render helpers
    ├── shared.js               # switchTab, debounce, savePreferences, formatTmxDate
    ├── parsers.js              # TMX / XLIFF / CSV parsers
    ├── exporter.js             # TMX 1.4 XML builder
    ├── aligner.js              # Gale-Church DP alignment, Intl.Segmenter splitting
    ├── searchController.js     # Search tab logic
    ├── mergeController.js      # Merge tab logic
    ├── metaController.js       # Metadata tab logic
    ├── alignController.js      # Alignment tab logic
    ├── qaController.js         # QA tab controller
    ├── qaEngine.js             # QA rule runner
    ├── components/
    │   ├── searchTab.js        # Search tab template
    │   ├── metaTab.js          # Metadata tab template
    │   ├── mergeTab.js         # Merge tab template
    │   ├── alignTab.js         # Alignment tab template
    │   └── qaTab.js            # QA tab template
    └── rules/
        ├── index.js            # Re-exports all rules
        ├── duplicates.js       # Duplicate detection
        ├── structure.js        # Empty segments
        ├── quality.js          # Source=target, symbols/numeric only
        ├── placeholders.js     # %s, {0}, {{var}} mismatches
        ├── tags.js             # HTML/XML tag mismatches
        ├── numbers.js          # Numeric value mismatches
        ├── urls.js             # URL mismatches
        ├── emails.js           # Email mismatches
        ├── spaces.js           # Whitespace issues
        ├── length.js           # Length ratio anomalies
        ├── punctuation.js      # End punct, bracket/quote balance
        ├── capitalization.js   # First-word & acronym caps
        ├── dates.js            # Date format mismatches
        ├── unicode.js          # Control/zero-width/bidi chars
        ├── specialChars.js     # Repeated chars, math symbols
        ├── patterns.js         # Data leakage detection
        ├── consistency.js      # Same source, different target
        ├── terminology.js      # Glossary validation
        ├── grammar.js          # Language pattern checks
        ├── spelling.js         # Hunspell spell check (Typo.js)
        └── patterns/
            ├── es.js           # Spanish grammar patterns
            └── en.js           # English grammar patterns
```

## Data Flow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#FFFFFF', 'primaryBorderColor': '#93C5FD', 'primaryTextColor': '#1F2937', 'lineColor': '#93C5FD', 'secondaryColor': '#F0F9FF', 'tertiaryColor': '#F0F9FF', 'background': '#F0F9FF', 'nodeBorder': '#93C5FD', 'clusterBkg': '#F0F9FF', 'clusterBorder': '#93C5FD', 'edgeLabelBackground': '#F0F9FF', 'fontFamily': 'Inter, sans-serif'}}}%%

flowchart TD
    subgraph INPUT["📂 File Input Layer"]
        A1["🖱️ File Picker (click or drag & drop)"]
        A2["📄 TMX · XLIFF · XLF · SDLXLIFF · CSV"]
        A1 --> A2
    end

    subgraph VALIDATION["🔍 Validation & Pre-check"]
        B1["Extension whitelist"] --> B2["Size guard (≤20 MB)"] --> B3["XML pre-validation (DOMParser)"]
        B2 --> B4["CSV delimiter detection"]
    end

    subgraph PARSERS["⚙️ parsers.js — Format Parsers"]
        C4["parseFileContent()"] --> C1["parseTMXContent()"]
        C4 --> C2["parseXLIFFContent()"]
        C4 --> C3["parseCSVContent()"]
    end

    subgraph STATE["🧠 state.js — Shared State"]
        S1["tmxData { units[], sourceLanguage, targetLanguage, metadata }"]
        S2["filteredUnits[]"]
        S3["mergeFiles[]"]
        S4["alignedPairs[]"]
        S5["qaIssues[], qaActiveRules"]
    end

    subgraph PERSIST["💾 db.js — Persistence"]
        D1["IndexedDB: tmxData, mergeFiles, metaEditorData, alignedPairs"]
        D2["localStorage: prefs, filters, qaRuleToggles, glossary"]
    end

    subgraph TABS["🖥️ Tab UI"]
        TAB_SEARCH["🔎 Search & View"]
        TAB_META["✏️ Edit Metadata"]
        TAB_MERGE["🔀 Merge TMs"]
        TAB_ALIGN["⚖️ Align Translations"]
        TAB_QA["✅ QA Check"]
    end

    subgraph QA_ENGINE["🧪 QA Engine"]
        R1["qaEngine.js → runChecks()"]
        R2["20 rule modules in js/rules/"]
        R1 --> R2
    end

    subgraph EXPORT["📤 exporter.js"]
        E1["generateTMXXML() → TMX 1.4"]
    end

    A2 -->|FileReader.readAsText()| VALIDATION
    VALIDATION --> PARSERS
    PARSERS --> STATE
    STATE <--> PERSIST
    STATE --> TABS
    TABS --> TAB_QA --> QA_ENGINE --> STATE
    TABS -->|"Download"| EXPORT
```

## Key Design Decisions

- **Zero-build**: No npm, no bundler. All ES modules loaded natively.
- **Vanilla JS**: No framework — just Tailwind CSS for styling.
- **CDN-only**: Tailwind, JSZip, Typo.js loaded from CDN.
- **IndexedDB for data**: Heavy TM data persisted in IndexedDB; preferences in localStorage.
- **Proxy-based DOM cache**: `els` object in `ui.js` lazily caches `getElementById` results.
- **No circular imports**: Controllers import from `shared.js`, never from `main.js` or each other.
- **Gale-Church alignment**: DP algorithm with character-length normal distribution model. Supports 1:1, 1:0, 0:1, 2:1, 1:2 alignments with anchor points.
- **Modular QA rules**: Each check is an independent module with `{ meta, check() }` signature, easily extensible.
- **Lazy loading**: Typo.js library and Hunspell dictionaries loaded on first spell check run, not at app init.
