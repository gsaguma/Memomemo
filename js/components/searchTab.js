export function renderSearchTab() {
    return `
        <div class="flex flex-col gap-4">
            <!-- Upload Card -->
            <div id="uploadCard" class="bg-surface rounded-lg p-4 shadow-md border border-default">
                <h2 class="text-lg font-semibold mb-3">Upload Translation Memory File</h2>
                <div class="flex flex-col gap-3">
                    <label for="fileInput" id="dropZoneContainer" class="block">
                        <div class="border-2 border-dashed border-primary rounded-lg p-3 text-center cursor-pointer hover:bg-surface-hover transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span id="fileText" class="text-sm font-medium">Select or drop your file</span>
                            <p class="text-xs text-muted mt-1">.tmx, .xliff, .xlf, .sdlxliff, .csv</p>
                        </div>
                        <input type="file" id="fileInput" accept=".tmx,.xliff,.xlf,.sdlxliff,.csv" class="hidden" />
                    </label>
                    
                    <div id="fileInfo" class="hidden flex items-center justify-between bg-surface-alt p-3 rounded-lg border border-default shadow-sm text-sm">
                        <div class="flex items-center gap-2 truncate">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span id="fileName" class="font-medium truncate text-body max-w-[240px]"></span>
                            <span id="fileStats" class="text-xs text-muted whitespace-nowrap"></span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span id="fileSize" class="text-xs text-muted font-medium"></span>
                            <button type="button" id="changeFileBtn" class="text-xs font-semibold text-primary hover:underline focus:outline-none">Change file</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Panel -->
            <div id="statsPanel" class="hidden bg-surface rounded-lg shadow-md border border-default overflow-hidden">
                <button id="statsToggle" class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-surface-hover transition">
                    <span class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        File Statistics
                    </span>
                    <svg id="statsChevron" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-faint transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div id="statsBody" class="hidden px-4 pb-4">
                    <!-- Metric cards row -->
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Total segments</div>
                            <div id="statTotal" class="text-xl font-semibold text-primary">—</div>
                        </div>
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Unique segments</div>
                            <div id="statUnique" class="text-xl font-semibold text-primary">—</div>
                            <div id="statDupes" class="text-xs text-faint mt-0.5"></div>
                        </div>
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Source words</div>
                            <div id="statSrcWords" class="text-xl font-semibold text-primary">—</div>
                            <div id="statSrcAvgWords" class="text-xs text-faint mt-0.5"></div>
                        </div>
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Target words</div>
                            <div id="statTgtWords" class="text-xl font-semibold text-primary">—</div>
                            <div id="statTgtAvgWords" class="text-xs text-faint mt-0.5"></div>
                        </div>
                    </div>
                    <!-- Second row -->
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Empty source</div>
                            <div id="statEmptySrc" class="text-xl font-semibold text-primary">—</div>
                        </div>
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Empty target</div>
                            <div id="statEmptyTgt" class="text-xl font-semibold text-primary">—</div>
                        </div>
                        <div class="bg-surface rounded-lg p-3">
                            <div class="text-xs text-muted mb-1">Avg src / tgt length</div>
                            <div id="statAvgChars" class="text-xl font-semibold text-primary">—</div>
                            <div class="text-xs text-faint mt-0.5">characters</div>
                        </div>
                    </div>
                    <!-- Histogram -->
                    <div>
                        <div class="text-xs font-medium text-muted mb-2">Source segment length distribution (words)</div>
                        <div id="statHistogram" class="flex items-end gap-1 h-16"></div>
                        <div id="statHistogramLabels" class="flex gap-1 mt-1 text-xs text-faint"></div>
                    </div>
                </div>
            </div>

            <!-- Search Section & Results -->
            <div id="searchAndResultsContainer" class="hidden flex flex-col gap-4">
                <!-- Search Section -->
                <div id="searchSection">
                    <div class="bg-surface rounded-lg p-4 shadow-md border border-default">
                        <h2 class="text-lg font-semibold mb-3">Search Translation Memory</h2>
                        <div class="flex flex-col gap-3">
                            <input type="text" id="searchInput" placeholder="Search in source or target text..." aria-label="Search term in translation memory"
                                   class="w-full px-3 py-2 rounded-md border border-default bg-surface text-base focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-surface" />
                            <div class="flex flex-wrap items-center gap-3 text-sm">
                                <input type="checkbox" id="sourceOnly" class="sr-only" tabindex="-1" />
                                <input type="checkbox" id="targetOnly" class="sr-only" tabindex="-1" />
                                <div class="inline-flex rounded-md shadow-sm flex-grow md:flex-grow-0" role="group">
                                    <button type="button" id="searchScopeBoth" aria-label="Search in source and target columns" class="flex-1 md:flex-initial min-h-[44px] md:min-h-0 px-3 py-2 md:py-1.5 text-sm md:text-xs font-medium rounded-l-md border border-default bg-primary text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-surface transition">
                                        Both
                                    </button>
                                    <button type="button" id="searchScopeSource" aria-label="Search in source column only" class="flex-1 md:flex-initial min-h-[44px] md:min-h-0 px-3 py-2 md:py-1.5 text-sm md:text-xs font-medium border-t border-b border-r border-default bg-surface text-body hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-surface transition">
                                        Source
                                    </button>
                                    <button type="button" id="searchScopeTarget" aria-label="Search in target column only" class="flex-1 md:flex-initial min-h-[44px] md:min-h-0 px-3 py-2 md:py-1.5 text-sm md:text-xs font-medium rounded-r-md border-t border-b border-r border-default bg-surface text-body hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-surface transition">
                                        Target
                                    </button>
                                </div>
                                <label class="inline-flex items-center cursor-pointer min-h-[44px] md:min-h-0" title="Use regular expressions (e.g. \\d+, colou?r, ^Start)">
                                    <input type="checkbox" id="useRegex" aria-label="Use regular expression search" class="form-checkbox h-4 w-4 text-primary rounded border-default focus:ring-primary focus:ring-offset-1 dark:focus:ring-offset-surface" />
                                    <span class="ml-1 font-mono text-xs tracking-tight">.*</span>
                                    <span class="ml-1">Regex</span>
                                </label>
                            </div>
                        </div>
                        <div class="mt-3 flex items-center justify-between gap-3">
                            <div class="text-sm text-muted">
                                <span id="resultsCount">0 results</span>
                            </div>
                            <button id="downloadUpdatedTmxBtn" class="hidden bg-primary hover:bg-opacity-90 text-white font-medium py-1.5 px-3 rounded shadow transition text-xs flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Updated TMX
                            </button>
                            <div id="regexError" class="hidden text-xs text-red-500 font-mono"></div>
                        </div>
                    </div>
                </div>

                <!-- Loading Indicator -->
                <div id="loadingIndicator" class="hidden">
                    <div class="flex justify-center items-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>

                <!-- Error Message -->
                <div id="errorMessage" class="hidden bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <div class="flex items-start gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <div id="errorTitle" class="font-semibold text-sm"></div>
                            <div id="errorDetail" class="text-xs mt-1 opacity-80 font-mono whitespace-pre-wrap"></div>
                            <div id="errorHint" class="text-xs mt-2 text-red-600 not-italic"></div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div id="resultsSection" class="hidden">
                    <div class="bg-surface rounded-lg p-4 shadow-md border border-default overflow-x-auto">
                        <table class="min-w-full divide-y divide-default">
                            <thead class="hidden md:table-header-group">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-body uppercase tracking-wider w-1/2">
                                        Source (<span id="sourceLanguage">--</span>)
                                    </th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-body uppercase tracking-wider w-1/2">
                                        Target (<span id="targetLanguage">--</span>)
                                    </th>
                                </tr>
                            </thead>
                            <tbody id="resultsTable" class="divide-y divide-default">
                                <!-- Results will be inserted here -->
                            </tbody>
                        </table>
                    </div>

                    <div id="pagination" class="mt-6 flex justify-center space-x-2">
                        <!-- Pagination will be inserted here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}
