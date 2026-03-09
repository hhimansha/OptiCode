// ExtractionModeToggle.jsx — IT22601360
import React from "react";

const MODES = [
  {
    id: "hybrid",
    label: "AST + LLM",
    badge: "Hybrid",
    badgeColor: "#22c55e",
    description: "Static AST analysis grounded with Gemini AI",
    icon: "🔬",
  },
  {
    id: "llm_only",
    label: "LLM Only",
    badge: "Baseline",
    badgeColor: "#f59e0b",
    description: "Gemini AI with raw code only — no AST context",
    icon: "🤖",
  },
  {
    id: "compare",
    label: "Compare Both",
    badge: "Research",
    badgeColor: "#6366f1",
    description: "Run both modes and display the difference",
    icon: "📊",
  },
];

export default function ExtractionModeToggle({ mode, onChange, disabled }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.label}>Extraction Mode</div>
      <div style={styles.pills}>
        {MODES.map((m) => {
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => !disabled && onChange(m.id)}
              disabled={disabled}
              title={m.description}
              style={{
                ...styles.pill,
                background: active ? m.badgeColor : "transparent",
                color: active ? "#fff" : "#94a3b8",
                border: `1.5px solid ${active ? m.badgeColor : "#334155"}`,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <span style={{ marginRight: 5 }}>{m.icon}</span>
              {m.label}
              {active && (
                <span style={{ ...styles.activeDot, background: "#fff" }} />
              )}
            </button>
          );
        })}
      </div>
      <div style={styles.desc}>
        {MODES.find((m) => m.id === mode)?.description}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "12px 0",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  pills: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s ease",
    outline: "none",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    marginLeft: 4,
    display: "inline-block",
  },
  desc: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
};