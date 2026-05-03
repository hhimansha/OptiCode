/**
 * ConceptList.jsx
 * Student: IT22601360
 *
 * Changes in this version:
 *  - Inline code reference panel replaced with proper GitHub-style diff view
 *  - Fuzzy evidence finder: handles Gemini's paraphrased evidence strings
 *  - File path shown above the code viewer
 *  - 5 lines of context above and below the matched line
 *  - NO more API calls on card click (was burning 50 RPD quota)
 */

import React, { useState, useMemo, useCallback } from 'react';

// ── Evidence finder ────────────────────────────────────────────────────────────
/**
 * Finds the best matching line in fileContent for a given evidence string.
 *
 * Strategy (in order):
 *  1. Exact line match (trimmed)
 *  2. Substring match — evidence line is contained in a file line
 *  3. Token overlap — score each file line by # of shared tokens, pick best
 *
 * Returns { lineIndex, score } where lineIndex is 0-based.
 */
function findEvidenceLine(fileContent, evidence) {
  if (!fileContent || !evidence) return null;

  const fileLines = fileContent.split('\n');
  const evidenceLines = evidence
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  if (!evidenceLines.length) return null;

  // Try each evidence line, take the best match overall
  let bestLineIdx = -1;
  let bestScore = 0;

  for (const evLine of evidenceLines) {
    if (!evLine || evLine.startsWith('Pattern:')) continue;

    const evNorm = evLine.toLowerCase().replace(/\s+/g, ' ').trim();
    const evTokens = evNorm.split(/\W+/).filter(t => t.length > 2);

    for (let i = 0; i < fileLines.length; i++) {
      const fileLine = fileLines[i];
      const fileNorm = fileLine.toLowerCase().replace(/\s+/g, ' ').trim();

      // 1. Exact match (trimmed)
      if (fileNorm === evNorm) {
        return { lineIndex: i, score: 1.0 };
      }

      // 2. Substring: one contains the other
      if (fileNorm.includes(evNorm) || evNorm.includes(fileNorm)) {
        if (fileNorm.length > 3) {
          const score = 0.9;
          if (score > bestScore) {
            bestScore = score;
            bestLineIdx = i;
          }
          continue;
        }
      }

      // 3. Token overlap score
      if (evTokens.length > 0) {
        const fileTokens = new Set(fileNorm.split(/\W+/).filter(t => t.length > 2));
        const hits = evTokens.filter(t => fileTokens.has(t)).length;
        const score = hits / evTokens.length;
        if (score > bestScore && score >= 0.5) {
          bestScore = score;
          bestLineIdx = i;
        }
      }
    }
  }

  return bestLineIdx >= 0 ? { lineIndex: bestLineIdx, score: bestScore } : null;
}

/**
 * Returns a window of lines around the match: { lines, highlightIndex }
 * lines = array of { lineNumber (1-based), content }
 * highlightIndex = index within lines[] that is the matched line
 */
function getCodeWindow(fileContent, matchLineIndex, context = 5) {
  if (!fileContent) return null;
  const all = fileContent.split('\n');
  const start = Math.max(0, matchLineIndex - context);
  const end = Math.min(all.length - 1, matchLineIndex + context);
  const lines = [];
  for (let i = start; i <= end; i++) {
    lines.push({ lineNumber: i + 1, content: all[i] });
  }
  return {
    lines,
    highlightIndex: matchLineIndex - start,
  };
}

// ── Category helpers ───────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  data_structure:     { bg: '#10b98115', text: '#10b981', border: '#10b98130', dot: '#10b981' },
  algorithm:          { bg: '#3b82f615', text: '#60a5fa', border: '#3b82f630', dot: '#3b82f6' },
  design_pattern:     { bg: '#a855f715', text: '#c084fc', border: '#a855f730', dot: '#a855f7' },
  architecture:       { bg: '#f9731615', text: '#fb923c', border: '#f9731630', dot: '#f97316' },
  paradigm:           { bg: '#ec489915', text: '#f472b6', border: '#ec489930', dot: '#ec4899' },
  programming_concept:{ bg: '#06b6d415', text: '#22d3ee', border: '#06b6d430', dot: '#06b6d4' },
};
const getCatColors = c => CATEGORY_COLORS[c] || { bg: '#6b728015', text: '#9ca3af', border: '#6b728030', dot: '#6b7280' };

