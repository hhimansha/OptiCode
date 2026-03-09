/**
 * ConceptDetails Modal
 * Student: IT22601360
 *
 * CHANGES vs previous version:
 *  - REMOVED the getConceptDetails() API call that fired on every click.
 *    That was burning through the 50 RPD Gemini quota (visible in logs).
 *  - ADDED GitHub/GitLab-style code diff viewer:
 *      • Fuzzy evidence line finder (handles Gemini's paraphrased evidence)
 *      • ±5 lines of context shown above/below the match
 *      • Highlighted row with yellow gutter marker + line number
 *      • Full file path shown in header bar
 *  - All concept info (definition, confidence, related concepts) still shown
 *    using data already present on the concept object — zero API calls needed.
 */

import React, { useState, useEffect, useMemo } from 'react';

// ── Evidence finder ─────────────────────────────────────────────────────────
/**
 * Finds the best matching line index (0-based) in fileContent for evidence.
 *
 * Order of strategies:
 *  1. Exact trimmed match
 *  2. File line contains the evidence line (or vice versa)
 *  3. Token overlap — score by shared meaningful tokens, pick best
 */
function findEvidenceLine(fileContent, evidence) {
  if (!fileContent || !evidence) return null;

  const fileLines = fileContent.split('\n');
  const evLines = evidence
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('Pattern:') && !l.startsWith('..'));

  if (!evLines.length) return null;

  let bestIdx = -1;
  let bestScore = 0;

  for (const evLine of evLines) {
    const evNorm  = evLine.toLowerCase().replace(/\s+/g, ' ').trim();
    const evToks  = evNorm.split(/\W+/).filter(t => t.length > 2);

    for (let i = 0; i < fileLines.length; i++) {
      const fNorm = fileLines[i].toLowerCase().replace(/\s+/g, ' ').trim();
      if (!fNorm) continue;

      // 1. Exact
      if (fNorm === evNorm && fNorm.length > 3) return { lineIndex: i, score: 1 };

      // 2. Substring
      if ((fNorm.includes(evNorm) || evNorm.includes(fNorm)) && fNorm.length > 3) {
        if (0.9 > bestScore) { bestScore = 0.9; bestIdx = i; }
        continue;
      }

      // 3. Token overlap
      if (evToks.length > 0) {
        const fToks = new Set(fNorm.split(/\W+/).filter(t => t.length > 2));
        const hits  = evToks.filter(t => fToks.has(t)).length;
        const score = hits / evToks.length;
        if (score >= 0.5 && score > bestScore) { bestScore = score; bestIdx = i; }
      }
    }
  }

  return bestIdx >= 0 ? { lineIndex: bestIdx, score: bestScore } : null;
}

function getCodeWindow(fileContent, lineIndex, context = 5) {
  const all   = fileContent.split('\n');
  const start = Math.max(0, lineIndex - context);
  const end   = Math.min(all.length - 1, lineIndex + context);
  const lines = [];
  for (let i = start; i <= end; i++) {
    lines.push({ lineNumber: i + 1, content: all[i] });
  }
  return { lines, highlightIndex: lineIndex - start };
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  data_structure:      '#10b981',
  algorithm:           '#3b82f6',
  design_pattern:      '#a855f7',
  architecture:        '#f97316',
  paradigm:            '#ec4899',
  programming_concept: '#06b6d4',
};
const getCatColor = c => CATEGORY_COLORS[c] || '#6b7280';
const getConfColor = c => c >= 0.8 ? '#10b981' : c >= 0.6 ? '#f59e0b' : '#ef4444';

