// server/realtime.js
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import { Server } from "socket.io";
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";

/* ----------------- create server ----------------- */
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

/* ----------------- utils: write temp file ----------------- */
function writeTempFile(prefix, ext, content) {
  const filename = path.join(
    os.tmpdir(),
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  );
  fs.writeFileSync(filename, content, "utf8");
  return filename;
}

/* ----------------- analyzer functions ----------------- */
// Run eslint via npx (fast), returns parsed JSON messages
function runEslintOnCode(code) {
  const tmp = writeTempFile("tmpcode", "js", code);
  try {
    const proc = spawnSync(
      "npx",
      ["eslint", tmp, "--format", "json", "--no-eslintrc"],
      { encoding: "utf8", timeout: 3000 }
    );
    const stdout = proc.stdout || "";
    fs.unlinkSync(tmp);

    if (!stdout.trim()) return { ok: true, json: [] };
    const json = JSON.parse(stdout);
    return { ok: true, json };
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch (e) {}
    return { ok: false, error: err.message };
  }
}

// Run pyflakes for Python
function runPyflakesOnCode(code) {
  const tmp = writeTempFile("tmpcode", "py", code);
  try {
    const proc = spawnSync("pyflakes", [tmp], {
      encoding: "utf8",
      timeout: 3000,
    });
    const stdout = proc.stdout || "";
    fs.unlinkSync(tmp);
    const lines = stdout.trim() ? stdout.trim().split("\n") : [];
    return { ok: true, lines };
  } catch (err) {
    try { fs.unlinkSync(tmp); } catch (e) {}
    return { ok: false, error: err.message };
  }
}

/* ----------------- weakness mapping ----------------- */
function mapEslintMessagesToWeaknesses(eslintReports) {
  const issues = [];
  const weaknesses = new Set();
  for (const fileReport of eslintReports || []) {
    for (const msg of fileReport.messages || []) {
      issues.push(`${msg.message} (rule: ${msg.ruleId})`);
      const rule = msg.ruleId || "";
      if (rule.includes("no-unused-vars") || rule.includes("no-undef")) weaknesses.add("variables");
      else if (rule.includes("consistent-return") || rule.includes("no-return-assign")) weaknesses.add("functions");
      else if (rule.includes("eqeqeq") || rule.includes("no-cond-assign")) weaknesses.add("conditionals");
      else if (rule.includes("no-empty") || rule.includes("no-unreachable")) weaknesses.add("logic");
      else if (rule.includes("no-await-in-loop") || rule.includes("no-loop-func")) weaknesses.add("loops");
      else weaknesses.add("syntax");
    }
  }
  return { issues, weaknesses: Array.from(weaknesses) };
}

function mapPyflakesToWeaknesses(lines) {
  const issues = [];
  const weaknesses = new Set();
  for (const line of lines) {
    issues.push(line);
    if (line.includes("undefined") || line.includes("import")) weaknesses.add("variables");
    else if (line.toLowerCase().includes("syntaxerror")) weaknesses.add("syntax");
    else weaknesses.add("logic");
  }
  return { issues, weaknesses: Array.from(weaknesses) };
}

/* ----------------- hint engine ----------------- */
const hintTemplates = {
  Beginner: {
    syntax: ["There's a syntax error. Check parentheses or indentation"],
    variables: ["You may be using an undefined variable. Check spelling."],
    loops: ["Loops must initialize and update: for (let i=0...)"],
    logic: ["Break the problem into smaller steps."],
    default: ["Write pseudocode first, then convert to code."],
  },
  Intermediate: {
    syntax: ["Check operator precedence and edge cases."],
    variables: ["Check variable scope (let/const)."],
    loops: ["Check loop boundaries."],
    logic: ["Write test cases and trace execution."],
    default: ["Consider alternative approaches."],
  },
  Advanced: {
    default: ["Focus on algorithmic complexity + edge cases."],
  },
};

function getHintsFor(skill, weaknesses, issues) {
  const level = skill || "Beginner";
  const hints = [];
  if (!weaknesses.length) {
    if (issues?.length) {
      hints.push(hintTemplates[level]?.default?.[0]);
    }
    return hints;
  }
  for (const w of weaknesses) {
    const templates = hintTemplates[level]?.[w] || hintTemplates[level].default;
    hints.push(templates[0]);
  }
  return hints;
}

/* ----------------- rate limiting ----------------- */
const socketRateLimit = new Map();
const MIN_ANALYZE_INTERVAL_MS = 400;

/* ----------------- socket handlers ----------------- */
io.on("connection", (socket) => {
  console.log("ws connected", socket.id);

  socket.on("join", ({ studentId }) => {
    if (studentId) socket.join(`student:${studentId}`);
  });

  socket.on("analyze", async (payload) => {
    try {
      const now = Date.now();
      const last = socketRateLimit.get(socket.id) || 0;
      if (now - last < MIN_ANALYZE_INTERVAL_MS) return;
      socketRateLimit.set(socket.id, now);

      const { studentId, code = "", language = "javascript", skill = "Beginner" } = payload;

      let analysis;

      if (language.toLowerCase().startsWith("py")) {
        const pyRes = runPyflakesOnCode(code);
        if (!pyRes.ok) return socket.emit("analysisError", { message: pyRes.error });
        analysis = mapPyflakesToWeaknesses(pyRes.lines);
      } else {
        const esRes = runEslintOnCode(code);
        if (!esRes.ok) return socket.emit("analysisError", { message: esRes.error });
        analysis = mapEslintMessagesToWeaknesses(esRes.json);
      }

      const hints = getHintsFor(skill, analysis.weaknesses, analysis.issues);
      const resp = { issues: analysis.issues, weaknesses: analysis.weaknesses, hints, skill };

      if (studentId) io.to(`student:${studentId}`).emit("analysisResult", resp);
      else socket.emit("analysisResult", resp);
    } catch (err) {
      socket.emit("analysisError", { message: err.message });
    }
  });

  socket.on("disconnect", () => {
    socketRateLimit.delete(socket.id);
    console.log("ws disconnected", socket.id);
  });
});

/* ----------------- start server ----------------- */
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Realtime analyzer running on :${PORT}`));
