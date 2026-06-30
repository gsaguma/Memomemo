export function renderMergeTab() {
    return `
        <div class="flex flex-col gap-4">
            <!-- Upload Card -->
            <div class="bg-white rounded-lg p-4 shadow-md border border-[#93C5FD]">
                <h2 class="text-lg font-semibold mb-3">Upload Memories to Merge</h2>
                <label for="mergeFileInput" class="block cursor-pointer">
                    <div class="border-2 border-dashed border-primary dark:border-primary rounded-lg p-3 text-center hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center justify-center gap-3 md:flex-col md:gap-0 md:p-5">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-primary flex-shrink-0 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <div>
                            <span class="text-sm font-medium">Select or drop multiple files</span>
                            <p class="text-xs text-gray-600 dark:text-gray-400 mt-0.5">.tmx, .xliff, .xlf, .sdlxliff, .csv</p>
                        </div>
                    </div>
                    <input type="file" id="mergeFileInput" accept=".tmx,.xliff,.xlf,.sdlxliff,.csv" multiple class="hidden" />
                </label>
            </div>

            <!-- Two-column layout for file list + options (stacks on mobile) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- Selected Files List Card -->
                <div class="lg:col-span-1 bg-white rounded-lg p-4 shadow-md border border-[#93C5FD]">
                    <div class="flex justify-between items-center mb-3">
                        <h2 class="text-lg font-semibold">Selected Files</h2>
                        <span id="mergeFileCountBadge" class="bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
                    </div>
                    <div id="mergeFileList" class="flex flex-col gap-2 max-h-60 lg:max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                        <div class="text-sm text-gray-500 text-center py-6">No files uploaded yet.</div>
                    </div>
                </div>

                <!-- Settings and Action Card -->
                <div class="lg:col-span-2 flex flex-col gap-4">
                    <div class="bg-white rounded-lg p-4 shadow-md border border-[#93C5FD]">
                        <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Merge Options
                        </h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                                <label for="mergeSrcLang" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Combined Source Language</label>
                                <input type="text" id="mergeSrcLang" placeholder="e.g. en-US" class="w-full mt-1 px-3 py-2 md:py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label for="mergeTgtLang" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Combined Target Language</label>
                                <input type="text" id="mergeTgtLang" placeholder="e.g. es-ES" class="w-full mt-1 px-3 py-2 md:py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label for="mergeAuthor" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Author (creationid)</label>
                                <input type="text" id="mergeAuthor" placeholder="MemoMemo Merger" class="w-full mt-1 px-3 py-2 md:py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                            </div>
                            <div>
                                <label for="mergeTool" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Creation Tool</label>
                                <input type="text" id="mergeTool" value="MemoMemo" class="w-full mt-1 px-3 py-2 md:py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                            </div>
                        </div>
                        
                        <div class="border-t border-gray-200 dark:border-gray-700 pt-3 mb-4">
                            <label class="inline-flex items-center cursor-pointer min-h-[44px] md:min-h-0">
                                <input type="checkbox" id="mergeRemoveDuplicates" checked class="form-checkbox h-4 w-4 text-primary rounded border-gray-300 dark:border-gray-600 focus:ring-primary focus:ring-opacity-50" />
                                <span class="ml-2 text-sm">Remove duplicates (exclude exact matching source-target pairs)</span>
                            </label>
                        </div>
                        
                        <button id="executeMergeBtn" disabled class="w-full bg-primary disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded shadow transition text-sm flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Merge &amp; Download Unified TMX
                        </button>
                    </div>

                    <!-- Merge Status Indicator -->
                    <div id="mergeStatusContainer" class="hidden bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-500 p-4 rounded text-sm text-blue-700 dark:text-blue-200">
                        <!-- Status message goes here -->
                    </div>
                </div>
            </div>
        </div>
    `;
}