const CATEGORY_LABELS = {
  data_structure: 'Data Structure',
  algorithm: 'Algorithm',
  design_pattern: 'Design Pattern',
  architecture: 'Architecture',
  paradigm: 'Paradigm',
  programming_concept: 'Programming Concept',
};

const getConfidenceColor = c => c >= 0.8 ? '#10b981' : c >= 0.6 ? '#f59e0b' : '#ef4444';

const sourceLabel = s => {
  if (s === 'hybrid') return { label: 'Hybrid', color: '#a855f7' };
  if (s === 'ast_analysis') return { label: 'AST', color: '#06b6d4' };
  if (s === 'rule_based') return { label: 'Rule', color: '#f59e0b' };
  return { label: 'AI', color: '#10b981' };
};

// ── GitHub-style Code Reference Panel ─────────────────────────────────────────
const CodeReferencePanel = ({ concept, fileContents }) => {
  const sourceFile = concept?.sourceFile || concept?.filename || null;
  const fileContent = sourceFile ? (fileContents?.[sourceFile] || null) : null;

  const result = useMemo(() => {
    if (!fileContent || !concept?.evidence) return null;
    const match = findEvidenceLine(fileContent, concept.evidence);
    if (!match) return null;
    return getCodeWindow(fileContent, match.lineIndex, 5);
  }, [fileContent, concept?.evidence]);

  // No file content available — show raw evidence
  if (!fileContent) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-slate-600/60">
        {sourceFile && (
          <div className="px-3 py-2 bg-slate-800 border-b border-slate-600/60 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-mono text-slate-400 truncate">{sourceFile}</span>
          </div>
        )}
        <pre className="bg-slate-900 text-gray-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
          <code>{concept?.evidence || 'No evidence available'}</code>
        </pre>
      </div>
    );
  }

  // File content available but no match found
  if (!result) {
    return (
      <div className="mt-3 rounded-xl overflow-hidden border border-slate-600/60">
        <div className="px-3 py-2 bg-slate-800 border-b border-slate-600/60 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-xs font-mono text-slate-400 truncate">{sourceFile}</span>
          <span className="ml-auto text-xs text-amber-400/70 italic">approximate match</span>
        </div>
        <pre className="bg-slate-900 text-gray-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed">
          <code>{concept?.evidence}</code>
        </pre>
      </div>
    );
  }

  // Full GitHub-style diff view
  const { lines, highlightIndex } = result;

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-slate-600/60 text-xs font-mono">
      {/* File path header */}
      <div className="px-3 py-2 bg-[#161b22] border-b border-slate-600/60 flex items-center gap-2">
        <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-blue-300 truncate">{sourceFile}</span>
        <span className="ml-auto text-slate-500 flex-shrink-0">
          line {lines[highlightIndex]?.lineNumber}
        </span>
      </div>

      {/* Code lines */}
      <div className="bg-[#0d1117] overflow-x-auto">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => {
              const isHighlight = idx === highlightIndex;
              return (
                <tr
                  key={idx}
                  style={isHighlight ? { backgroundColor: 'rgba(255, 215, 0, 0.08)' } : {}}
                >
                  {/* Gutter marker */}
                  <td
                    className="select-none w-4 px-1"
                    style={{
                      color: isHighlight ? '#fbbf24' : 'transparent',
                      fontSize: '10px',
                      paddingTop: '1px',
                      paddingBottom: '1px',
                      verticalAlign: 'top',
                    }}
                  >
                    {isHighlight ? '▶' : ' '}
                  </td>
                  {/* Line number */}
                  <td
                    className="select-none text-right pr-4 pl-3"
                    style={{
                      color: isHighlight ? '#fbbf24' : '#484f58',
                      minWidth: '40px',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      verticalAlign: 'top',
                      borderRight: `1px solid ${isHighlight ? '#fbbf2430' : '#21262d'}`,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {line.lineNumber}
                  </td>
                  {/* Code content */}
                  <td
                    className="pl-4 pr-4 whitespace-pre"
                    style={{
                      color: isHighlight ? '#f0e68c' : '#c9d1d9',
                      paddingTop: '2px',
                      paddingBottom: '2px',
                      fontWeight: isHighlight ? 600 : 400,
                    }}
                  >
                    {line.content}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Concept Card ───────────────────────────────────────────────────────────────
const ConceptCard = ({ concept, index, isExpanded, onToggle, fileContents }) => {
  const colors = getCatColors(concept.category);
  const src    = sourceLabel(concept.source);

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-200"
      style={{
        borderColor: isExpanded ? colors.border : 'rgba(71,85,105,0.4)',
        backgroundColor: isExpanded ? colors.bg : 'rgba(15,23,42,0.6)',
      }}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => onToggle(index)}
        className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-white/5 transition-colors"
      >
        {/* Category dot */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.dot }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">{concept.name}</span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
              style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
            >
              {CATEGORY_LABELS[concept.category] || concept.category}
            </span>
            {concept.source && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                style={{ backgroundColor: `${src.color}15`, color: src.color }}
              >
                {src.label}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {concept.description}
          </p>

          {/* Confidence bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden max-w-[100px]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(concept.confidence * 100)}%`,
                  backgroundColor: getConfidenceColor(concept.confidence),
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              {Math.round(concept.confidence * 100)}%
            </span>
            {concept.sourceFile && (
              <span className="text-[10px] text-slate-500 truncate max-w-[120px] font-mono" title={concept.sourceFile}>
                {concept.sourceFile.split('/').pop() || concept.sourceFile.split('\\').pop()}
              </span>
            )}
          </div>
        </div>

        {/* Expand chevron */}
        <svg
          className={`w-4 h-4 text-gray-500 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded panel */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50">
          {/* Related concepts */}
          {concept.relatedConcepts?.length > 0 && (
            <div className="mt-3">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Related</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {concept.relatedConcepts.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded bg-slate-700/60 text-cyan-300 border border-slate-600/40"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code reference */}
          <div className="mt-3">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
              Code Reference
            </span>
            <CodeReferencePanel concept={concept} fileContents={fileContents} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main ConceptList ───────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'data_structure', label: 'Data Structures' },
  { key: 'algorithm', label: 'Algorithms' },
  { key: 'design_pattern', label: 'Patterns' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'paradigm', label: 'Paradigms' },
  { key: 'programming_concept', label: 'Concepts' },
];

const ConceptList = ({ concepts = [], onConceptClick, fileContents = {} }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedIndex, setExpandedIndex]   = useState(null);
  const [searchQuery, setSearchQuery]       = useState('');

  const filtered = useMemo(() => {
    let list = concepts;
    if (activeCategory !== 'all') {
      list = list.filter(c => c.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [concepts, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    concepts.forEach(c => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [concepts]);

  const handleToggle = useCallback((idx) => {
    setExpandedIndex(prev => prev === idx ? null : idx);
    // Also notify parent for ConceptDetails modal if needed
    if (onConceptClick && filtered[idx]) {
      onConceptClick(expandedIndex === idx ? null : filtered[idx]);
    }
  }, [expandedIndex, filtered, onConceptClick]);

  if (!concepts.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="text-gray-400 font-medium">No concepts extracted yet</p>
        <p className="text-gray-600 text-sm mt-1">Upload code to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setExpandedIndex(null); }}
          placeholder="Search concepts..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const count = cat.key === 'all' ? concepts.length : (categoryCounts[cat.key] || 0);
          if (cat.key !== 'all' && count === 0) return null;
          const colors = getCatColors(cat.key);
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setExpandedIndex(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border"
              style={active ? {
                backgroundColor: cat.key === 'all' ? '#3b82f620' : colors.bg,
                color: cat.key === 'all' ? '#60a5fa' : colors.text,
                borderColor: cat.key === 'all' ? '#3b82f640' : colors.border,
              } : {
                backgroundColor: 'transparent',
                color: '#6b7280',
                borderColor: '#374151',
              }}
            >
              {cat.label}
              <span
                className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                style={{
                  backgroundColor: active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: active ? 'inherit' : '#6b7280',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Concepts list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No concepts match your filter
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((concept, idx) => (
            <ConceptCard
              key={`${concept.name}-${idx}`}
              concept={concept}
              index={idx}
              isExpanded={expandedIndex === idx}
              onToggle={handleToggle}
              fileContents={fileContents}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConceptList;