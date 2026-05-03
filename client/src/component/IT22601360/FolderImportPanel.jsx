/**
 * FolderImportPanel.jsx
 * Student: IT22601360
 *
 * Handles local project folder import via webkitdirectory.
 * Reads file contents in-browser, sends to backend, returns results + fileContents map.
 *
 * Props (new):
 *   onFilesReady(files)  — called in compare mode so parent runs both API calls
 *   extractionMode       — 'hybrid' | 'llm_only' | 'compare'  (default: 'hybrid')
 */

import React, { useState, useRef, useCallback } from 'react';
import { conceptExtractorApi } from '../../modules/IT22601360/conceptExtractorApi';

// File extensions we care about
const CODE_EXTENSIONS = new Set([
  '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.cc', '.cxx',
  '.c', '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php', '.swift', '.kt',
]);

const IGNORE_DIRS = new Set([
  'node_modules', '__pycache__', '.git', '.venv', 'venv', 'env',
  'dist', 'build', '.next', 'coverage', '.pytest_cache', 'target',
]);

const LANG_COLORS = {
  python: '#3b82f6',
  javascript: '#f59e0b',
  typescript: '#06b6d4',
  java: '#f97316',
  cpp: '#a855f7',
  c: '#6366f1',
  go: '#10b981',
  rust: '#ef4444',
  ruby: '#ec4899',
  csharp: '#8b5cf6',
};

// ── Mode config (mirrors ExtractionModeToggle styles) ────────────────────────
const MODE_CONFIG = {
  hybrid: {
    label:       'AST + LLM Hybrid',
    icon:        '🔬',
    color:       '#22c55e',
    btnClass:    'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-blue-500/20',
    description: 'AST analysis + Gemini AI',
  },
  llm_only: {
    label:       'LLM Only',
    icon:        '🤖',
    color:       '#f59e0b',
    btnClass:    'from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20',
    description: 'Gemini AI, no AST context',
  },
  compare: {
    label:       'Compare Both',
    icon:        '📊',
    color:       '#6366f1',
    btnClass:    'from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-indigo-500/20',
    description: 'Runs hybrid + LLM-only in parallel',
  },
};

