export function renderAlignTab() {
    return `
        <!-- Section 1: Inputs (Initial State - occupies full width) -->
        <div id="alignInputSection" class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Source Uploader Card -->
                <div class="bg-white rounded-lg p-4 shadow-md border border-[#93C5FD] flex flex-col gap-3">
                    <h2 class="text-lg font-semibold text-[#1F2937]">1. Source Text (Origen)</h2>
                    <label for="alignSourceFileInput" id="alignSourceDropZone" class="block cursor-pointer">
                        <div class="border-2 border-dashed border-[#93C5FD] rounded-lg p-3 text-center hover:bg-gray-50 transition flex items-center justify-center gap-3 md:flex-col md:gap-0 md:p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary flex-shrink-0 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <span class="text-sm font-semibold text-primary">Upload Source File</span>
                                <p class="text-xs text-gray-500 mt-0.5">.txt, .csv, .docx, .pptx</p>
                            </div>
                        </div>
                        <input type="file" id="alignSourceFileInput" accept=".txt,.csv,.docx,.pptx" class="hidden" />
                    </label>
                    <div id="alignSourceFileInfo" class="hidden flex items-center justify-between bg-[#F0F9FF] p-3 rounded border border-[#93C5FD] text-sm flex-wrap gap-2">
                        <div class="flex items-center gap-2 truncate">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span id="alignSourceFileName" class="font-medium truncate text-[#1F2937] max-w-[200px]"></span>
                        </div>
                        <button type="button" id="changeAlignSourceBtn" class="text-xs font-semibold text-[#3B82F6] hover:underline focus:outline-none min-h-[44px] md:min-h-0 px-2">Cambiar archivo</button>
                    </div>
                    <div class="text-center text-xs text-gray-400 font-semibold my-1">&mdash; OR PASTE TEXT &mdash;</div>
                    <textarea id="alignSourceText" placeholder="Paste source sentences here..." class="w-full flex-grow p-3 text-sm border border-[#93C5FD] rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-y" rows="6"></textarea>
                </div>

                <!-- Target Uploader Card -->
                <div class="bg-white rounded-lg p-4 shadow-md border border-[#93C5FD] flex flex-col gap-3">
                    <h2 class="text-lg font-semibold text-[#1F2937]">2. Target Text (Meta)</h2>
                    <label for="alignTargetFileInput" id="alignTargetDropZone" class="block cursor-pointer">
                        <div class="border-2 border-dashed border-[#93C5FD] rounded-lg p-3 text-center hover:bg-gray-50 transition flex items-center justify-center gap-3 md:flex-col md:gap-0 md:p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary flex-shrink-0 md:mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <div>
                                <span class="text-sm font-semibold text-primary">Upload Target File</span>
                                <p class="text-xs text-gray-500 mt-0.5">.txt, .csv, .docx, .pptx</p>
                            </div>
                        </div>
                        <input type="file" id="alignTargetFileInput" accept=".txt,.csv,.docx,.pptx" class="hidden" />
                    </label>
                    <div id="alignTargetFileInfo" class="hidden flex items-center justify-between bg-[#F0F9FF] p-3 rounded border border-[#93C5FD] text-sm flex-wrap gap-2">
                        <div class="flex items-center gap-2 truncate">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span id="alignTargetFileName" class="font-medium truncate text-[#1F2937] max-w-[200px]"></span>
                        </div>
                        <button type="button" id="changeAlignTargetBtn" class="text-xs font-semibold text-[#3B82F6] hover:underline focus:outline-none min-h-[44px] md:min-h-0 px-2">Cambiar archivo</button>
                    </div>
                    <div class="text-center text-xs text-gray-400 font-semibold my-1">&mdash; OR PASTE TEXT &mdash;</div>
                    <textarea id="alignTargetText" placeholder="Paste target sentences here..." class="w-full flex-grow p-3 text-sm border border-[#93C5FD] rounded bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-y" rows="6"></textarea>
                </div>
            </div>

            <div class="flex gap-3">
                <button id="alignClearInputsBtn" type="button" class="flex-1 md:w-1/3 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded shadow transition text-sm flex items-center justify-center gap-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-h-[48px]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Limpiar todo
                </button>
                <button id="startAlignBtn" class="flex-[2] md:flex-none md:w-2/3 bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded shadow transition text-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 min-h-[48px]">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Iniciar Alineación (Start Alignment)
                </button>
            </div>
        </div>

        <!-- Section 2: Preview Grid (Full Width, hidden initially) -->
        <div id="alignPreviewSection" class="hidden bg-white rounded-lg p-4 shadow-md border border-[#93C5FD] flex flex-col gap-4">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <h2 class="text-lg font-semibold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    Interactive Alignment Preview
                </h2>
                <div class="flex flex-wrap gap-2 items-center">
                    <button id="alignBackBtn" class="min-h-[40px] bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded shadow transition text-xs flex items-center gap-1 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a configurar
                    </button>
                    <button id="alignClearBtn" class="min-h-[40px] bg-red-50 hover:bg-red-100 text-red-700 font-medium py-1.5 px-3 rounded shadow transition text-xs flex items-center gap-1 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Limpiar alineación
                    </button>
                    <button id="alignOpenInAppBtn" class="min-h-[40px] bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded shadow transition text-xs flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-green-600">
                        Open in MemoMemo
                    </button>
                    <div class="flex items-center gap-1 bg-white border border-gray-300 rounded shadow p-1 min-h-[40px]">
                        <select id="alignExportFormat" class="text-xs text-gray-700 bg-transparent focus:outline-none py-0.5 px-1 border-0">
                            <option value="tmx">TMX (.tmx)</option>
                            <option value="txt">Tabbed TXT (.txt)</option>
                            <option value="csv">CSV (.csv)</option>
                        </select>
                        <button id="alignDownloadBtn" class="bg-primary hover:bg-opacity-90 text-white font-medium py-1 px-2.5 rounded text-xs flex items-center gap-1 transition focus:outline-none focus:ring-2 focus:ring-primary">
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div class="overflow-x-auto max-h-[600px] border border-[#93C5FD] rounded-lg">
                <table class="min-w-full divide-y divide-[#93C5FD]">
                    <thead>
                        <tr class="bg-[#F0F9FF]">
                            <th class="px-3 py-2.5 text-left text-xs font-semibold text-[#1F2937] uppercase w-5/12">Source Segment</th>
                            <th class="px-3 py-2.5 text-left text-xs font-semibold text-[#1F2937] uppercase w-5/12">Target Segment</th>
                            <th class="px-3 py-2.5 text-right text-xs font-semibold text-[#1F2937] uppercase w-2/12">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="alignPreviewTable" class="divide-y divide-[#93C5FD] text-xs">
                        <!-- Aligned pairs will render here dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
    `;
}
