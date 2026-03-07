/**
 * PDFExportButton.jsx
 * Student: IT22601360
 *
 * Generates a clean research-grade PDF report by opening a
 * print-ready HTML window. No external dependencies required.
 *
 * Sections:
 *  1. Title & metadata
 *  2. Project purpose / overview
 *  3. Summary statistics
 *  4. Concepts grouped by category (description, evidence, file ref, line)
 */

import React, { useState } from 'react';

const CATEGORY_COLORS = {
  data_structure:      '#10b981',
  algorithm:           '#3b82f6',
  design_pattern:      '#a855f7',
  architecture:        '#f97316',
  paradigm:            '#ec4899',
  programming_concept: '#06b6d4',
};

function fmt(cat) {
  return (cat || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildHTML({ concepts, projectSummary, language, mode, generatedAt }) {
  // Group by category
  const groups = {};
  (concepts || []).forEach(c => {
    const cat = c.category || 'programming_concept';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(c);
  });

  // Stats
  const total = concepts?.length || 0;
  const catCount = Object.keys(groups).length;
  const avgConf = total > 0
    ? Math.round((concepts.reduce((s, c) => s + (c.confidence || 0), 0) / total) * 100)
    : 0;
  const highConf = concepts?.filter(c => (c.confidence || 0) >= 0.8).length || 0;

  const purpose = projectSummary?.project_purpose || projectSummary?.projectPurpose || '';

  const conceptRows = Object.entries(groups).map(([cat, items]) => {
    const color = CATEGORY_COLORS[cat] || '#6b7280';
    const sortedItems = [...items].sort((a, b) => (b.confidence || 0) - (a.confidence || 0));

    const rows = sortedItems.map(c => {
      const pct = Math.round((c.confidence || 0) * 100);
      const evidenceTrunc = (c.evidence || '').substring(0, 300);
      const fileRef = c.sourceFile
        ? `<span class="file-ref">📄 ${c.sourceFile}</span>`
        : '';

      return `
        <div class="concept-card">
          <div class="concept-header">
            <div class="concept-name">${c.name || ''}</div>
            <div class="concept-badges">
              ${fileRef}
              <span class="badge conf-badge">${pct}% confidence</span>
            </div>
          </div>
          <p class="concept-desc">${c.description || ''}</p>
          ${evidenceTrunc ? `
            <div class="evidence-block">
              <span class="evidence-label">Evidence</span>
              <code class="evidence-code">${evidenceTrunc.replace(/</g, '&lt;').replace(/>/g, '&gt;')}${c.evidence?.length > 300 ? '…' : ''}</code>
            </div>
          ` : ''}
          ${c.relatedConcepts?.length ? `
            <div class="related-row">
              <span class="related-label">Related:</span>
              ${c.relatedConcepts.slice(0, 6).map(r => `<span class="tag">${r}</span>`).join('')}
            </div>
          ` : ''}
        </div>`;
    }).join('');

    return `
      <div class="category-section">
        <div class="category-heading" style="border-left-color: ${color}; color: ${color}">
          ${fmt(cat)} <span class="cat-count">${items.length} concept${items.length !== 1 ? 's' : ''}</span>
        </div>
        ${rows}
      </div>`;
  }).join('');

  const projectFiles = projectSummary?.successful_files ?? projectSummary?.totalFiles ?? '';
  const projectLang = language || projectSummary?.language || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width"/>
  <title>Code Concept Analysis Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10pt;
      color: #1a1a2e;
      background: #fff;
      padding: 0;
    }

    /* ── Cover page ── */
    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 60px 56px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f2044 100%);
      color: #fff;
      page-break-after: always;
    }
    .cover-logo { font-size: 48px; margin-bottom: 24px; }
    .cover-title {
      font-size: 32pt;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.15;
      background: linear-gradient(90deg, #60a5fa, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 12px;
    }
    .cover-subtitle { font-size: 14pt; color: #94a3b8; margin-bottom: 40px; }
    .cover-meta {
      margin-top: auto;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .meta-item { background: rgba(255,255,255,.05); border-radius: 12px; padding: 16px; }
    .meta-label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .meta-value { font-size: 14pt; font-weight: 600; color: #e2e8f0; }

    /* ── Main content ── */
    .content { padding: 48px 56px; }

    /* ── Section headings ── */
    h2 {
      font-size: 16pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* ── Purpose box ── */
    .purpose-box {
      background: #f0f9ff;
      border-left: 4px solid #3b82f6;
      border-radius: 0 12px 12px 0;
      padding: 20px 24px;
      margin-bottom: 36px;
      color: #1e3a5f;
      font-size: 10.5pt;
      line-height: 1.7;
    }

    /* ── Stats grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 36px;
    }
    .stat-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-value { font-size: 22pt; font-weight: 700; color: #0f172a; }
    .stat-label { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

    /* ── Category sections ── */
    .category-section { margin-bottom: 32px; }
    .category-heading {
      font-size: 13pt;
      font-weight: 700;
      border-left: 4px solid;
      padding-left: 12px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cat-count { font-size: 9pt; font-weight: 400; opacity: .7; }

    /* ── Concept cards ── */
    .concept-card {
      background: #f8fafc;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .concept-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 6px;
    }
    .concept-name { font-size: 11pt; font-weight: 600; color: #1e293b; }
    .concept-badges { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 8pt;
      font-weight: 500;
      white-space: nowrap;
    }
    .conf-badge { background: #dbeafe; color: #1d4ed8; }
    .file-ref { font-family: 'JetBrains Mono', monospace; font-size: 8pt; color: #059669; background: #d1fae5; padding: 2px 8px; border-radius: 6px; }

    .concept-desc { font-size: 9.5pt; color: #475569; line-height: 1.6; margin-bottom: 8px; }

    .evidence-block {
      background: #1e293b;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 8px;
    }
    .evidence-label {
      display: block;
      font-size: 7.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .evidence-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      color: #86efac;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .related-row { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; }
    .related-label { font-size: 8pt; color: #94a3b8; }
    .tag {
      padding: 2px 8px;
      background: #e0f2fe;
      color: #0369a1;
      border-radius: 5px;
      font-size: 8pt;
    }

    /* ── Footer ── */
    .report-footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    @media print {
      body { padding: 0; }
      .cover { min-height: 100vh; }
      @page { margin: 0; }
      @page :not(:first) { margin: 1.5cm 1.8cm; }
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover">
    <div class="cover-logo">🔬</div>
    <div class="cover-title">Code Concept<br/>Analysis Report</div>
    <div class="cover-subtitle">AI-Powered Theoretical CS Concept Extraction</div>

    <div class="cover-meta">
      <div class="meta-item">
        <div class="meta-label">Mode</div>
        <div class="meta-value">${mode === 'folder' ? '📁 Project' : '📝 Paste'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Language</div>
        <div class="meta-value">${projectLang || '—'}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Generated</div>
        <div class="meta-value" style="font-size:10pt">${generatedAt}</div>
      </div>
    </div>
  </div>

  <!-- Main Content -->
  <div class="content">

    <!-- Purpose -->
    ${purpose ? `
    <h2>🗺 Project Overview</h2>
    <div class="purpose-box">${purpose}</div>
    ` : ''}

    <!-- Stats -->
    <h2>📊 Summary Statistics</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Concepts Extracted</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${catCount}</div>
        <div class="stat-label">Categories Covered</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${avgConf}%</div>
        <div class="stat-label">Avg. Confidence</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${highConf}</div>
        <div class="stat-label">High-Confidence (&ge;80%)</div>
      </div>
    </div>
    ${projectFiles ? `<p style="font-size:9pt;color:#64748b;margin-bottom:32px;">Analysis based on ${projectFiles} source file${projectFiles !== 1 ? 's' : ''}.</p>` : ''}

    <!-- Concepts by category -->
    <h2>🧠 Extracted Concepts</h2>
    ${conceptRows}

    <div class="report-footer">
      <span>Generated by AI Code Concept Extractor · Student IT22601360</span>
      <span>${generatedAt}</span>
    </div>
  </div>

</body>
</html>`;
}

const PDFExportButton = ({ concepts, projectSummary, language, mode, disabled }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    if (!concepts?.length) return;
    setExporting(true);

    const generatedAt = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const html = buildHTML({ concepts, projectSummary, language, mode, generatedAt });

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) {
      alert('Please allow pop-ups to export the PDF.');
      setExporting(false);
      return;
    }

    win.document.write(html);
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.print();
        setExporting(false);
      }, 500);
    };
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting || !concepts?.length}
      title="Export analysis as PDF"
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white rounded-xl text-sm font-medium border border-slate-700 hover:border-slate-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Preparing…
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF
        </>
      )}
    </button>
  );
};

export default PDFExportButton;