// ── GitHub-style Code Viewer ─────────────────────────────────────────────────
const CodeDiffViewer = ({ concept, fileContent }) => {
  const match = useMemo(
    () => fileContent ? findEvidenceLine(fileContent, concept.evidence) : null,
    [fileContent, concept.evidence]
  );

  const window = useMemo(
    () => match ? getCodeWindow(fileContent, match.lineIndex, 5) : null,
    [fileContent, match]
  );

  const sourceFile = concept.sourceFile || concept.filename || null;

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] text-xs font-mono">
      {/* File path bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#161b22] border-b border-[#30363d]">
        <svg className="w-3.5 h-3.5 text-[#58a6ff] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {sourceFile ? (
          <span className="text-[#58a6ff] truncate" title={sourceFile}>{sourceFile}</span>
        ) : (
          <span className="text-[#8b949e]">unknown file</span>
        )}
        {match && (
          <span className="ml-auto text-[#8b949e] flex-shrink-0">
            line {window?.lines[window.highlightIndex]?.lineNumber}
          </span>
        )}
        {match && (
          <span
            className="flex-shrink-0 px-1.5 py-0.5 rounded text-[10px]"
            style={{ backgroundColor: match.score >= 0.9 ? '#10b98120' : '#f59e0b20',
                     color: match.score >= 0.9 ? '#10b981' : '#f59e0b' }}
          >
            {match.score >= 0.9 ? 'exact' : 'fuzzy'}
          </span>
        )}
      </div>

      {/* Code lines */}
      {window ? (
        <div className="bg-[#0d1117] overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {window.lines.map((line, idx) => {
                const isHL = idx === window.highlightIndex;
                return (
                  <tr key={idx} style={isHL ? { backgroundColor: 'rgba(255,215,0,0.07)' } : {}}>
                    {/* gutter indicator */}
                    <td className="select-none w-5 pl-2 text-center" style={{ color: isHL ? '#fbbf24' : 'transparent' }}>
                      {isHL ? '▶' : '·'}
                    </td>
                    {/* line number */}
                    <td
                      className="select-none text-right pr-4 pl-1"
                      style={{
                        color: isHL ? '#fbbf24' : '#484f58',
                        minWidth: 38,
                        paddingTop: 2,
                        paddingBottom: 2,
                        borderRight: `1px solid ${isHL ? '#fbbf2435' : '#21262d'}`,
                        fontVariantNumeric: 'tabular-nums',
                        verticalAlign: 'top',
                      }}
                    >
                      {line.lineNumber}
                    </td>
                    {/* code */}
                    <td
                      className="pl-4 pr-4 whitespace-pre"
                      style={{
                        color: isHL ? '#f0e68c' : '#c9d1d9',
                        fontWeight: isHL ? 600 : 400,
                        paddingTop: 2,
                        paddingBottom: 2,
                        verticalAlign: 'top',
                      }}
                    >
                      {line.content || ' '}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Fallback: show raw evidence */
        <pre className="bg-[#0d1117] text-[#c9d1d9] p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
          {concept.evidence || 'No evidence available'}
        </pre>
      )}
    </div>
  );
};

// ── Main Modal ───────────────────────────────────────────────────────────────
const ConceptDetails = ({ concept, codeContext, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdrop = e => { if (e.target === e.currentTarget) onClose(); };

  if (!concept) return null;

  const catColor = getCatColor(concept.category);
  const confColor = getConfColor(concept.confidence);
  const relatedConcepts = concept.relatedConcepts || concept.related_concepts || [];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white mb-2 truncate">{concept.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border"
                  style={{
                    backgroundColor: `${catColor}20`,
                    color: catColor,
                    borderColor: `${catColor}40`,
                  }}
                >
                  {concept.category?.replace(/_/g, ' ')}
                </span>
                {concept.sourceFile && (
                  <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-1 rounded-lg border border-slate-700 truncate max-w-[300px]"
                    title={concept.sourceFile}>
                    📁 {concept.sourceFile}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Confidence */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Confidence</span>
              <span className="text-lg font-bold" style={{ color: confColor }}>
                {Math.round(concept.confidence * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.round(concept.confidence * 100)}%`, backgroundColor: confColor }}
              />
            </div>
          </div>

          {/* Description */}
          <section>
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
              <span>📖</span> Description
            </h3>
            <p className="text-gray-300 leading-relaxed bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 text-sm">
              {concept.description}
            </p>
          </section>

          {/* Code Reference — GitHub-style diff view */}
          <section>
            <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
              <span>🔍</span> Code Reference
            </h3>
            <CodeDiffViewer concept={concept} fileContent={codeContext} />
          </section>

          {/* Related Concepts */}
          {relatedConcepts.length > 0 && (
            <section>
              <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-2">
                <span>🔗</span> Related Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {relatedConcepts.map((r, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-slate-700 text-cyan-300 rounded-lg text-sm font-medium border border-slate-600 hover:bg-slate-600 transition-colors cursor-pointer"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-slate-800 border-t border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">AST + AI hybrid extraction — verify with official docs</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConceptDetails;