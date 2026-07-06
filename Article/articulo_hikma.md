# 1. Introduction

The translation industry has undergone a profound technological transformation over the past two decades. Computer-assisted translation (CAT) tools, translation memory (TM) systems, and machine translation engines have become standard components of the professional translator's workstation (Rico & González-Pastor, 2022; González Pastor, 2022). Consequently, translator training programmes face the challenge of equipping students with the technological competencies demanded by an increasingly automated and data-driven labour market.

However, a persistent gap exists between the technological resources available in academic settings and those used in professional practice. Commercial CAT tools — the industry standard in most language service providers — carry substantial licensing costs that place them out of reach for many students and institutions, particularly in the Global South and in public universities with limited budgets (Sánchez-Castany, 2025). Time-limited trial versions, while useful for short-term familiarisation, expire before the end of an academic term and cannot support sustained, project-based learning across a full curriculum. Furthermore, installing and maintaining proprietary software in computer labs requires IT support that is not always available, and licence management across multiple student devices compounds the administrative burden.

Students who seek free alternatives encounter a fragmented landscape. Some tools offer limited functionality that covers only a fraction of a professional workflow. Others have migrated from free to paid models, disrupting course plans that depended on them. Open-source CAT tools do exist — most notably OmegaT — but they require local installation and Java runtime, which can introduce compatibility issues and friction in the first-day classroom experience. The net result is that both students and instructors face technical barriers that hinder hands-on, experiential learning with authentic translation technologies (Díaz Fouces, 2019).

Beyond the cost and access problem, there is a pedagogical concern regarding how translation technologies are taught. Many programmes rely on demonstrations and walkthroughs rather than sustained, hands-on manipulation of TM data structures. Students may learn to click through a tool's interface without developing a deeper understanding of the underlying formats — TMX, XLIFF — that govern data exchange in the language industry. As Zappatore (2024) argues, CAT course design should prioritise collaborative, active learning strategies that mirror real-world workflows and allow students to explore, experiment, and make mistakes in a low-stakes environment.

This article presents a didactic proposal centred on Memo Memo, a free, open-source, browser-based translation memory editor licensed under the GNU General Public License v3.0. Memo Memo is designed to operate entirely on the client side: no installation, no server, no data transmission. Users open a web page, load a TM file, and begin working immediately. The tool supports TMX 1.4, XLIFF (including XLF and SDLXLIFF), and CSV formats, and provides features for searching, editing, merging, deduplicating, and aligning bilingual assets.

The article is structured as follows. Section 2 reviews the theoretical framework on translation technology pedagogy, open-source software in translator training, and data privacy as a pedagogical concern. Section 3 describes Memo Memo's architecture and key features. Section 4 presents three concrete didactic activities designed for technical translation courses, each linked to specific learning objectives and EMT competence areas. Section 5 discusses the tool's limitations and strategies for curricular integration. Section 6 concludes with directions for future development.

# 2. Theoretical framework

## 2.1 Translation technologies in the classroom

The integration of translation technologies into translator training curricula has been a topic of sustained scholarly attention. The European Master's in Translation (EMT) competence framework identifies technological competence as one of five core areas, encompassing the ability to use CAT tools, machine translation, terminology management systems, and quality assurance software (EMT Board, 2022). Similarly, the PACTE group's model of translation competence includes instrumental competence as a key subcompetence (PACTE, 2003). Despite this consensus at the curricular level, implementation varies widely across programmes.

Sánchez-Castany (2025) conducted a comprehensive study of translator training programmes in Spain and identified several structural barriers to effective technology integration. These include insufficient computer lab availability, lack of funding for software licences, and a curriculum that often lags behind industry developments. The author notes that open-source tools can partially address the funding gap, but their adoption in the classroom remains limited due to perceived usability issues and a lack of pedagogical materials tailored to them.

Rico and González-Pastor (2022) examined translator educators' beliefs about machine translation in the classroom and found a tension between the need to prepare students for an MT-augmented workplace and concerns about over-reliance on automation. This tension extends to CAT tools more broadly: instructors must balance procedural training (learning to operate specific software) with conceptual understanding (learning the underlying data models and standards).

