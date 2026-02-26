import { useEffect, useState } from "react";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
  if (!userId) {
    setProfile({ totalSolved: 0, skillLevel: "Beginner", sessions: [], weaknessHistory: {} });
    return;
  }
  fetch(`http://localhost:5000/api/progress/${userId}`)
    .then(r => r.json())
    .then(data => setProfile(data))
    .catch(() => {
      // If server fails, show empty profile
      setProfile({ totalSolved: 0, skillLevel: "Beginner", sessions: [], weaknessHistory: {} });
    });
}, []);

  if (!profile) return <p style={{ color: "white", textAlign: "center" }}>Loading profile...</p>;

  const weaknessEntries = Object.entries(profile.weaknessHistory || {});

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "32px", color: "#e5e7eb", fontFamily: "Inter, sans-serif" }}>
        <h2>Welcome, {userName || "Student"}</h2>
      <h2 style={{ textAlign: "center", background: "linear-gradient(90deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "32px" }}>
        My Learning Profile
      </h2>

      <div style={{ background: "rgba(2,6,23,0.85)", border: "1px solid #1e40af", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
        <h3 style={{ color: "#93c5fd" }}>Current Skill Level</h3>
        <p style={{ fontSize: "24px", fontWeight: "bold", color: "#a78bfa" }}>{profile.skillLevel}</p>
        <p style={{ color: "#c7d2fe" }}>Tasks Solved: <strong>{profile.totalSolved}</strong></p>

        {/* Level progress bar */}
        <div style={{ marginTop: "12px" }}>
          <p style={{ color: "#93c5fd", marginBottom: "6px" }}>
            {profile.skillLevel === "Beginner" && `Progress to Intermediate: ${profile.totalSolved}/10`}
            {profile.skillLevel === "Intermediate" && `Progress to Advanced: ${profile.totalSolved}/25`}
            {profile.skillLevel === "Advanced" && "🏆 Max Level Reached!"}
          </p>
          <div style={{ background: "#1e293b", borderRadius: "8px", height: "12px" }}>
            <div style={{
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
              borderRadius: "8px",
              height: "12px",
              width: `${Math.min(
                profile.skillLevel === "Beginner" ? (profile.totalSolved / 10) * 100 :
                profile.skillLevel === "Intermediate" ? (profile.totalSolved / 25) * 100 : 100, 100
              )}%`
            }} />
          </div>
        </div>
      </div>

      {weaknessEntries.length > 0 && (
        <div style={{ background: "rgba(2,6,23,0.85)", border: "1px solid #1e40af", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ color: "#93c5fd" }}>Weaknesses Overcome</h3>
          {weaknessEntries.map(([weakness, count]) => (
            <p key={weakness} style={{ color: "#c7d2fe" }}>
              <strong style={{ color: "#a78bfa" }}>{weakness.replace(/_/g, " ")}</strong>: solved {count} time{count > 1 ? "s" : ""}
            </p>
          ))}
        </div>
      )}

      <div style={{ background: "rgba(2,6,23,0.85)", border: "1px solid #1e40af", borderRadius: "16px", padding: "24px" }}>
        <h3 style={{ color: "#93c5fd" }}>Recent Sessions</h3>
        {profile.sessions.slice(-5).reverse().map((s, i) => (
          <div key={i} style={{ borderBottom: "1px solid #1e40af", paddingBottom: "12px", marginBottom: "12px" }}>
            <p style={{ color: "#e5e7eb" }}>{s.task}</p>
            <p style={{ color: s.solved ? "#4ade80" : "#f87171", fontSize: "14px" }}>
              {s.solved ? "✅ Solved" : "❌ Not solved"} — {s.weakness || "no weakness"} — {s.skillLevel}
            </p>
            <p style={{ color: "#6b7280", fontSize: "12px" }}>{new Date(s.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}