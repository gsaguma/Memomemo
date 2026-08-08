export function renderQaTab() {
    return `
        <div class="flex flex-col gap-4">
            <!-- File Info -->
            <div class="bg-surface rounded-lg p-4 shadow-md border border-default">
                <div class="flex items-center justify-between">
                    <h2 class="text-lg font-semibold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Quality Check
                    </h2>
                    <span id="qaFileInfo" class="text-sm text-muted">No file loaded</span>
                </div>
                <p class="text-xs text-faint mt-1">Runs on the file loaded in Search &amp; View tab.</p>
            </div>

            <!-- Rule Categories -->
            <div class="bg-surface rounded-lg p-4 shadow-md border border-default">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold">Checks to execute</h3>
                    <div class="flex gap-2">
                        <button id="qaSelectAllBtn" class="text-xs text-primary hover:underline">Select all</button>
                        <button id="qaDeselectAllBtn" class="text-xs text-muted hover:underline">Deselect all</button>
                    </div>
                </div>

                <div id="qaRulesList" class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-0 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                    <!-- Populated dynamically by controller -->
                </div>

                <div class="mt-4 flex flex-wrap gap-3 items-center">
                    <button id="qaRunBtn" class="bg-navy hover:bg-navy-dark text-white font-medium py-2 px-4 rounded shadow transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Run Selected Checks
                    </button>
                    <button id="qaRunAllBtn" class="bg-navy hover:bg-navy-dark text-white font-medium py-2 px-4 rounded shadow transition text-sm">
                        Run All
                    </button>
                    <div class="ml-auto flex gap-2">
                        <input type="file" id="qaGlossaryFileInput" accept=".tmx,.csv" class="hidden">
                        <button id="qaImportGlossaryBtn" class="text-xs text-white bg-navy hover:bg-navy-dark border border-navy rounded px-2 py-1">Import Glossary</button>
                    </div>
                </div>
            </div>

            <!-- Glossary CRUD -->
            <details id="qaGlossarySection" class="bg-surface rounded-lg shadow-md border border-default overflow-hidden">
                <summary class="flex items-center justify-between px-4 py-3 bg-surface-alt cursor-pointer hover:bg-surface-hover text-sm font-medium">
                    <span class="flex items-center gap-2">
                        <svg class="h-4 w-4 text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        Glossary — <span id="qaGlossaryCount">0</span> entries
                    </span>
                    <div class="flex gap-2">
                        <button type="button" id="qaGlossaryAddBtn" class="text-xs bg-primary text-white font-medium px-2 py-1 rounded hover:bg-opacity-90 transition">+ Add Entry</button>
                        <button type="button" id="qaGlossaryImportBtn" class="text-xs text-white bg-navy hover:bg-navy-dark border border-navy rounded px-2 py-1">Import</button>
                    </div>
                </summary>
                <div class="p-3">
                    <div id="qaGlossaryTable" class="divide-y divide-default text-sm"></div>
                    <div id="qaGlossaryPagination" class="flex items-center justify-center gap-2 mt-2 text-xs"></div>
                </div>
            </details>

            <!-- Loading -->
            <div id="qaLoading" class="hidden bg-surface rounded-lg p-6 shadow-md border border-default">
                <div class="flex items-center justify-center gap-3 text-sm text-muted">
                    <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span id="qaLoadingText">Running checks...</span>
                </div>
            </div>

            <!-- Results Summary -->
            <div id="qaSummary" class="hidden bg-surface rounded-lg p-4 shadow-md border border-default">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold">Results</h3>
                    <div class="flex gap-3 text-xs">
                        <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-red-500"></span> <span id="qaCountError">0</span></span>
                        <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-yellow-500"></span> <span id="qaCountWarning">0</span></span>
                        <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-blue-500"></span> <span id="qaCountInfo">0</span></span>
                    </div>
                </div>
                <div id="qaFilters" class="flex flex-wrap gap-2 mb-3 text-xs">
                    <button id="qaFilterAll" class="px-2 py-1 rounded bg-primary text-white">All</button>
                    <button id="qaFilterError" class="px-2 py-1 rounded bg-surface-alt hover:bg-surface-hover text-body">Errors</button>
                    <button id="qaFilterWarning" class="px-2 py-1 rounded bg-surface-alt hover:bg-surface-hover text-body">Warnings</button>
                    <button id="qaFilterInfo" class="px-2 py-1 rounded bg-surface-alt hover:bg-surface-hover text-body">Info</button>
                </div>
            </div>

            <!-- Pagination -->
            <div id="qaPagination" class="hidden">
            </div>

            <!-- Results List -->
            <div id="qaResults" class="hidden flex flex-col gap-4">
                <!-- Populated dynamically by controller -->
            </div>

            <!-- Actions Bar -->
            <div id="qaActions" class="hidden bg-surface rounded-lg p-4 shadow-md border border-default">
                <div class="flex gap-3">
                    <button id="qaDeleteSelectedBtn" class="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded shadow transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        Delete Selected
                    </button>
                </div>
            </div>
        </div>
    `;
}