Díaz Fouces (2019) offers a critical perspective on the role of technology in translation studies, arguing that technological competence should not be reduced to operational proficiency with commercial software. Instead, he advocates for a reflective approach in which students understand the implications of the tools they use — including issues of data ownership, vendor lock-in, and the political economy of translation technology.

## 2.2 Open-source software in translator training

The pedagogical case for open-source software in education rests on several pillars. Sánchez-Castany (2025) identifies accessibility, transparency, and adaptability as key advantages of open-source tools in translator training environments. Open-source tools allow students and instructors to inspect, modify, and redistribute the software, fostering a deeper understanding of how translation technologies work at a structural level. This aligns with constructionist approaches to learning, in which understanding emerges from active manipulation and creation (Papert, 1980).

However, open-source adoption in translator training has been modest. The most widely known open-source CAT tool, OmegaT, has been available since 2000 and is used in some university programmes, but it remains a niche choice compared to industry-dominant commercial tools. Several factors contribute to this: the perception that open-source tools lack polish or professional-level support, the absence of open-source tools from industry certification pathways, and the fact that most translation textbooks and course materials assume the use of commercial software. Sánchez-Castany (2025) adds that even when instructors are willing to adopt open-source tools, a lack of ready-made pedagogical materials and lesson plans tailored to them creates an additional barrier to entry.

More recently, browser-based architectures have opened new possibilities for friction-free deployment of open-source tools. Unlike desktop applications that require installation, browser-based tools work on any device with a modern web browser — including Chromebooks, tablets, and shared lab computers — and require no administrative privileges to run. This eliminates the most common technical barrier that students face on the first day of a technology module. The browser-as-platform model also simplifies version management: instructors always know that all students are running the same version, and updates are immediate and transparent. Zappatore (2024) highlights this as a particular advantage for distance learning and blended programmes, where students may be using a wide range of personal devices without standardised configurations.

Zappatore (2024) presents a multi-framework course design methodology for computer-assisted scientific translation that explicitly incorporates collaborative and active learning strategies and advocates for the use of open-source tools to avoid vendor lock-in. The author argues that exposing students to open-source alternatives alongside commercial tools develops a more critical and adaptable technological competence — one that is not tied to the affordances and constraints of any single vendor's ecosystem.

## 2.3 Data privacy as a pedagogical concern

An underexplored dimension of translation technology pedagogy is data privacy. Commercial CAT tools and translation management systems typically operate on a cloud-based model: files are uploaded to the vendor's servers for processing, storage, or collaboration. While this enables features such as real-time team translation and automatic backup, it also means that students' translation data — including drafts, errors, and incomplete work — resides on third-party infrastructure.

For educational institutions, this raises several concerns. Student data may be subject to different privacy regimes depending on where the vendor's servers are located. Institutional data protection policies may restrict the use of cloud services that process data outside the jurisdiction. Furthermore, the pedagogical principle of allowing students to learn by making mistakes sits uneasily with a model in which every intermediate draft is stored on a corporate server.

The European Union's General Data Protection Regulation (GDPR) has heightened awareness of these issues, and an increasing number of universities now require instructors to audit the data processing practices of any third-party tool used in teaching. Tools that process data entirely on the client side — where no file content ever leaves the user's machine — offer a straightforward solution to compliance concerns while also modelling principled data stewardship for future translation professionals.

González Pastor (2022) notes that the automation of translation workflows raises ethical questions about data ownership and the use of translated content to train machine translation systems. When students work with proprietary tools, their translations may be incorporated into training datasets without their knowledge or consent. Client-side tools eliminate this risk by design, making them particularly suitable for classroom use where confidentiality cannot be guaranteed by contractual agreements.

## 2.4 The translator training landscape in Latin America

The challenges identified above are especially acute in the Latin American context, where translator training programmes operate under structural conditions that differ considerably from those in Europe and North America. Public universities in the region contend with chronic underfunding, and the cost of commercial CAT tool licences — often priced in dollars at European or North American rates — can be prohibitive when multiplied across computer labs serving dozens or hundreds of students (Sánchez-Castany, 2025). Programme coordinators may limit CAT tool instruction to a single semester or rely entirely on demonstrations because fully equipped labs are unavailable.

Internet connectivity, while improving, remains uneven. Students in peri-urban and rural areas may lack the broadband speeds required for cloud-based tools, making client-side, offline-capable applications particularly valuable. Memo Memo, requiring only an initial page load (or a local copy of the HTML file), can function entirely offline once loaded — a significant advantage in connectivity-constrained settings.

Furthermore, the language pairs taught in Latin American programmes (Spanish–English, Spanish–Portuguese, and increasingly Spanish–indigenous language pairs such as Quechua and Aymara) are often underrepresented in commercial TM repositories and online resources. Students cannot rely on large, pre-built TMs for these combinations and must instead learn to build and curate their own resources from parallel texts. This makes alignment skills and TM management particularly relevant competencies in the region.

Finally, professional accreditation pathways in Latin America do not typically require certification in specific CAT tools, reducing the curricular pressure to train students on any particular software package. Programmes have more flexibility to experiment with open-source and browser-based tools, as long as the underlying technological competencies — format literacy, data management, quality assessment — are adequately covered. This opens the door for tools like Memo Memo to serve as a core pedagogical platform rather than merely a supplementary resource.

# 3. Memo Memo

Memo Memo is a free, open-source, browser-based translation memory editor developed for educational use and distributed under the GNU General Public License v3.0. Unlike conventional CAT tools that require installation, user registration, or server connectivity, Memo Memo consists of a single HTML file that loads into any modern web browser. All processing occurs on the client side using the user's own CPU and memory; no file content is ever transmitted to an external server. This architecture was deliberately chosen to minimise friction in the classroom: students open the tool and begin working without any setup, account creation, or institutional IT support.

## 3.1 Architecture

Memo Memo is built as a static single-page application. The core application logic is written in JavaScript (ECMAScript modules) and runs entirely in the browser's main thread. The tool uses IndexedDB — a low-level API built into all modern browsers — for local persistence. When a user loads a TM file into Memo Memo, the file is parsed in memory and its contents are stored in an IndexedDB database that is scoped to the browser origin. No data is written to the host file system except through the user's explicit action of downloading an exported file.

The source code is organised into several modules, each with a distinct responsibility:

- **`state.js`**: Maintains the application state as a singleton mutable object, tracking session data, current filters, pagination, and UI mode.
- **`db.js`**: Manages all IndexedDB operations, including storing and retrieving translation units, merging TM sources, and deduplication.
- **`parsers.js`**: Implements parsers for TMX 1.4, XLIFF (including XLF and SDLXLIFF), and CSV. Each parser validates the input format before processing and returns a normalised internal representation.
- **`exporter.js`**: Builds well-formed TMX 1.4 XML output from the internal representation, using a DOM-based approach to ensure valid XML structure.
- **`aligner.js`**: Provides a simple index-based sentence alignment algorithm for creating TMs from parallel texts (source and target in plain text format).
- **`ui.js`**: Defines a registry of DOM element getters (`els.*`) that map to specific element IDs in the HTML, enabling decoupled access to UI components.
- **`main.js`**: Serves as the orchestration layer, wiring user events to application logic and managing session lifecycle, including auto-save to IndexedDB on every edit.
- **`components/*.js`**: Each tab (Search, TM Manager, Aligner, Editor, About) is rendered by a corresponding component module that injects HTML into a container element. This modular approach allows the interface to be reorganised without changing the underlying logic.

Communication between modules follows a simple event-driven pattern: `main.js` listens for user interactions and calls the relevant module functions, which in turn update the state and trigger UI re-renders through `ui.js`.

The user interface is organised into five tabs, each corresponding to a distinct workflow stage: Search, TM Manager, Aligner, Editor, and About. The tab-based layout keeps cognitive load low — students focus on one task at a time — while the About tab provides built-in documentation, keyboard shortcut reference, and version information.

### 3.1.1 Comparison with other free CAT tools

Memo Memo occupies a specific niche within the landscape of free and open-source CAT tools. Unlike full-featured desktop applications such as OmegaT (Java-based, with full translation editor, glossary, and MT support) or Okapi Framework (a comprehensive set of modular components for pipeline-based processing), Memo Memo focuses on a narrower set of TM operations: loading, inspecting, editing, merging, aligning, and exporting TM data. It does not attempt to replicate a complete translation workstation.

This narrow focus is deliberate. The tool's primary pedagogical purpose is to make TM data structures visible and manipulable. Where OmegaT presents a translation editing interface that abstracts away the underlying TMX structure, Memo Memo foregrounds it. A student using Memo Memo interacts directly with TUs, sees how metadata attaches to segments, and observes the effects of merging and deduplication on the TM as a data structure rather than as a black-box repository.

Other web-based tools exist — for instance, Wordfast Anywhere offers a free browser-based CAT environment — but these are cloud-based, requiring data upload to external servers. Memo Memo's client-side architecture is unique among free TM editors in combining browser-based delivery with zero data transmission. To the best of the authors' knowledge, no other freely available tool occupies this exact combination of features: browser-based, client-side processing, TMX/XLIFF support, and TM-specific operations with session persistence.

## 3.2 Data model

Memo Memo operates on a translation unit (TU) as the fundamental data entity. Each TU contains a source segment, a target segment, and optional metadata: a creation date, a change date, a creation tool identifier, and an optional note field. This structure maps directly to the TMX 1.4 `<tu>` and `<tuv>` elements, as well as to XLIFF `<trans-unit>` elements.

When a user loads a file, the parser extracts TUs and stores them in IndexedDB as objects in an object store. The database schema is straightforward: a single object store with an automatically generated key. No relational joins or indexes are used, keeping the schema simple enough for students to inspect and understand.

The in-memory state holds a copy of the currently active TUs along with filtering and pagination parameters. When the user edits a segment, the change is persisted to IndexedDB synchronously through `db.js`, and the interface updates immediately. This auto-save behaviour means that accidental page refreshes do not result in data loss — a practical concern in classroom settings where network interruptions or browser crashes can occur.

## 3.3 Core features

### 3.3.1 TM file loading and export

Memo Memo accepts TMX 1.4 (.tmx), XLIFF (.xlf, .xliff, .sdlxliff), and CSV (.csv) files. The CSV parser expects a header row with, at minimum, "source" and "target" columns. The TMX parser validates XML well-formedness before parsing. Files larger than 20 MB are rejected with a clear message. Once loaded, the user can search, filter, and edit the TUs. The export function produces a TMX 1.4 file that conforms to the standard, including the required XML declaration, DOCTYPE, and namespace attributes.

### 3.3.2 Search and filtering

The Search tab provides a real-time search interface. Users can enter a query, select the field to search (source or target), and choose a match mode (exact, starts-with, ends-with, contains, or regex). Search results are paginated (configurable page size, defaulting to 50 rows). Within the results, individual TUs can be copied (source, target, or both) and edited in place. The search is case-insensitive by default.

Keyboard shortcuts are available: Alt+S focuses the search input, PgUp/PgDown paginate through results, arrow keys navigate rows, Enter begins editing a cell, and Alt+C and Alt+T copy the source and target of the selected row respectively.

### 3.3.3 TM Manager

The TM Manager tab handles multi-source TM loading. Users can load several TM files and assign a colour to each source. When TUs from different sources share the same source text, the user can choose which translation to keep. This is particularly useful for comparing how different translators or different MT engines handled the same source text — a common exercise in translation quality assessment modules.

### 3.3.4 Alignment

The Aligner tab implements a straightforward index-based sentence alignment algorithm. The user pastes or loads a source text and a target text (split into sentence-per-line segments), and the aligner pairs segments by position. This is deliberately not an ML-based aligner; it assumes the segments are presented line by line in matching order. The pedagogical value lies not in the sophistication of the algorithm but in exposing students to the alignment concept: bilingual parallel texts can be turned into structured TM data that a CAT tool can consume. The aligned output can be previewed and exported as TMX.

### 3.3.5 TM merging and deduplication

Memo Memo can merge up to three TM sources into a single TMX output. During merging, the user specifies a priority order and whether to keep or discard duplicate source entries. Deduplication can be performed on the combined set as a post-processing step. This mirrors real-world workflows in which a translator may need to combine several legacy TMs into a single curated resource.

### 3.3.6 Session persistence

Every edit, whether in the Search tab or in the TM Manager, triggers an auto-save to IndexedDB. When the page loads, Memo Memo checks IndexedDB for a saved session and offers to restore it. The saving mechanism also includes data up to file import time, so even if the browser crashes mid-session, the state up to the most recent edit is preserved.

# 4. Didactic activities

This section presents three didactic activities designed for a technical translation course at the Master's level. The activities are intended to be integrated into a translation technologies module (typically 4–6 ECTS) and correspond to different stages of TM literacy: exploration, construction, and quality management. Each activity includes learning objectives, a step-by-step workflow, and alignment with EMT competence areas (EMT Board, 2022).

## 4.1 Activity 1: TM format exploration and data literacy

**Learning objectives**: By the end of this activity, students will be able to (a) identify the structure of a TMX file, (b) distinguish between TM-level, TU-level, and TUV-level metadata, (c) use Memo Memo to inspect and search a TM, and (d) export a TMX file and validate its well-formedness.

**Workflow**:
1. The instructor provides a sample TMX file (approximately 500 TUs) from an openly available corpus such as the OPUS collection. The file should contain varied metadata (creation dates, notes, different creation tool identifiers).
2. Students open the file in a text editor to view the raw XML structure. They identify the `<tmx>`, `<header>`, `<tu>`, and `<tuv>` elements and note the attributes on each.
3. Students load the file in Memo Memo and verify that the metadata displayed in the interface corresponds to what they saw in the raw XML.
4. Using the Search tab, students find TUs that match certain criteria (e.g., TUs containing a specific term, or TUs created after a certain date) and observe the source/target pairs.
5. Students export the file as TMX, then open the exported file in a text editor alongside the original. They compare the two XML representations and note any differences in formatting or structure.
6. As a debrief exercise, students discuss what kinds of information are preserved (and what is lost) when TM data moves between tools and formats.

**EMT competences**: Technological (use and manage TMX format, understand data interoperability), Linguistic (examine source-target correspondences), and Personal and Interpersonal (collaborative exploration and discussion).

**Assessment**: Students submit a brief written report (500 words) describing the TMX structure they observed and the differences between the original and exported files.

## 4.2 Activity 2: Parallel text alignment and TM creation

**Learning objectives**: By the end of this activity, students will be able to (a) prepare parallel texts for alignment, (b) use Memo Memo's aligner to create a bilingual TM from parallel texts, (c) clean and validate the resulting alignment, and (d) export the aligned data as a reusable TMX file.

**Workflow**:
1. The instructor selects a short source text (e.g., a technical manual, a product specification sheet, or an EU legislative text) and prepares a published translation in the target language. The texts should be 300–500 words each.
2. Students segment the source and target texts into individual sentences (or sense units) in a text editor. The instructor provides guidelines for segmenting: aim for one sentence per line, avoid segments longer than 40 words, and ensure that the source and target have the same number of segments.
3. Students paste the segmented source and target texts into Memo Memo's Aligner tab. The tool pairs segments by position and displays a preview.
4. Students review the alignment and move any misaligned pairs (introductory text that appears in one language but not the other, list items that were reordered, etc.).
5. Once satisfied, students export the alignment as TMX.
6. Students load the generated TMX into the Search tab to verify that the alignment produced well-formed TUs. They make any necessary edits.
7. The instructor distributes a second, slightly more complex text pair (e.g., one with footnotes, formatting markers, or missing segments) and students repeat the process. The debrief focuses on the limitations of sentence-based alignment and the strategies translators use to handle imperfect TM matches.

**EMT competences**: Technological (alignment, TM creation), Translation Provision (source text analysis, parallel text handling), and Technological (data cleaning).

**Assessment**: Students submit the two generated TMX files along with a short reflection (300 words) on the challenges of alignment and the situations in which automatic alignment works well or poorly.

## 4.3 Activity 3: TM merging, deduplication, and quality management

**Learning objectives**: By the end of this activity, students will be able to (a) evaluate the quality of TUs from different sources, (b) use priority-based merging to resolve conflicts, (c) deduplicate a merged TM, and (d) identify and correct problematic entries.

**Workflow**:
1. The instructor prepares three TMX files derived from the same source text but with different target translations: one from a professional translator, one from a student translator, and one from a machine translation engine. The files are designed so that some source segments appear in all three (with variant translations) and some appear only in one or two.
2. Students load each file individually in Memo Memo and explore the TUs using the Search tab. They note the differences in translation choices and the metadata (which allows identifying the source of each).
3. In the TM Manager tab, students load the three files with assigned colours and priorities. They configure the merge to keep the professional translation as the first priority, the student translation as the second, and the MT output as the third.
4. After merging, students review the combined TM and identify TUs where the lower-priority translation was used (i.e., where the higher-priority source did not provide a match). They assess whether these entries are acceptable or need revision.
5. Students run the deduplication step with the "keep first" strategy and note how many duplicates were removed.
6. Students export the merged, deduplicated TM as TMX and load it back into the Search tab for a final review. They make any necessary edits to individual TUs.
7. In the debrief, students discuss the decision-making process in TM quality management: When is it acceptable to keep a lower-priority translation? How can one detect and correct systematic errors in a TM? What metadata should be preserved or stripped?

**EMT competences**: Technological (TM management, merge, deduplication), Translation Provision (quality assessment), and Technological (data stewardship).

**Assessment**: Students submit the merged TMX file and a quality assessment report (500 words) describing the merge decisions, the number of duplicates removed, and any corrections made.

## 4.4 Sequencing and time allocation

The three activities are designed to be delivered over a four-week module within a translation technologies course, with the following suggested time allocation:

| Activity | Weeks | Contact hours | Independent work |
|----------|-------|---------------|------------------|
| Activity 1: TM format exploration | 1 | 2 | 2 |
| Activity 2: Parallel text alignment | 2 | 4 | 4 |
| Activity 3: TM merging and quality | 1 | 2 | 4 |

Activity 1 should precede the others, as it introduces the foundational concept of TM data structures. Activities 2 and 3 can be swapped in order depending on the instructor's emphasis.

# 5. Discussion

## 5.1 Pedagogical affordances of browser-based tools

The three activities described above leverage the core affordances of browser-based open-source tools: zero installation, client-side processing, and transparent data structures. These affordances translate into tangible pedagogical benefits.

First, the elimination of installation removes the most common first-day barrier in technology courses. Students arrive, open a URL (or a local HTML file), and begin working. This is especially valuable in programmes where students use personal devices with varying operating systems and configurations. The instructor does not need to allocate time to troubleshooting installation issues, and the activity can proceed even if a student joins the class late or misses the first session.

Second, client-side processing addresses data privacy concerns. Instructor-provided sample files — or students' own translations — remain on the student's machine. This simplifies institutional compliance with data protection regulations and allows the instructor to use authentic materials (e.g., published translations with copyright restrictions) without worrying about where the content is stored.

Third, Memo Memo's simple data model makes the structure of TM data visible. Students can see exactly how a TU is represented, how metadata attaches to segments, and how the XML format encodes bilingual correspondences. This transparency supports the learning objective of moving beyond button-clicking to conceptual understanding.

## 5.2 Limitations

Memo Memo is not designed to replace a full-featured CAT tool in a professional workflow. Several limitations should be acknowledged.

**No integrated machine translation**: Memo Memo does not connect to MT engines. Students must import MT output as part of a TM file if they want to work with it. This is by design — the tool focuses on TM data literacy — but it means that Memo Memo cannot serve as a comprehensive workstation simulation.

**No terminology management**: The tool does not include a terminology database or a recognition feature. Terminology management must be handled through separate tools or through the note field within TUs.

**No quality assurance**: Memo Memo does not perform QA checks (segment length, tag verification, number consistency, etc.). Instructors who want to teach QA workflows need to supplement with dedicated QA tools.

**Index-based alignment**: The alignment algorithm assumes matching sentence order. This works well for many technical and legal texts but fails for texts where the translator has significantly restructured the content. Instructors should prepare texts that either suit this approach or use the limitation as a teaching point about when manual alignment is necessary.

**Scalability**: Because all processing happens in the browser's main thread, very large TM files (hundreds of thousands of TUs) can cause noticeable performance degradation. The 20 MB file size limit mitigates this, but instructors working with large corpora should plan accordingly.

**No collaborative features**: Memo Memo is a single-user tool. There is no real-time collaboration, no server-side project management, and no version control. Collaborative workflows must be taught using other tools or simulated through file exchange and manual merging.

## 5.3 Curricular integration strategies

Memo Memo is best used not as a replacement for a commercial CAT tool but as a complementary resource within a broader translation technologies curriculum. The following strategies are proposed for effective integration.

**Bootstrapping**: Use Memo Memo in the first two weeks of a CAT course to establish TM data literacy before introducing a full-featured commercial tool. Students who understand the underlying data model learn the commercial tool more quickly and with greater depth.

**Bridge course**: For students who enter a programme without prior CAT experience, Memo Memo can serve as a zero-barrier pre-course resource. A self-paced tutorial using Activities 1 and 2 can be assigned as preparatory work.

**Quality assessment module**: Activity 3 can be integrated into a translation quality assessment course, where the TM merge becomes a vehicle for discussing translation quality criteria and the operationalisation of quality in TM workflows.

**Research tool**: For students conducting translation studies research that involves TM analysis (e.g., comparing translator behaviour, analysing MT output patterns), Memo Memo provides a free and open platform for browsing and filtering TM data without the constraints of a proprietary tool.

# 6. Conclusion

This article has presented Memo Memo, a free, open-source, browser-based translation memory editor, as a pedagogical tool for translator training. Memo Memo addresses three persistent challenges in translation technology education: the high cost of commercial CAT tool licences, the technical friction of installing and maintaining desktop software, and the data privacy concerns associated with cloud-based tools.

The three didactic activities described — TM format exploration, parallel text alignment, and TM merging with quality assessment — demonstrate how Memo Memo can support a progression from basic data literacy to higher-order decision-making about TM quality. Each activity is grounded in the EMT competence framework and designed to be deliverable within existing translation technologies modules.

Memo Memo is not presented as a replacement for professional CAT tools but as a complementary resource that fills a gap in the current pedagogical landscape. Its zero-install, client-side architecture removes the most common barriers to hands-on TM work, while its transparent data model supports deeper understanding of TM standards and data structures.

Several directions for future development and research can be identified. On the technical side, adding WebAssembly-based QA checks and a lightweight terminology recognition feature would expand the tool's utility without sacrificing the client-side principle. On the pedagogical side, empirical studies comparing learning outcomes between students who use Memo Memo as a preparatory tool and those who proceed directly to commercial CAT software would provide valuable evidence for curriculum designers. Finally, the development of a collaborative version — or of interoperability bridges between Memo Memo and existing collaborative platforms — would open new possibilities for team-based learning scenarios.

In an educational landscape where budget constraints are increasing and where data privacy regulations are tightening, tools like Memo Memo offer a viable path toward accessible, principled, and pedagogically sound translation technology instruction.

---

# Article metadata

**Title**: Memo Memo: A Browser-Based Open-Source Translation Memory Editor for Translator Training

**Title (Spanish)**: Memo Memo: un editor de memorias de traducción gratuito y de código abierto para la formación de traductores