function getExt(filename) {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

function detectLang(filename) {
  const ext = getExt(filename);
  const map = {
    '.py': 'python', '.js': 'javascript', '.jsx': 'javascript',
    '.ts': 'typescript', '.tsx': 'typescript', '.java': 'java',
    '.cpp': 'cpp', '.cc': 'cpp', '.cxx': 'cpp', '.c': 'c',
    '.h': 'c', '.hpp': 'cpp', '.cs': 'csharp', '.go': 'go',
    '.rs': 'rust', '.rb': 'ruby', '.php': 'php', '.swift': 'swift',
    '.kt': 'kotlin',
  };
  return map[ext] || 'unknown';
}

function isIgnored(path) {
  return path.split('/').some(part => IGNORE_DIRS.has(part));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FolderImportPanel = ({
  onResult,
  onAnalyzing,
  onFilesReady,              // NEW — parent uses this in compare mode
  extractionMode = 'hybrid', // NEW — 'hybrid' | 'llm_only' | 'compare'
}) => {
  const inputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [folderName, setFolderName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ phase: '', current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [langFilter, setLangFilter] = useState(new Set());

  const modeCfg = MODE_CONFIG[extractionMode] || MODE_CONFIG.hybrid;

  const handleFolderSelect = useCallback((e) => {
    const all = Array.from(e.target.files);
    const filtered = all.filter(f => {
      const rel = f.webkitRelativePath || f.name;
      return !isIgnored(rel) && CODE_EXTENSIONS.has(getExt(f.name));
    });

    if (filtered.length === 0) {
      setError('No code files found. Try a different folder.');
      return;
    }

    setError(null);
    setSelectedFiles(filtered);

    // Infer folder name from first file's path
    const firstPath = filtered[0]?.webkitRelativePath || '';
    setFolderName(firstPath.split('/')[0] || 'Project');
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsAnalyzing(true);
    onAnalyzing?.(true);
    setError(null);

    try {
      // Phase 1: Read file contents into browser memory (all modes need this)
      setProgress({ phase: 'Reading files…', current: 0, total: selectedFiles.length });
      const fileContentsMap = {};

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const key = file.webkitRelativePath || file.name;
        try {
          fileContentsMap[key] = await file.text();
        } catch {
          fileContentsMap[key] = '';
        }
        setProgress({ phase: 'Reading files…', current: i + 1, total: selectedFiles.length });
      }

      // Phase 2: Upload + extract — behaviour depends on mode
      if (extractionMode === 'compare') {
        // Compare: hand files to parent, it calls uploadProjectFilesCompare()
        // and owns the two parallel API calls + sets compareResult
        setProgress({ phase: 'Handing off to compare runner…', current: 1, total: 1 });
        onFilesReady?.(selectedFiles);
        // parent will call onAnalyzing(false) when both calls finish

      } else {
        // Single mode: hybrid or llm_only
        const modeLabel = extractionMode === 'llm_only' ? 'LLM only…' : 'AST + AI…';
        setProgress({ phase: `Analyzing with ${modeLabel}`, current: 0, total: 1 });

        const result = await conceptExtractorApi.uploadProjectFiles(
          selectedFiles,
          null,            // onUploadProgress
          extractionMode,  // passed as ?extraction_mode= query param
        );

        // Quota exhausted in llm_only — warn but still show AST fallback results
        if (result.quota_exhausted && extractionMode === 'llm_only') {
          setError(
            '⚠️ Gemini quota exhausted — showing AST fallback results. ' +
            'LLM-only results available after quota resets (~24h).'
          );
        }

        // Phase 3: Done
        setProgress({ phase: 'Complete', current: 1, total: 1 });
        onResult(result, fileContentsMap);
      }

    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      // Only clear our local loading; for compare mode the parent clears its own
      if (extractionMode !== 'compare') {
        setIsAnalyzing(false);
        onAnalyzing?.(false);
      } else {
        setIsAnalyzing(false);
      }
    }
  }, [selectedFiles, onResult, onAnalyzing, onFilesReady, extractionMode]);

  // Compute language distribution
  const langDist = selectedFiles.reduce((acc, f) => {
    const lang = detectLang(f.name);
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const totalSize = selectedFiles.reduce((s, f) => s + f.size, 0);

  const visibleFiles = langFilter.size > 0
    ? selectedFiles.filter(f => langFilter.has(detectLang(f.name)))
    : selectedFiles;

  // ── Analyze button label ──────────────────────────────────────────────────

  const analyzeButtonContent = () => {
    if (isAnalyzing) {
      return (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {extractionMode === 'compare' ? 'Running both modes…' : 'Analyzing…'}
        </>
      );
    }
    return (
      <>
        <span>{modeCfg.icon}</span>
        {extractionMode === 'compare'
          ? `Compare ${selectedFiles.length} Files`
          : `Analyze ${selectedFiles.length} Files`}
        {/* small mode label so user knows what they're running */}
        <span className="ml-1 text-xs opacity-60 font-normal">({modeCfg.label})</span>
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Drop / Browse zone */}
      {selectedFiles.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <button
            onClick={() => inputRef.current?.click()}
            className="group w-full max-w-sm border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-10 flex flex-col items-center gap-4 transition-all duration-300 hover:bg-blue-500/5"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800 group-hover:bg-blue-500/20 flex items-center justify-center transition-all duration-300">
              <svg className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-lg group-hover:text-blue-400 transition-colors">
                Browse Folder
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Select your project directory to analyze
              </p>
            </div>
          </button>

          {/* Active mode indicator — shows which mode is currently set */}
          <div
            className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium"
            style={{
              background:  `${modeCfg.color}12`,
              borderColor: `${modeCfg.color}35`,
              color:       modeCfg.color,
            }}
          >
            <span>{modeCfg.icon}</span>
            {modeCfg.label}
            <span className="text-xs opacity-60 font-normal">— {modeCfg.description}</span>
          </div>

          <p className="mt-4 text-xs text-gray-600 text-center max-w-xs">
            Supports Python, JavaScript, TypeScript, Java, C/C++, Go, Rust and more.
            Ignores <code className="text-gray-500">node_modules</code>, <code className="text-gray-500">__pycache__</code>, etc.
          </p>

          {error && (
            <div className="mt-4 px-4 py-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center max-w-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Folder header */}
          <div className="px-5 py-4 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-lg">📁</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">{folderName}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedFiles.length} files · {formatBytes(totalSize)}
                  </p>
                </div>
              </div>

              {/* Mode pill — visible once folder is loaded */}
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                  style={{
                    background:  `${modeCfg.color}18`,
                    borderColor: `${modeCfg.color}40`,
                    color:       modeCfg.color,
                  }}
                >
                  {modeCfg.icon} {modeCfg.label}
                </span>
                <button
                  onClick={() => { setSelectedFiles([]); setFolderName(''); setError(null); }}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-gray-500 hover:text-gray-300 transition-colors"
                  title="Remove folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Language breakdown */}
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(langDist).map(([lang, count]) => (
                <button
                  key={lang}
                  onClick={() => setLangFilter(prev => {
                    const next = new Set(prev);
                    next.has(lang) ? next.delete(lang) : next.add(lang);
                    return next;
                  })}
                  className={`px-2 py-1 rounded-md text-xs font-medium border transition-all ${
                    langFilter.has(lang) || langFilter.size === 0
                      ? 'border-transparent text-white'
                      : 'border-slate-700 text-gray-500 opacity-50'
                  }`}
                  style={langFilter.has(lang) || langFilter.size === 0
                    ? { backgroundColor: `${LANG_COLORS[lang] || '#6b7280'}25`, color: LANG_COLORS[lang] || '#9ca3af', borderColor: `${LANG_COLORS[lang] || '#6b7280'}40` }
                    : {}}
                >
                  {lang} · {count}
                </button>
              ))}
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1">
            {visibleFiles.slice(0, 100).map((file) => {
              const rel = file.webkitRelativePath || file.name;
              const lang = detectLang(file.name);
              const parts = rel.split('/');
              const name = parts.pop();
              const dir = parts.join('/');

              return (
                <div key={rel} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-900 group transition-colors">
                  <span className="text-sm flex-shrink-0" style={{ color: LANG_COLORS[lang] || '#9ca3af' }}>
                    {lang === 'python' ? '🐍' : lang === 'javascript' ? '📜' : lang === 'typescript' ? '📘' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-gray-300 font-mono truncate block">{name}</span>
                    {dir && <span className="text-xs text-gray-600 truncate block">{dir}</span>}
                  </div>
                  <span className="text-xs text-gray-600 flex-shrink-0 group-hover:text-gray-500 transition-colors">
                    {formatBytes(file.size)}
                  </span>
                </div>
              );
            })}
            {visibleFiles.length > 100 && (
              <p className="text-xs text-gray-600 text-center py-2">
                +{visibleFiles.length - 100} more files
              </p>
            )}
          </div>

          {/* Progress / Analyze button */}
          <div className="px-5 py-4 bg-slate-900 border-t border-slate-800">
            {/* Quota warning (amber) or hard error (red) */}
            {error && (
              <div className={`mb-3 px-3 py-2 rounded-lg text-xs border ${
                error.startsWith('⚠️')
                  ? 'bg-amber-900/20 border-amber-500/30 text-amber-400'
                  : 'bg-red-900/20 border-red-500/30 text-red-400'
              }`}>
                {error}
              </div>
            )}

            {isAnalyzing && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span>{progress.phase}</span>
                  {progress.total > 0 && (
                    <span>{progress.current}/{progress.total}</span>
                  )}
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  {/* Progress bar colour matches the active mode */}
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: progress.total > 0
                        ? `${(progress.current / progress.total) * 100}%`
                        : '60%',
                      background: `linear-gradient(to right, ${modeCfg.color}, ${modeCfg.color}99)`,
                    }}
                  />
                </div>
                {extractionMode === 'compare' && (
                  <p className="text-xs text-gray-500 mt-1.5">
                    Running AST+LLM and LLM-only in parallel — 2 API calls total
                  </p>
                )}
              </div>
            )}

            {/* Analyze button — gradient changes with mode */}
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || selectedFiles.length === 0}
              className={`w-full px-5 py-3 bg-gradient-to-r ${modeCfg.btnClass} text-white rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2`}
            >
              {analyzeButtonContent()}
            </button>
          </div>
        </div>
      )}

      {/* Hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        multiple
        className="hidden"
        onChange={handleFolderSelect}
        accept={[...CODE_EXTENSIONS].join(',')}
      />
    </div>
  );
};

export default FolderImportPanel;