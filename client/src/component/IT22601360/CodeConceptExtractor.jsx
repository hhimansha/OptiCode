/**
 * CodeConceptExtractor.jsx
 * Student: IT22601360
 *
 * Main research tool for extracting CS concepts from code.
 *
 * Modes:
 *  - Paste  : single code snippet analysis
 *  - Folder : local project folder import via webkitdirectory
 *
 * Features:
 *  - Concept list with inline code-reference panel
 *  - Distribution chart & relationship graph
 *  - AI-generated project purpose
 *  - PDF export (research grade)
 *  - Auto-save to MongoDB
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import CodeEditor from './CodeEditor';
import ConceptList from './ConceptList';
import ConceptGraph from './ConceptGraph';
import DistributionChart from './DistributionChart';
import ConceptDetails from './ConceptDetails';
import FolderImportPanel from './FolderImportPanel';
import PDFExportButton from './PDFExportButton';
import { conceptExtractorApi, conceptHistoryApi } from '../../modules/IT22601360/conceptExtractorApi';

// ── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_CODE = `def binary_search(arr, target):
    """Binary search algorithm - O(log n)"""
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1


class Stack:
    """Stack data structure using array"""
    def __init__(self):
        self.items = []

    def push(self, item):
        self.items.append(item)

    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        raise IndexError("Stack is empty")

    def is_empty(self):
        return len(self.items) == 0
`;

const TABS = [
  { id: 'list',  icon: '📋', label: 'Concepts'  },
  { id: 'chart', icon: '📊', label: 'Chart'     },
  { id: 'graph', icon: '🕸️', label: 'Graph'     },
];


// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a flat concepts array with sourceFile attached,
 * from a multi-file project result.
 */
function flattenProjectConcepts(projectResult) {
  const out = [];
  (projectResult.files || []).forEach(fileResult => {
    if (fileResult.success) {
      (fileResult.concepts || []).forEach(c => {
        out.push({ ...c, sourceFile: fileResult.filename });
      });
    }
  });
  return out;
}

function primaryLanguage(projectResult) {
  const counts = {};
  (projectResult.files || []).forEach(f => {
    if (f.success) counts[f.language] = (counts[f.language] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
}


// ── Component ────────────────────────────────────────────────────────────────

const CodeConceptExtractor = () => {
  // ─ Mode
  const [mode, setMode] = useState('paste'); // 'paste' | 'folder'

  // ─ Paste mode state
  const [code, setCode]         = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState('python');

  // ─ Analysis state
  const [isLoading, setIsLoading]           = useState(false);
  const [isFolderAnalyzing, setIsFolderAnalyzing] = useState(false);
  const [error, setError]                   = useState(null);
  const [extractionResult, setExtractionResult] = useState(null);
  const [projectSummary, setProjectSummary] = useState(null);

  // ─ File contents map (for code navigation in folder mode)
  const [fileContents, setFileContents]     = useState({});

  // ─ UI state
  const [activeTab, setActiveTab]           = useState('list');
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [supportedLanguages, setSupportedLanguages] = useState([
    'python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust',
  ]);
  const [serviceStatus, setServiceStatus]   = useState('checking');

  // ─ Save state
  const [saveStatus, setSaveStatus] = useState('idle');

  // Flattened concepts list (different shape in paste vs folder mode)
  const allConcepts = useMemo(() => {
    if (!extractionResult) return [];
    if (mode === 'folder') return flattenProjectConcepts(extractionResult);
    return extractionResult.concepts || [];
  }, [extractionResult, mode]);

  const resultLanguage = mode === 'folder'
    ? primaryLanguage(extractionResult || {})
    : language;


  // ─ Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    checkServiceHealth();
    loadSupportedLanguages();
  }, []);

  const checkServiceHealth = async () => {
    try {
      const h = await conceptExtractorApi.healthCheck();
      setServiceStatus(h.status === 'healthy' ? 'online' : 'offline');
    } catch {
      setServiceStatus('offline');
    }
  };

  const loadSupportedLanguages = async () => {
    try {
      const r = await conceptExtractorApi.getSupportedLanguages();
      if (r.languages) setSupportedLanguages(r.languages);
    } catch {}
  };


  // ─ Auto-save ─────────────────────────────────────────────────────────────

  const autoSave = async (result, src, lang) => {
    setSaveStatus('saving');
    try {
      await conceptHistoryApi.saveExtraction(result, src, lang);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  };


  // ─ Paste mode: analyze ───────────────────────────────────────────────────

  const handleAnalyzePaste = useCallback(async () => {
    if (!code.trim()) { setError('Please enter some code to analyze'); return; }

    setIsLoading(true);
    setError(null);
    setSelectedConcept(null);
    setSaveStatus('idle');
    setFileContents({});

    try {
      const result = await conceptExtractorApi.extractConcepts(code, language);
      if (!result.concepts?.length) {
        setError('No concepts detected. Try adding more code or different code.');
        setExtractionResult(null);
        return;
      }
      setExtractionResult(result);
      setProjectSummary(null);
      setActiveTab('list');
      await autoSave(result, code, language);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setExtractionResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);


  // ─ Folder mode: receive result from FolderImportPanel ───────────────────

  const handleFolderResult = useCallback((result, fileContentsMap) => {
    const concepts = flattenProjectConcepts(result);
    if (concepts.length === 0) {
      setError('No concepts detected in the project files.');
      setExtractionResult(null);
      return;
    }
    setError(null);
    setExtractionResult(result);
    setProjectSummary(result.project_summary || null);
    setFileContents(fileContentsMap || {});
    setActiveTab('list');

    // Save a representative subset
    const fakeResult = {
      concepts: concepts.slice(0, 50),
      metrics: result.project_summary || {},
      processingTime: result.totalProcessingTime || 0,
    };
    autoSave(fakeResult, '// Project folder analysis', primaryLanguage(result));
  }, []);


  // ─ Mode switch ───────────────────────────────────────────────────────────

  const switchMode = (newMode) => {
    setMode(newMode);
    setExtractionResult(null);
    setProjectSummary(null);
    setFileContents({});
    setError(null);
    setSelectedConcept(null);
    setSaveStatus('idle');
  };


  // ─ Misc handlers ─────────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    setCode('');
    setExtractionResult(null);
    setProjectSummary(null);
    setSelectedConcept(null);
    setError(null);
    setSaveStatus('idle');
    setFileContents({});
  }, []);

  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE);
    setLanguage('python');
  }, []);

  const handleConceptClick  = useCallback(c => setSelectedConcept(c), []);
  const handleCloseDetails  = useCallback(() => setSelectedConcept(null), []);


  // ─ Save badge ────────────────────────────────────────────────────────────

  const SaveBadge = () => {
    if (saveStatus === 'idle') return null;
    const cfg = {
      saving: { cls: 'bg-amber-500/15 border-amber-500/30 text-amber-400', label: '💾 Saving…' },
      saved:  { cls: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400', label: '✅ Saved'  },
      error:  { cls: 'bg-red-500/15 border-red-500/30 text-red-400', label: '❌ Save failed' },
    }[saveStatus];
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${cfg.cls}`}>
        {cfg.label}
      </span>
    );
  };


  // ─ Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-lg shadow-black/30">
        <div className="px-6 py-3 flex items-center gap-4">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 text-xl">
              🔬
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Code Concept Extractor
            </h1>
          </div>

          {/* Service status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
            serviceStatus === 'online'
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/15 text-red-400 border-red-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${serviceStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
            {serviceStatus === 'online' ? 'AI Online' : 'AI Offline'}
          </div>

          {/* Mode toggle */}
          <div className="ml-auto flex items-center gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700">
            {[
              { id: 'paste',  icon: '📝', label: 'Paste Code' },
              { id: 'folder', icon: '📁', label: 'Import Folder' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  mode === m.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>
        </div>
      </header>


      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>

        {/* ── Left panel (input) ── */}
        <div className="w-[45%] flex flex-col border-r border-slate-800 overflow-hidden">

          {/* Sub-header */}
          <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              {mode === 'paste' ? <><span>📝</span> Code Input</> : <><span>📁</span> Project Folder</>}
            </h2>
            {mode === 'paste' && (
              <div className="flex items-center gap-2">
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {supportedLanguages.map(l => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="flex-1 overflow-hidden">
            {mode === 'paste' ? (
              <CodeEditor code={code} setCode={setCode} language={language} />
            ) : (
              <FolderImportPanel
                onResult={handleFolderResult}
                onAnalyzing={setIsFolderAnalyzing}
              />
            )}
          </div>

          {/* Paste mode action bar */}
          {mode === 'paste' && (
            <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800 flex gap-2 flex-shrink-0">
              <button
                onClick={handleAnalyzePaste}
                disabled={isLoading || !code.trim()}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Analyzing…</>
                ) : (
                  <><span>🚀</span> Analyze Code</>
                )}
              </button>
              <button onClick={handleLoadSample} className="px-4 py-2.5 bg-slate-800 text-gray-400 hover:text-gray-200 rounded-xl text-sm font-medium border border-slate-700 hover:border-slate-600 transition-all">
                Sample
              </button>
              <button onClick={handleClear} className="px-4 py-2.5 bg-slate-800 text-gray-400 hover:text-red-400 rounded-xl text-sm font-medium border border-slate-700 hover:border-red-800 transition-all">
                Clear
              </button>
            </div>
          )}
        </div>


        {/* ── Right panel (results) ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Results header */}
          <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>📊</span> Analysis Results
            </h2>

            <div className="flex items-center gap-2">
              {extractionResult && allConcepts.length > 0 && (
                <>
                  <span className="px-2.5 py-1 bg-blue-500/15 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30">
                    🎯 {allConcepts.length} concepts
                  </span>
                  {(extractionResult.processingTime || extractionResult.totalProcessingTime) && (
                    <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 rounded-lg text-xs font-medium border border-emerald-500/30">
                      ⚡ {(extractionResult.processingTime || extractionResult.totalProcessingTime).toFixed(2)}s
                    </span>
                  )}
                  <SaveBadge />
                  <PDFExportButton
                    concepts={allConcepts}
                    projectSummary={projectSummary}
                    language={resultLanguage}
                    mode={mode}
                  />
                </>
              )}
            </div>
          </div>

          {/* Project purpose banner (folder mode) */}
          {mode === 'folder' && projectSummary?.project_purpose && (
            <div className="mx-5 mt-4 p-4 bg-blue-500/8 border border-blue-500/20 rounded-xl flex-shrink-0">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">🗺</span>
                <div>
                  <p className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">Project Overview</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{projectSummary.project_purpose}</p>
                </div>
              </div>
              {/* File stats */}
              {(projectSummary.successful_files != null || projectSummary.total_files != null) && (
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                  {projectSummary.total_files != null && <span>📂 {projectSummary.total_files} files scanned</span>}
                  {projectSummary.successful_files != null && <span>✅ {projectSummary.successful_files} analyzed</span>}
                  {projectSummary.skipped_files != null && projectSummary.skipped_files > 0 && <span>⏭ {projectSummary.skipped_files} skipped</span>}
                </div>
              )}
            </div>
          )}

          {/* Tabs */}
          {extractionResult && allConcepts.length > 0 && (
            <div className="px-5 py-2 border-b border-slate-800 flex gap-1.5 flex-shrink-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-gray-500 hover:text-gray-300 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <span>{tab.icon}</span>{tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Error */}
            {error && (
              <div className="m-5 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3">
                <span className="text-xl mt-0.5">⚠️</span>
                <div>
                  <h3 className="font-semibold text-red-400 mb-0.5 text-sm">Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Loading */}
            {(isLoading || isFolderAnalyzing) && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-14 h-14 border-4 border-slate-800 border-t-blue-500 rounded-full animate-spin" />
                <div className="text-center">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {isFolderAnalyzing ? 'Analyzing Project…' : 'Analyzing Code…'}
                  </h3>
                  <p className="text-sm text-gray-500">AI is extracting concepts</p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !isFolderAnalyzing && !extractionResult && !error && (
              <div className="flex flex-col items-center justify-center h-full px-8">
                <div className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-5 border border-slate-700">
                  <span className="text-4xl">🔬</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
                <p className="text-sm text-gray-500 text-center max-w-sm">
                  {mode === 'paste'
                    ? 'Paste code on the left and click Analyze Code to extract CS concepts.'
                    : 'Import your project folder on the left to analyze the entire codebase.'}
                </p>
              </div>
            )}

            {/* Results */}
            {!isLoading && !isFolderAnalyzing && extractionResult && allConcepts.length > 0 && (
              <>
                {activeTab === 'list' && (
                  <ConceptList
                    concepts={allConcepts}
                    onConceptClick={handleConceptClick}
                    fileContents={fileContents}
                  />
                )}
                {activeTab === 'chart' && <DistributionChart data={allConcepts} />}
                {activeTab === 'graph' && <ConceptGraph data={allConcepts} />}
              </>
            )}
          </div>

          {/* Metrics footer */}
          {extractionResult && (
            <div className="px-5 py-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-5 flex-shrink-0">
              {mode === 'paste' && extractionResult.metrics && (
                <>
                  <span className="text-xs text-gray-500">📄 {extractionResult.metrics.linesOfCode} lines</span>
                  <span className="text-xs text-gray-500">⚡ {extractionResult.metrics.functionsFound} functions</span>
                  <span className="text-xs text-gray-500">🏛 {extractionResult.metrics.classesFound} classes</span>
                </>
              )}
              {mode === 'folder' && projectSummary && (
                <>
                  <span className="text-xs text-gray-500">📂 {projectSummary.total_files || 0} files</span>
                  <span className="text-xs text-gray-500">✅ {projectSummary.successful_files || 0} analyzed</span>
                  <span className="text-xs text-gray-500">🎯 {allConcepts.length} concepts total</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>


      {/* ── Concept details modal ── */}
      {selectedConcept && (
        <ConceptDetails
          concept={selectedConcept}
          codeContext={mode === 'paste' ? code : (fileContents[selectedConcept.sourceFile] || '')}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default CodeConceptExtractor;