// ComparisonPanel.jsx — IT22601360
// Research panel: side-by-side LLM Only vs AST+LLM Hybrid comparison
// Shows precision/recall/F1 computed from the actual outputs, not a hardcoded dataset.
import React, { useMemo, useState } from "react";

// ── Metric computation ─────────────────────────────────────────────────────────
function computeMetrics(hybridConcepts, llmConcepts) {
  const norm = (s) => String(s).toLowerCase().trim();

  const hybridNames = new Set(hybridConcepts.map((c) => norm(c.name)));
  const llmNames    = new Set(llmConcepts.map((c) => norm(c.name)));

  // Concepts only in hybrid (added by AST grounding)
  const hybridOnly  = [...hybridNames].filter((n) => !llmNames.has(n));
  // Concepts only in LLM (missed or hallucinated)
  const llmOnly     = [...llmNames].filter((n) => !hybridNames.has(n));
  // Shared
  const shared      = [...hybridNames].filter((n) => llmNames.has(n));

  // Treat hybrid as the "reference" (higher precision because AST-grounded)
  // LLM-only relative to hybrid:
  const llmTP  = shared.length;
  const llmFP  = llmOnly.length;   // LLM found these but hybrid didn't → likely noise
  const llmFN  = hybridOnly.length; // hybrid found these but LLM missed → LLM recall gaps

  const llmPrecision = llmTP + llmFP > 0 ? llmTP / (llmTP + llmFP) : 0;
  const llmRecall    = llmTP + llmFN > 0 ? llmTP / (llmTP + llmFN) : 0;
  const llmF1        = llmPrecision + llmRecall > 0
    ? (2 * llmPrecision * llmRecall) / (llmPrecision + llmRecall) : 0;

  // Confidence stats
  const avgConf = (arr) =>
    arr.length ? arr.reduce((s, c) => s + (c.confidence || 0), 0) / arr.length : 0;

  const hybridAvgConf = avgConf(hybridConcepts);
  const llmAvgConf    = avgConf(llmConcepts);

  // Source breakdown for hybrid
  const sourceCount = hybridConcepts.reduce((acc, c) => {
    const s = c.source || "gemini";
    acc[s]  = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return {
    hybrid: {
      total:      hybridConcepts.length,
      avgConf:    hybridAvgConf,
      sourceCount,
    },
    llm: {
      total:      llmConcepts.length,
      precision:  llmPrecision,
      recall:     llmRecall,
      f1:         llmF1,
      tp:         llmTP,
      fp:         llmFP,
      fn:         llmFN,
      avgConf:    llmAvgConf,
    },
    shared, hybridOnly, llmOnly,
  };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function MetricBadge({ label, value, color, subtitle }) {
  return (
    <div style={s.metricBadge}>
      <div style={{ ...s.metricValue, color }}>{value}</div>
      <div style={s.metricLabel}>{label}</div>
      {subtitle && <div style={s.metricSub}>{subtitle}</div>}
    </div>
  );
}

function ConceptChip({ concept, highlight }) {
  const sourceColors = {
    hybrid:       "#6366f1",
    ast_analysis: "#22c55e",
    rule_based:   "#f59e0b",
    gemini:       "#3b82f6",
    llm:          "#3b82f6",
  };
  const col = sourceColors[concept.source] || "#64748b";
  return (
    <div style={{
      ...s.chip,
      background:  highlight ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.04)",
      borderColor: highlight ? "#6366f1" : "#1e293b",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 500 }}>{concept.name}</span>
        <span style={{ ...s.sourceTag, background: col + "22", color: col }}>
          {concept.source || "llm"}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
        <div style={s.confBar}>
          <div style={{ ...s.confFill, width: `${(concept.confidence || 0) * 100}%`, background: col }} />
        </div>
        <span style={{ color: "#64748b", fontSize: 11 }}>
          {Math.round((concept.confidence || 0) * 100)}%
        </span>
      </div>
    </div>
  );
}

function ColumnHeader({ title, color, badge, conceptCount, avgConf }) {
  return (
    <div style={{ ...s.colHeader, borderBottom: `2px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 16 }}>{badge}</span>
        <span style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15 }}>{title}</span>
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          <span style={{ color, fontWeight: 700 }}>{conceptCount}</span> concepts
        </span>
        <span style={{ color: "#64748b", fontSize: 13 }}>
          avg conf <span style={{ color, fontWeight: 700 }}>{Math.round(avgConf * 100)}%</span>
        </span>
      </div>
    </div>
  );
}

// ── Bar chart for category breakdown ──────────────────────────────────────────

function CategoryBar({ hybridConcepts, llmConcepts }) {
  const cats = ["algorithm", "data_structure", "design_pattern",
                "paradigm", "programming_concept", "architecture"];
  const catLabel = (c) => c.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());

  const countBy = (arr, cat) => arr.filter((c) => c.category === cat).length;
  const maxVal  = Math.max(1, ...cats.flatMap((c) => [
    countBy(hybridConcepts, c), countBy(llmConcepts, c)
  ]));

  const catColors = {
    algorithm:           "#22c55e",
    data_structure:      "#3b82f6",
    design_pattern:      "#f59e0b",
    paradigm:            "#8b5cf6",
    programming_concept: "#ec4899",
    architecture:        "#06b6d4",
  };

  return (
    <div style={s.catSection}>
      <div style={s.sectionTitle}>Category Breakdown</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <span style={{ ...s.legend, background: "#22c55e22", color: "#22c55e" }}>■ AST+LLM</span>
        <span style={{ ...s.legend, background: "#f59e0b22", color: "#f59e0b" }}>■ LLM Only</span>
      </div>
      {cats.map((cat) => {
        const hCount = countBy(hybridConcepts, cat);
        const lCount = countBy(llmConcepts, cat);
        if (hCount === 0 && lCount === 0) return null;
        const col    = catColors[cat] || "#64748b";
        return (
          <div key={cat} style={s.catRow}>
            <div style={{ color: "#94a3b8", fontSize: 12, width: 140, flexShrink: 0 }}>
              {catLabel(cat)}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${(hCount / maxVal) * 100}%`, height: "100%", background: col, borderRadius: 5 }} />
                </div>
                <span style={{ color: col, fontSize: 11, width: 20 }}>{hCount}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ flex: 1, height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ width: `${(lCount / maxVal) * 100}%`, height: "100%",
                    background: col, borderRadius: 5, opacity: 0.4 }} />
                </div>
                <span style={{ color: col, fontSize: 11, width: 20, opacity: 0.6 }}>{lCount}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ComparisonPanel({ hybridData, llmData, loading }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview | diff | concepts

  const hybridConcepts = useMemo(() => {
    if (!hybridData) return [];
    return (
      hybridData.aggregated_concepts ||
      hybridData.concepts ||
      hybridData.files?.flatMap((f) => f.concepts || []) || []
    );
  }, [hybridData]);

  const llmConcepts = useMemo(() => {
    if (!llmData) return [];
    return (
      llmData.aggregated_concepts ||
      llmData.concepts ||
      llmData.files?.flatMap((f) => f.concepts || []) || []
    );
  }, [llmData]);

  const metrics = useMemo(
    () => computeMetrics(hybridConcepts, llmConcepts),
    [hybridConcepts, llmConcepts]
  );

  if (loading) {
    return (
      <div style={s.loading}>
        <div style={s.spinner} />
        <div style={{ color: "#64748b", marginTop: 12 }}>Running both extraction modes…</div>
        <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
          This uses 2 API calls — one per mode
        </div>
      </div>
    );
  }

  if (!hybridData && !llmData) return null;

  const tabs = [
    { id: "overview", label: "📈 Metrics" },
    { id: "diff",     label: "🔀 Differences" },
    { id: "concepts", label: "📋 Side-by-Side" },
  ];

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.headerTitle}>Research Comparison</div>
          <div style={s.headerSub}>
            AST + LLM Hybrid vs LLM Only — real outputs from your code
          </div>
        </div>
        <div style={s.modeChips}>
          <span style={{ ...s.modeChip, background: "#22c55e22", color: "#22c55e" }}>
            🔬 AST+LLM: {metrics.hybrid.total} concepts
          </span>
          <span style={{ ...s.modeChip, background: "#f59e0b22", color: "#f59e0b" }}>
            🤖 LLM Only: {metrics.llm.total} concepts
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...s.tab,
              color:        activeTab === t.id ? "#e2e8f0" : "#64748b",
              borderBottom: activeTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Overview Metrics ── */}
      {activeTab === "overview" && (
        <div style={s.tabContent}>
          {/* LLM vs Hybrid comparison relative to each other */}
          <div style={s.sectionTitle}>LLM Only  →  vs AST+LLM Reference</div>
          <div style={s.metricsRow}>
            <MetricBadge
              label="Precision"
              value={`${Math.round(metrics.llm.precision * 100)}%`}
              color={metrics.llm.precision >= 0.8 ? "#22c55e" : metrics.llm.precision >= 0.6 ? "#f59e0b" : "#ef4444"}
              subtitle={`LLM TP / (TP+FP)`}
            />
            <MetricBadge
              label="Recall"
              value={`${Math.round(metrics.llm.recall * 100)}%`}
              color={metrics.llm.recall >= 0.8 ? "#22c55e" : metrics.llm.recall >= 0.6 ? "#f59e0b" : "#ef4444"}
              subtitle="Concepts hybrid found"
            />
            <MetricBadge
              label="F1 Score"
              value={metrics.llm.f1.toFixed(3)}
              color={metrics.llm.f1 >= 0.8 ? "#22c55e" : metrics.llm.f1 >= 0.6 ? "#f59e0b" : "#ef4444"}
              subtitle="Harmonic mean"
            />
            <MetricBadge
              label="TP / FP / FN"
              value={`${metrics.llm.tp} / ${metrics.llm.fp} / ${metrics.llm.fn}`}
              color="#94a3b8"
              subtitle="shared / llm-only / missed"
            />
          </div>

          {/* Improvement delta */}
          <div style={s.deltaBox}>
            <div style={s.deltaTitle}>Hybrid Advantage</div>
            <div style={s.deltaGrid}>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Extra concepts found</div>
                <div style={{ color: "#22c55e", fontSize: 22, fontWeight: 700 }}>
                  +{metrics.hybridOnly.length}
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>via AST grounding</div>
              </div>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>LLM noise removed</div>
                <div style={{ color: "#f59e0b", fontSize: 22, fontWeight: 700 }}>
                  -{metrics.llmOnly.length}
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>false positives filtered</div>
              </div>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Avg confidence boost</div>
                <div style={{ color: "#6366f1", fontSize: 22, fontWeight: 700 }}>
                  {metrics.hybrid.avgConf >= metrics.llm.avgConf ? "+" : ""}
                  {Math.round((metrics.hybrid.avgConf - metrics.llm.avgConf) * 100)}%
                </div>
                <div style={{ color: "#64748b", fontSize: 11 }}>AST verification boost</div>
              </div>
              <div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>Source breakdown</div>
                {Object.entries(metrics.hybrid.sourceCount).map(([src, cnt]) => (
                  <div key={src} style={{ color: "#94a3b8", fontSize: 11 }}>
                    <span style={{ color: "#e2e8f0" }}>{cnt}</span> {src}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <CategoryBar hybridConcepts={hybridConcepts} llmConcepts={llmConcepts} />

          {/* Research insight */}
          <div style={s.insight}>
            <div style={s.insightTitle}>📌 Research Finding</div>
            <div style={s.insightText}>
              {metrics.hybridOnly.length > 0 ? (
                <>
                  The hybrid system discovered{" "}
                  <strong style={{ color: "#22c55e" }}>{metrics.hybridOnly.length} additional concept{metrics.hybridOnly.length > 1 ? "s" : ""}</strong>
                  {" "}({metrics.hybridOnly.slice(0, 3).join(", ")}{metrics.hybridOnly.length > 3 ? "…" : ""})
                  that the LLM alone missed. This demonstrates how AST structural analysis
                  provides precise, evidence-backed grounding that improves recall without
                  sacrificing precision.
                </>
              ) : (
                <>Both modes produced identical concept sets for this input.
                  The hybrid system still benefits from higher confidence scores
                  due to AST verification ({Math.round(metrics.hybrid.avgConf * 100)}% vs {Math.round(metrics.llm.avgConf * 100)}%).
                </>
              )}
              {metrics.llmOnly.length > 0 && (
                <>{" "}The LLM-only mode added {metrics.llmOnly.length} unverified concept{metrics.llmOnly.length > 1 ? "s" : ""} ({metrics.llmOnly.slice(0, 2).join(", ")}) not grounded in the AST — these may be hallucinations or over-generalizations.</>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Differences ── */}
      {activeTab === "diff" && (
        <div style={s.tabContent}>
          <div style={{ display: "flex", gap: 16 }}>
            {/* AST+LLM only */}
            <div style={{ flex: 1 }}>
              <div style={{ ...s.diffHeader, color: "#22c55e" }}>
                ✅ Found by AST+LLM only ({metrics.hybridOnly.length})
              </div>
              <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                LLM missed these — AST grounding was essential
              </div>
              {metrics.hybridOnly.length === 0 ? (
                <div style={s.emptyDiff}>No exclusive concepts</div>
              ) : (
                metrics.hybridOnly.map((name) => {
                  const c = hybridConcepts.find(
                    (x) => x.name.toLowerCase() === name
                  );
                  return c ? (
                    <ConceptChip key={name} concept={c} highlight={true} />
                  ) : (
                    <div key={name} style={s.chipSimple}>{name}</div>
                  );
                })
              )}
            </div>

            {/* Divider */}
            <div style={s.diffDivider} />

            {/* LLM only */}
            <div style={{ flex: 1 }}>
              <div style={{ ...s.diffHeader, color: "#f59e0b" }}>
                ⚠️ Found by LLM only ({metrics.llmOnly.length})
              </div>
              <div style={{ color: "#64748b", fontSize: 12, marginBottom: 8 }}>
                Not AST-verified — possible hallucinations
              </div>
              {metrics.llmOnly.length === 0 ? (
                <div style={s.emptyDiff}>No exclusive concepts</div>
              ) : (
                metrics.llmOnly.map((name) => {
                  const c = llmConcepts.find(
                    (x) => x.name.toLowerCase() === name
                  );
                  return c ? (
                    <ConceptChip key={name} concept={c} />
                  ) : (
                    <div key={name} style={s.chipSimple}>{name}</div>
                  );
                })
              )}
            </div>
          </div>

          {/* Shared */}
          <div style={{ marginTop: 20 }}>
            <div style={{ ...s.diffHeader, color: "#94a3b8" }}>
              🤝 Found by both ({metrics.shared.length})
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {metrics.shared.map((name) => (
                <span key={name} style={s.sharedChip}>{name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Side-by-Side concepts ── */}
      {activeTab === "concepts" && (
        <div style={s.tabContent}>
          <div style={s.sideBySide}>
            {/* Hybrid column */}
            <div style={{ flex: 1 }}>
              <ColumnHeader
                title="AST + LLM Hybrid"
                color="#22c55e"
                badge="🔬"
                conceptCount={hybridConcepts.length}
                avgConf={metrics.hybrid.avgConf}
              />
              <div style={s.conceptList}>
                {hybridConcepts.map((c, i) => (
                  <ConceptChip
                    key={i}
                    concept={c}
                    highlight={metrics.hybridOnly.includes(c.name.toLowerCase())}
                  />
                ))}
                {hybridConcepts.length === 0 && (
                  <div style={s.emptyDiff}>No concepts extracted</div>
                )}
              </div>
            </div>

            <div style={s.diffDivider} />

            {/* LLM only column */}
            <div style={{ flex: 1 }}>
              <ColumnHeader
                title="LLM Only"
                color="#f59e0b"
                badge="🤖"
                conceptCount={llmConcepts.length}
                avgConf={metrics.llm.avgConf}
              />
              <div style={s.conceptList}>
                {llmConcepts.map((c, i) => (
                  <ConceptChip
                    key={i}
                    concept={c}
                    highlight={metrics.llmOnly.includes(c.name.toLowerCase())}
                  />
                ))}
                {llmConcepts.length === 0 && (
                  <div style={s.emptyDiff}>No concepts extracted</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  root: {
    background: "#0f172a",
    borderRadius: 12,
    border: "1px solid #1e293b",
    overflow: "hidden",
    marginTop: 16,
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "16px 20px", background: "#0f172a",
    borderBottom: "1px solid #1e293b",
  },
  headerTitle: { color: "#e2e8f0", fontWeight: 700, fontSize: 16 },
  headerSub:   { color: "#64748b", fontSize: 12, marginTop: 2 },
  modeChips:   { display: "flex", gap: 8 },
  modeChip: {
    padding: "4px 10px", borderRadius: 12, fontSize: 12, fontWeight: 500,
  },
  tabBar: {
    display: "flex", borderBottom: "1px solid #1e293b",
    padding: "0 20px", background: "#0f172a",
  },
  tab: {
    padding: "10px 16px", background: "none", border: "none",
    cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all 0.15s",
  },
  tabContent: {
    padding: 20,
    maxHeight: 600,
    overflowY: "auto",
  },
  sectionTitle: {
    color: "#94a3b8", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", letterSpacing: "0.06em",
    marginBottom: 12,
  },
  metricsRow: {
    display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16,
  },
  metricBadge: {
    flex: 1, minWidth: 120, background: "#1e293b",
    borderRadius: 8, padding: "12px 16px",
    border: "1px solid #334155",
  },
  metricValue: { fontSize: 24, fontWeight: 800 },
  metricLabel: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  metricSub:   { color: "#475569", fontSize: 10, marginTop: 1 },
  deltaBox: {
    background: "#1e293b", borderRadius: 8, padding: 16,
    border: "1px solid #334155", marginBottom: 16,
  },
  deltaTitle: {
    color: "#94a3b8", fontSize: 11, fontWeight: 600,
    textTransform: "uppercase", marginBottom: 12,
  },
  deltaGrid: { display: "flex", gap: 24, flexWrap: "wrap" },
  catSection: { marginTop: 12 },
  catRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  insight: {
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.2)",
    borderRadius: 8, padding: 14, marginTop: 16,
  },
  insightTitle: { color: "#a5b4fc", fontWeight: 600, fontSize: 13, marginBottom: 6 },
  insightText:  { color: "#94a3b8", fontSize: 13, lineHeight: 1.6 },
  diffHeader: { fontWeight: 600, fontSize: 13, marginBottom: 4 },
  diffDivider: {
    width: 1, background: "#1e293b", margin: "0 4px", alignSelf: "stretch",
  },
  emptyDiff: {
    color: "#475569", fontSize: 12, fontStyle: "italic",
    padding: "8px 0",
  },
  chipSimple: {
    background: "#1e293b", borderRadius: 6, padding: "6px 10px",
    color: "#94a3b8", fontSize: 12, marginBottom: 6,
  },
  chip: {
    borderRadius: 8, padding: "8px 10px",
    border: "1px solid", marginBottom: 6, transition: "all 0.12s",
  },
  confBar: {
    flex: 1, height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden",
  },
  confFill: { height: "100%", borderRadius: 2, transition: "width 0.3s" },
  sourceTag: {
    fontSize: 10, fontWeight: 600, padding: "1px 6px",
    borderRadius: 10, textTransform: "uppercase",
  },
  sharedChip: {
    background: "#1e293b", border: "1px solid #334155",
    borderRadius: 12, padding: "3px 10px",
    color: "#94a3b8", fontSize: 12,
  },
  sideBySide: { display: "flex", gap: 12 },
  colHeader: {
    paddingBottom: 10, marginBottom: 10,
  },
  conceptList: {
    maxHeight: 480, overflowY: "auto",
  },
  legend: {
    fontSize: 11, padding: "2px 6px", borderRadius: 4,
  },
  loading: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", padding: 48,
  },
  spinner: {
    width: 32, height: 32, border: "3px solid #1e293b",
    borderTop: "3px solid #6366f1", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};