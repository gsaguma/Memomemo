# Memo Memo — Translation Memory Toolkit

> **100% client-side browser editor for TMX, XLIFF and CSV files.** No server, no installation, no data leaves your machine.

## Features

- **Multi-format**: TMX 1.4, XLIFF (XLF/SDLXLIFF), CSV (comma/semicolon/tab)
- **Search & Edit**: Full-text + regex search, inline cell editing, source/target scope filters
- **Statistics**: Live word counts, segment counts, averages, length histogram
- **Metadata Editor**: Edit TMX header fields — author, tool, languages, dates, data type
- **TM Merger**: Combine multiple TMs into one TMX with optional deduplication
- **Alignment**: Gale-Church DP alignment of plain text, DOCX, PPTX with confidence scoring
- **Quality Check (QA)**: 20 checks — duplicates, placeholders, tags, numbers, URLs, emails, spaces, length, punctuation, capitalization, dates, unicode, consistency, terminology glossary, grammar patterns, spell check (Typo.js + Hunspell dictionaries)
- **Session Persistence**: Auto-saves to IndexedDB, restores on next visit
- **Dark mode**: Persistent toggle
- **Keyboard shortcuts**: `Alt+S` search, `PgUp/PgDn` paginate, arrows navigate, `Enter` edit, `Alt+C/T` copy source/target

## Quick start

```bash
npx serve .             # Node (no install)
python -m http.server 8080  # Python
```

Then open `http://localhost:8080`. No build step required.

## Usage

| Tab | What it does |
|---|---|
| **Search & View** | Upload a TM to browse, filter, and edit segments inline |
| **Edit Metadata** | Modify TMX header fields and export |
| **Merge TMs** | Stack multiple files, reorder, deduplicate, download merged TMX |
| **Align Translations** | Load source + target docs (txt/docx/pptx), auto-align, review, export or inject into Search |
| **QA Check** | Run 20 quality checks, review grouped results, delete offending TUs |

## Privacy

All processing happens in your browser. No data is ever uploaded to any server.

## Tech Stack

Tailwind CSS · JSZip · Native ES Modules · IndexedDB + localStorage · DOMParser · Typo.js

---

## License

Apache-2.0

---

<p align="center">Made with ♥ by <a href="https://www.linkedin.com/in/gsaguma">Gabriel Saguma</a></p>
