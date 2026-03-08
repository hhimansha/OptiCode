import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      setProfile({
        totalSolved: 0,
        totalXP: 0,
        skillLevel: "Beginner",
        sessions: [],
        weaknessHistory: {},
        conceptProgress: {},
        preferredLearningMode: "level_up",
        targetConcept: null,
        levelUpProgress: null
      });
      return;
    }

    fetch(`http://localhost:5000/api/progress/${userId}`)
      .then((r) => r.json())
      .then(setProfile)
      .catch(() =>
        setProfile({
          totalSolved: 0,
          totalXP: 0,
          skillLevel: "Beginner",
          sessions: [],
          weaknessHistory: {},
          conceptProgress: {},
          preferredLearningMode: "level_up",
          targetConcept: null,
          levelUpProgress: null
        })
      );
  }, []);

  if (!profile) {
    return <p style={{ color: "white", textAlign: "center" }}>Loading profile...</p>;
  }

  const lup = profile.levelUpProgress;
  const weaknessEntries = Object.entries(profile.weaknessHistory || {});

  const conceptEntries = Object.entries(profile.conceptProgress || {});
  const sortedWeakConcepts = [...conceptEntries].sort(
    (a, b) => (a[1]?.mastery || 0) - (b[1]?.mastery || 0)
  );
  const topWeakConcepts = sortedWeakConcepts.slice(0, 3);

  const card = {
    background: "rgba(2,6,23,0.85)",
    border: "1px solid #1e40af",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px"
  };

  const skillColor = {
    Beginner: "#4ade80",
    Intermediate: "#facc15",
    Advanced: "#f472b6"
  };

  const conceptLabel = (name) => {
    if (!name) return "General";
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const modeLabel = (mode) => {
    if (mode === "improve_concept") return "Improve Weak Concept";
    return "Level Up";
  };

  const Bar = ({
    percent,
    color = "linear-gradient(90deg,#2563eb,#7c3aed)",
    label,
    value
  }) => (
    <div style={{ marginBottom: "14px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "5px"
        }}
      >
        <span style={{ color: "#c7d2fe", fontSize: "13px" }}>{label}</span>
        <span style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "bold" }}>
          {value}
        </span>
      </div>
      <div style={{ background: "#1e293b", borderRadius: "8px", height: "10px" }}>
        <div
          style={{
            background: color,
            borderRadius: "8px",
            height: "10px",
            width: `${Math.min(percent, 100)}%`,
            transition: "width 0.5s ease"
          }}
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        maxWidth: "820px",
        margin: "40px auto",
        padding: "32px",
        color: "#e5e7eb",
        fontFamily: "Inter, sans-serif"
      }}
    >
      <button
        onClick={() => navigate("/exercise")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: "rgba(99,102,241,0.15)",
          border: "1px solid #6366f1",
          borderRadius: "10px",
          color: "#a5b4fc",
          padding: "8px 18px",
          fontSize: "14px",
          cursor: "pointer",
          marginBottom: "16px"
        }}
      >
        ← Back to Task
      </button>

      <p style={{ color: "#94a3b8", margin: 0 }}>Welcome, {userName || "Student"}</p>

      <h2
        style={{
          textAlign: "center",
          background: "linear-gradient(90deg,#60a5fa,#a78bfa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "30px",
          marginBottom: "24px"
        }}
      >
        My Learning Profile
      </h2>

      {/* ── Current Level ── */}
      <div style={card}>
        <h3 style={{ color: "#93c5fd", marginBottom: "8px" }}>Current Skill Level</h3>

        <p
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: skillColor[profile.skillLevel] || "#a78bfa",
            margin: "0 0 8px"
          }}
        >
          {profile.skillLevel} {profile.skillLevel === "Advanced" ? "🏆" : ""}
        </p>

        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <p style={{ color: "#c7d2fe", margin: 0 }}>
            Tasks Solved: <strong>{profile.totalSolved}</strong>
          </p>
          <p style={{ color: "#facc15", margin: 0 }}>
            ⭐ Total XP: <strong>{profile.totalXP?.toFixed(1) || 0}</strong>
          </p>
          {profile.avgSolveTime > 0 && (
            <p style={{ color: "#60a5fa", margin: 0 }}>
              ⏱ Avg Time: <strong>{profile.avgSolveTime}s</strong>
            </p>
          )}
          {profile.consecutiveCleanSolves > 0 && (
            <p style={{ color: "#4ade80", margin: 0 }}>
              🔥 Clean Streak: <strong>{profile.consecutiveCleanSolves}</strong>
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: "12px",
            display: "inline-block",
            padding: "4px 14px",
            background: "rgba(99,102,241,0.2)",
            borderRadius: "20px",
            border: "1px solid #6366f1"
          }}
        >
          <span style={{ color: "#a5b4fc", fontSize: "13px" }}>
            🧠 BKT Mastery Probability:{" "}
            <strong>{((profile.bktMastery || 0) * 100).toFixed(1)}%</strong>
          </span>
        </div>

        <div
          style={{
            marginTop: "10px",
            display: "inline-block",
            marginLeft: "10px",
            padding: "4px 14px",
            background: "rgba(14,165,233,0.15)",
            borderRadius: "20px",
            border: "1px solid #0ea5e9"
          }}
        >
          <span style={{ color: "#7dd3fc", fontSize: "13px" }}>
            🎯 Mode: <strong>{modeLabel(profile.preferredLearningMode)}</strong>
            {profile.targetConcept ? ` • ${conceptLabel(profile.targetConcept)}` : ""}
          </span>
        </div>

        {profile.zpd_boost && (
          <div
            style={{
              marginTop: "10px",
              display: "inline-block",
              padding: "4px 14px",
              background: "rgba(234,179,8,0.15)",
              borderRadius: "20px",
              border: "1px solid #eab308"
            }}
          >
            <span style={{ color: "#fde047", fontSize: "13px" }}>
              ⚡ ZPD Boost Active — You're solving{" "}
              {profile.skillLevel === "Beginner" ? "Intermediate" : "Advanced"} level
              tasks!
            </span>
          </div>
        )}
      </div>

      {/* ── Level-Up Progress ── */}
      {lup && !lup.atMaxLevel && (
        <div style={card}>
          <h3 style={{ color: "#93c5fd", marginBottom: "16px" }}>
            Progress to {lup.nextLevel}
          </h3>

          <Bar
            label="🧠 BKT Mastery (Bayesian Knowledge Tracing)"
            value={`${(lup.bktMastery * 100).toFixed(1)}% / ${lup.bktTarget * 100}% required`}
            percent={lup.bktPercent}
            color="linear-gradient(90deg,#6366f1,#a78bfa)"
          />

          <Bar
            label="✅ Tasks Solved at This Level"
            value={`${lup.solvedAtCurrentLevel} / ${lup.minSolved} required`}
            percent={lup.solvedPercent}
            color="linear-gradient(90deg,#4ade80,#22d3ee)"
          />

          <Bar
            label="🎯 Recent Accuracy (last 10 tasks)"
            value={`${(lup.accuracy * 100).toFixed(0)}% / ${lup.minAccuracy * 100}% required`}
            percent={lup.accuracyPercent}
            color={
              lup.accuracy >= lup.minAccuracy
                ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                : "linear-gradient(90deg,#f59e0b,#ef4444)"
            }
          />

          <Bar
            label={`⚡ Avg Solve Time (target: under ${lup.maxAvgTime}s)`}
            value={
              lup.avgSolveTime > 0
                ? `${lup.avgSolveTime}s ${lup.timeOk ? "✅" : "❌"}`
                : "N/A — solve more tasks"
            }
            percent={
              lup.avgSolveTime > 0
                ? Math.max(0, 100 - Math.round((lup.avgSolveTime / lup.maxAvgTime) * 100))
                : 0
            }
            color="linear-gradient(90deg,#f59e0b,#fb923c)"
          />

          <Bar
            label="💎 Consecutive Clean Solves (no hints needed)"
            value={`${lup.consecutiveCleanSolves} / ${lup.minConsecutiveCorrect} required`}
            percent={lup.cleanPercent}
            color="linear-gradient(90deg,#818cf8,#c084fc)"
          />

          <div
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              background: "rgba(99,102,241,0.1)",
              borderRadius: "10px",
              border: "1px solid #4338ca"
            }}
          >
            <p
              style={{
                color: "#a5b4fc",
                fontSize: "12px",
                margin: "0 0 4px",
                fontWeight: "bold"
              }}
            >
              💡 How to level up faster:
            </p>
            <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
              Solve without hints (+Bloom XP) • Solve quickly under {lup.maxAvgTime}s
              (+speed bonus) • Solve {lup.minConsecutiveCorrect} tasks in a row cleanly •
              BKT mastery updates every attempt automatically
            </p>
          </div>

          <p
            style={{
              color: "#475569",
              fontSize: "11px",
              marginTop: "10px",
              fontStyle: "italic"
            }}
          >
            Level-up model based on: BKT (Corbett & Anderson, 1994) + Khan Academy
            mastery thresholds + Duolingo speed adaptation + Codecademy Bloom's
            Taxonomy XP
          </p>
        </div>
      )}

      {/* ── Max level ── */}
      {lup?.atMaxLevel && (
        <div style={{ ...card, textAlign: "center", border: "1px solid #f472b6" }}>
          <p style={{ fontSize: "40px", margin: 0 }}>🏆</p>
          <h3 style={{ color: "#f472b6" }}>Maximum Level Reached!</h3>
          <p style={{ color: "#c7d2fe" }}>
            You have mastered Python at the Advanced level. Keep going!
          </p>
        </div>
      )}

      {/* ── Concept Mastery ── */}
      <div style={card}>
        <h3 style={{ color: "#93c5fd", marginBottom: "12px" }}>Concept Mastery</h3>

        {!conceptEntries.length && (
          <p style={{ color: "#6b7280" }}>
            No concept mastery data yet. Start solving tasks to build your concept map.
          </p>
        )}

        {conceptEntries.length > 0 &&
          conceptEntries
            .sort((a, b) => (b[1]?.mastery || 0) - (a[1]?.mastery || 0))
            .map(([concept, stats]) => {
              const mastery = stats?.mastery || 0;
              const attempts = stats?.attempts || 0;
              const solved = stats?.solved || 0;
              const accuracy = attempts > 0 ? Math.round((solved / attempts) * 100) : 0;

              return (
                <Bar
                  key={concept}
                  label={`📘 ${conceptLabel(concept)}`}
                  value={`${(mastery * 100).toFixed(1)}% mastery • ${solved}/${attempts} solved • ${accuracy}% accuracy`}
                  percent={Math.round(mastery * 100)}
                  color={
                    mastery >= 0.8
                      ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                      : mastery >= 0.5
                      ? "linear-gradient(90deg,#f59e0b,#fb923c)"
                      : "linear-gradient(90deg,#ef4444,#f97316)"
                  }
                />
              );
            })}
      </div>

      {/* ── Weakest Concepts ── */}
      {topWeakConcepts.length > 0 && (
        <div style={card}>
          <h3 style={{ color: "#93c5fd", marginBottom: "12px" }}>
            Concepts to Improve Next
          </h3>

          {topWeakConcepts.map(([concept, stats]) => (
            <div
              key={concept}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                alignItems: "center"
              }}
            >
              <span style={{ color: "#c7d2fe" }}>
                <strong style={{ color: "#f59e0b" }}>{conceptLabel(concept)}</strong>
              </span>
              <span style={{ color: "#fbbf24", fontSize: "13px" }}>
                mastery {((stats?.mastery || 0) * 100).toFixed(1)}%
              </span>
            </div>
          ))}

          <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "10px" }}>
            Switch to <strong>Improve Weak Concept</strong> mode to practice these areas
            directly.
          </p>
        </div>
      )}

      {/* ── Weaknesses Overcome ── */}
      {weaknessEntries.length > 0 && (
        <div style={card}>
          <h3 style={{ color: "#93c5fd", marginBottom: "12px" }}>Weaknesses Overcome</h3>
          {weaknessEntries.map(([weakness, count]) => (
            <div
              key={weakness}
              style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}
            >
              <span style={{ color: "#c7d2fe" }}>
                <strong style={{ color: "#a78bfa" }}>
                  {weakness.replace(/_/g, " ")}
                </strong>
              </span>
              <span style={{ color: "#4ade80", fontSize: "13px" }}>
                ✅ solved {count} time{count > 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Sessions ── */}
      <div style={card}>
        <h3 style={{ color: "#93c5fd", marginBottom: "12px" }}>Recent Sessions</h3>

        {!profile.sessions?.length && (
          <p style={{ color: "#6b7280" }}>No sessions yet. Start coding!</p>
        )}

        {profile.sessions?.slice(-5).reverse().map((s, i) => (
          <div
            key={i}
            style={{
              borderBottom: "1px solid #1e40af",
              paddingBottom: "10px",
              marginBottom: "10px"
            }}
          >
            <p style={{ color: "#e5e7eb", marginBottom: "4px", fontSize: "14px" }}>
              {s.task}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <span
                style={{
                  color: s.solved ? "#4ade80" : "#f87171",
                  fontSize: "13px"
                }}
              >
                {s.solved ? "✅ Solved" : "❌ Not solved"}
              </span>

              {s.weakness && (
                <span style={{ color: "#fbbf24", fontSize: "13px" }}>
                  ⚠ {s.weakness.replace(/_/g, " ")}
                </span>
              )}

              {s.concept && (
                <span style={{ color: "#22d3ee", fontSize: "13px" }}>
                  📘 {conceptLabel(s.concept)}
                </span>
              )}

              {s.learningMode && (
                <span style={{ color: "#c084fc", fontSize: "13px" }}>
                  🎯 {modeLabel(s.learningMode)}
                </span>
              )}

              <span style={{ color: "#94a3b8", fontSize: "13px" }}>{s.skillLevel}</span>

              {s.timeTakenSeconds > 0 && (
                <span style={{ color: "#60a5fa", fontSize: "13px" }}>
                  ⏱ {s.timeTakenSeconds}s
                </span>
              )}
            </div>

            <p style={{ color: "#475569", fontSize: "11px", marginTop: "4px" }}>
              {new Date(s.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}