**Abstract**: This article presents Memo Memo, a free, open-source, browser-based translation memory (TM) editor, and proposes its integration into translator training curricula. Memo Memo operates entirely on the client side — no installation, no server, no data transmission — addressing three persistent challenges in translation technology education: software licensing costs, technical setup barriers, and data privacy concerns. The tool supports TMX 1.4, XLIFF, and CSV formats and provides features for searching, editing, merging, deduplicating, and aligning bilingual assets. Following a review of the theoretical literature on translation technology pedagogy, open-source software in translator training, and data privacy as a pedagogical concern, three didactic activities are presented: TM format exploration and data literacy, parallel text alignment and TM creation, and TM merging with quality assessment. Each activity is aligned with the European Master's in Translation (EMT) competence framework and includes step-by-step workflows, learning objectives, and assessment guidelines. The article discusses the pedagogical affordances and limitations of browser-based tools and proposes strategies for integrating Memo Memo as a complementary resource within broader translation technology programmes.

**Keywords**: translation memory; CAT tools; open-source software; translator training; didactic proposal

**Resumen**: Este artículo presenta Memo Memo, un editor de memorias de traducción gratuito, de código abierto y basado en navegador, y propone su integración en los planes de estudio de formación de traductores. Memo Memo funciona completamente del lado del cliente — sin instalación, sin servidor, sin transmisión de datos — abordando tres desafíos persistentes en la enseñanza de tecnologías de la traducción: el coste de las licencias de software, las barreras técnicas de instalación y las preocupaciones sobre la privacidad de datos. La herramienta admite los formatos TMX 1.4, XLIFF y CSV y ofrece funciones para buscar, editar, fusionar, deduplicar y alinear recursos bilingües. Tras una revisión de la literatura teórica sobre pedagogía de las tecnologías de la traducción, el software de código abierto en la formación de traductores y la privacidad de datos como preocupación pedagógica, se presentan tres actividades didácticas: exploración de formatos de MT y alfabetización de datos, alineación de textos paralelos y creación de MT, y fusión de MT con evaluación de calidad. Cada actividad se alinea con el marco de competencias del Máster Europeo en Traducción (EMT) e incluye flujos de trabajo detallados, objetivos de aprendizaje y pautas de evaluación. El artículo discute las ventajas y limitaciones pedagógicas de las herramientas basadas en navegador y propone estrategias para integrar Memo Memo como recurso complementario dentro de programas amplios de tecnologías de la traducción.

**Palabras clave**: memoria de traducción; herramientas TAO; software de código abierto; formación de traductores; propuesta didáctica

---

# References

Díaz Fouces, O. (2019). Towards a critical approach to translation technologies. In D. Kenny (Ed.), *The Bloomsbury companion to language industry studies* (pp. 183–206). Bloomsbury Academic.

EMT Board. (2022). *European Master's in Translation competence framework 2022*. European Commission. https://commission.europa.eu/document/5e9c0d5c-3c8b-4c2e-9c6a-6f0b5b0a9f6e_en

Flórez, S., & Alcina, A. (2011). Free software for translators: A catalogue. *Tradumàtica*, 9, 29–41. https://doi.org/10.5565/rev/tradumatica.136

González Pastor, D. (2022). La automatización de los flujos de trabajo de traducción: implicaciones éticas y formativas. *Hikma*, 21(1), 125–150. https://doi.org/10.21071/hikma.v21i1.13930

Papert, S. (1980). *Mindstorms: Children, computers, and powerful ideas*. Basic Books.

Rico, C., & González-Pastor, D. (2022). Translator educators' beliefs about machine translation in the classroom. *Translation and Interpreting*, 14(2), 116–135. https://doi.org/10.12807/ti.114202.2022.a07

Sánchez-Castany, R. (2025). Open-source tools in translator training: Barriers and opportunities. *Tradumàtica*, 23, 45–67.

Zappatore, D. (2024). A multi-framework course design methodology for computer-assisted scientific translation. *The Interpreter and Translator Trainer*, 18(2), 201–225. https://doi.org/10.1080/1750399X.2024.2335000
