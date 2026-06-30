export function renderMetaTab() {
    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: File Upload & Stats -->
            <div class="lg:col-span-1 flex flex-col gap-4">
                <!-- Upload Card for Metadata Editor -->
                <div class="bg-white rounded-lg p-4 shadow-md border border-[#93C5FD]">
                    <h2 class="text-lg font-semibold mb-3">Upload File to Edit Metadata</h2>
                    <div class="flex flex-col gap-3">
                        <label for="metaFileInput" id="metaDropZoneContainer" class="block">
                            <div class="border-2 border-dashed border-primary dark:border-primary rounded-lg p-3 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mx-auto mb-1 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span id="metaFileText" class="text-sm font-medium font-semibold">Select or drop file</span>
                                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">.tmx, .xliff, .xlf, .sdlxliff, .csv</p>
                            </div>
                            <input type="file" id="metaFileInput" accept=".tmx,.xliff,.xlf,.sdlxliff,.csv" class="hidden" />
                        </label>
                        
                        <div id="metaFileInfo" class="hidden flex items-center justify-between bg-[#F0F9FF] p-3 rounded-lg border border-[#93C5FD] shadow-sm text-sm">
                            <div class="flex items-center gap-2 truncate">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span id="metaFileName" class="font-medium truncate text-[#1F2937] max-w-[240px]"></span>
                                <span id="metaFileStats" class="text-xs text-gray-500 whitespace-nowrap"></span>
                            </div>
                            <div class="flex items-center gap-3">
                                <span id="metaFileSize" class="text-xs text-gray-500 font-medium"></span>
                                <button type="button" id="changeMetaFileBtn" class="text-xs font-semibold text-[#3B82F6] hover:underline focus:outline-none">Cambiar archivo</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Settings and Action Buttons -->
            <div class="lg:col-span-2 flex flex-col gap-4">
                <!-- Metadata Card -->
                <div id="metadataCard" class="hidden bg-white rounded-lg p-4 shadow-md border border-[#93C5FD]">
                    <h2 class="text-lg font-semibold mb-3 flex items-center gap-2 text-[#1F2937]">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit File Metadata
                    </h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                            <label for="metaAuthor" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Author (creationid)</label>
                            <input type="text" id="metaAuthor" placeholder="e.g. John Doe" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Creation Tool</label>
                            <div id="metaToolDisplay" class="mt-2.5 font-semibold text-sm text-[#1F2937] dark:text-gray-300">MemoMemo</div>
                        </div>
                        <div>
                            <label for="metaToolVersion" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Tool Version</label>
                            <input type="text" id="metaToolVersion" placeholder="e.g. 1.0" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label for="metaCreationDate" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Creation Date (YYYYMMDDTHHMMSSZ)</label>
                            <input type="text" id="metaCreationDate" placeholder="e.g. 20231024T143000Z" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label for="metaSrcLang" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Source Language</label>
                            <input type="text" id="metaSrcLang" placeholder="e.g. en-US" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label for="metaTgtLang" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Target Language (adminlang)</label>
                            <input type="text" id="metaTgtLang" placeholder="e.g. es-ES" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label for="metaDatatype" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Datatype</label>
                            <input type="text" id="metaDatatype" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                        <div>
                            <label for="metaSegtype" class="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Seg Type</label>
                            <input type="text" id="metaSegtype" class="w-full mt-1 px-3 py-1.5 rounded border border-[#93C5FD] bg-white text-sm focus:ring-1 focus:ring-primary focus:outline-none" />
                        </div>
                    </div>
                    
                    <button id="exportMetadataBtn" class="mt-2 w-full bg-primary hover:bg-opacity-90 text-white font-medium py-2.5 px-4 rounded shadow transition text-sm flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export & Download TMX with Updated Metadata
                    </button>
                </div>
            </div>

            <!-- Editor Error/Status message -->
            <div id="metaEditorStatus" class="hidden bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
                <!-- Message goes here -->
            </div>
        </div>
    `;
}
