/**
 * ConceptList.jsx
 * Student: IT22601360
 *
 * Displays extracted concepts as cards.
 * Clicking a concept expands an inline code-reference panel below it,
 * showing the source file path and the relevant code section with line numbers.
 */

import React, { useState, useMemo } from 'react';

const CATEGORY_META = {
  data_structure:     { icon: '🗃️', color: '#10b981', label: 'Data Structure'     },
  algorithm:          { icon: '⚙️', color: '#3b82f6', label: 'Algorithm'           },
  design_pattern:     { icon: '🎨', color: '#a855f7', label: 'Design Pattern'      },
  architecture:       { icon: '🏛️', color: '#f97316', label: 'Architecture'        },
  paradigm:           { icon: '💡', color: '#ec4899', label: 'Paradigm'            },
  programming_concept:{ icon: '📦', color: '#06b6d4', label: 'Programming Concept' },
};

function confidenceMeta(conf) {
  const pct = Math.round(conf * 100);
  if (pct >= 90) return { label: `${pct}%`, cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
  if (pct >= 75) return { label: `${pct}%`, cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
  if (pct >= 50) return { label: `${pct}%`, cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  return { label: `${pct}%`, cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
}

/**
 * Given file content and an evidence snippet, find the matching lines and
 * return a window of context around them.
 */
function findEvidenceContext(fileContent, evidence, contextLines = 4) {
  if (!fileContent || !evidence) return null;

  const lines = fileContent.split('\n');
  const probe = evidence.trim().replace(/\s+/g, ' ').substring(0, 50);
  if (!probe) return null;

  let foundIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const normalized = lines[i].replace(/\s+/g, ' ');
    if (normalized.includes(probe.substring(0, 30))) {
      foundIdx = i;
      break;
    }
  }

  if (foundIdx === -1) return null;

  const start = Math.max(0, foundIdx - contextLines);
  const end = Math.min(lines.length - 1, foundIdx + contextLines);

  return {
    lineNumber: foundIdx + 1,
    startLine: start + 1,
    lines: lines.slice(start, end + 1),
    highlightLine: foundIdx - start, // 0-indexed offset within the slice
  };
}


// ── Inline Code Reference Panel ───────────────────────────────────────────────

const CodeReferencePanel = ({ concept, fileContents }) => {
  const sourceFile = concept.sourceFile;
  const fileContent = sourceFile ? fileContents?.[sourceFile] : null;
  const ctx = useMemo(
    () => findEvidenceContext(fileContent, concept.evidence),
    [fileContent, concept.evidence]
  );

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/60">
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
        {/* File path header */}
        <div className="px-3 py-2 bg-slate-800/80 flex items-center gap-2 border-b border-slate-700">
          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {sourceFile ? (
            <code className="text-xs text-green-400 font-mono truncate flex-1">{sourceFile}</code>
          ) : (
            <span className="text-xs text-gray-500 italic">Pasted code</span>
          )}
          {ctx && (
            <span className="text-xs text-gray-600 flex-shrink-0 font-mono">
              line {ctx.lineNumber}
            </span>
          )}
        </div>

        {/* Code content */}
        <div className="overflow-x-auto">
          {ctx ? (
            <table className="w-full text-xs font-mono">
              <tbody>
                {ctx.lines.map((line, i) => {
                  const isHighlight = i === ctx.highlightLine;
                  return (
                    <tr
                      key={i}
                      className={isHighlight ? 'bg-blue-500/10' : 'hover:bg-slate-900/50'}
                    >
                      <td className={`select-none px-3 py-0.5 text-right w-10 border-r ${
                        isHighlight ? 'border-blue-500/40 text-blue-400' : 'border-slate-800 text-gray-700'
                      }`}>
                        {ctx.startLine + i}
                      </td>
                      <td className={`pl-4 pr-4 py-0.5 whitespace-pre ${
                        isHighlight ? 'text-blue-200' : 'text-gray-300'
                      }`}>
                        {line || ' '}
                        {isHighlight && (
                          <span className="ml-2 text-blue-500/60">◀ evidence</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            // Fallback: show raw evidence string
            <pre className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
              {concept.evidence || '(no evidence recorded)'}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};


// ── Main ConceptList ──────────────────────────────────────────────────────────

const ConceptList = ({ concepts, onConceptClick, fileContents = {} }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');

  if (!concepts || concepts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <p className="text-gray-400 text-lg">No concepts found</p>
        </div>
      </div>
    );
  }

  const sorted = [...concepts].sort((a, b) => b.confidence - a.confidence);

  // Category filter tabs
  const categories = ['all', ...new Set(sorted.map(c => c.category))];

  const filtered = filterCategory === 'all'
    ? sorted
    : sorted.filter(c => c.category === filterCategory);

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Category filter */}
      <div className="px-5 py-3 border-b border-slate-800 flex gap-1.5 flex-wrap">
        {categories.map(cat => {
          const meta = CATEGORY_META[cat];
          const count = cat === 'all' ? concepts.length : concepts.filter(c => c.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => { setFilterCategory(cat); setExpandedIndex(null); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                filterCategory === cat
                  ? 'text-white border-transparent'
                  : 'bg-transparent text-gray-500 border-slate-700 hover:text-gray-300 hover:border-slate-600'
              }`}
              style={filterCategory === cat && meta
                ? { backgroundColor: `${meta.color}20`, color: meta.color, borderColor: `${meta.color}40` }
                : filterCategory === cat
                  ? { backgroundColor: '#334155', color: '#cbd5e1', borderColor: '#475569' }
                  : {}}
            >
              {cat === 'all' ? `All · ${count}` : `${meta?.icon || ''} ${meta?.label || cat} · ${count}`}
            </button>
          );
        })}
      </div>

      {/* Concept cards */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {filtered.map((concept, index) => {
          const meta = CATEGORY_META[concept.category] || { icon: '📦', color: '#6b7280', label: concept.category };
          const conf = confidenceMeta(concept.confidence);
          const isExpanded = expandedIndex === index;
          const hasSource = !!concept.sourceFile;
          const hasFileContent = hasSource && !!fileContents[concept.sourceFile];

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? 'border-slate-600 bg-slate-800 shadow-lg shadow-black/20'
                  : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
              }`}
              style={{ borderLeftWidth: '3px', borderLeftColor: meta.color }}
            >
              {/* Card header — click to expand code panel */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => {
                  setExpandedIndex(isExpanded ? null : index);
                  onConceptClick?.(concept);
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${meta.color}18` }}
                  >
                    {meta.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-white text-base leading-tight">{concept.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold border flex-shrink-0 ${conf.cls}`}>
                        {conf.label}
                      </span>
                    </div>

                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-medium border"
                        style={{ color: meta.color, backgroundColor: `${meta.color}12`, borderColor: `${meta.color}30` }}
                      >
                        {meta.label}
                      </span>
                      {hasSource && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-mono bg-slate-700/80 text-gray-400 border border-slate-600 truncate max-w-[200px]" title={concept.sourceFile}>
                          📄 {concept.sourceFile.split('/').pop()}
                        </span>
                      )}
                      {concept.source && (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-slate-700 text-gray-500 border border-slate-600">
                          {concept.source === 'gemini' ? '🤖 AI' : concept.source === 'ast_analysis' ? '🔬 AST' : '📋 Rules'}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 leading-relaxed">{concept.description}</p>

                    {/* Related concepts */}
                    {concept.relatedConcepts?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {concept.relatedConcepts.slice(0, 4).map((rel, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-700/50 text-cyan-400 rounded text-xs border border-slate-600/50">
                            {rel}
                          </span>
                        ))}
                        {concept.relatedConcepts.length > 4 && (
                          <span className="px-2 py-0.5 text-gray-600 text-xs">
                            +{concept.relatedConcepts.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expand hint */}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {hasFileContent
                      ? 'Click to view code reference ↓'
                      : concept.evidence
                        ? 'Click to view evidence ↓'
                        : ''}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Inline code reference panel */}
              {isExpanded && (
                <div className="px-4 pb-4">
                  <CodeReferencePanel concept={concept} fileContents={fileContents} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConceptList;