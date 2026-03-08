import express from "express";
import StudentProgress from "../../models/IT22604194/StudentProgress.js";

const router = express.Router();

// ═══════════════════════════════════════════════════════════════════════════
//  OPTICODE ADAPTIVE LEVEL-UP ENGINE
// ═══════════════════════════════════════════════════════════════════════════

const BKT = {
  pKnown: { Beginner: 0.2, Intermediate: 0.4, Advanced: 0.6 },
  pLearn: { Beginner: 0.3, Intermediate: 0.25, Advanced: 0.2 },
  pSlip: 0.1,
  pGuess: 0.2,
  masteryThreshold: 0.85
};

const BLOOM_XP = {
  syntax_error: 1,
  missing_print: 1,
  hardcoded_value: 2,
  idle_stuck: 2,
  logic_error: 3,
  no_function: 3,
  infinite_loop: 4,
  missing_base_case: 5,
  none: 3
};

const LEVEL_CONFIG = {
  Beginner: {
    next: "Intermediate",
    masteryThreshold: 0.85,
    minSolved: 10,
    minAccuracy: 0.75,
    maxAvgTime: 120,
    minConsecutiveCorrect: 5,
    zpdTimeThreshold: 60,
    zpdMinCleanSolves: 3
  },
  Intermediate: {
    next: "Advanced",
    masteryThreshold: 0.85,
    minSolved: 15,
    minAccuracy: 0.8,
    maxAvgTime: 180,
    minConsecutiveCorrect: 5,
    zpdTimeThreshold: 90,
    zpdMinCleanSolves: 3
  },
  Advanced: { next: null }
};

function updateBKT(pL, correct, skillLevel) {
  const pT = BKT.pLearn[skillLevel] || 0.25;
  const pS = BKT.pSlip;
  const pG = BKT.pGuess;

  let pLupdated;
  if (correct) {
    const pCorrect = pL * (1 - pS) + (1 - pL) * pG;
    pLupdated = (pL * (1 - pS)) / pCorrect;
  } else {
    const pIncorrect = pL * pS + (1 - pL) * (1 - pG);
    pLupdated = (pL * pS) / pIncorrect;
  }

  const pLnext = pLupdated + (1 - pLupdated) * pT;
  return Math.min(1, Math.max(0, parseFloat(pLnext.toFixed(4))));
}

function calcXP(solved, weakness, timeTakenSeconds, skillLevel, taskLevel) {
  if (!solved) return 0;
  const config = LEVEL_CONFIG[skillLevel];

  let xp = BLOOM_XP[weakness || "none"] || 3;

  if (config?.maxAvgTime && timeTakenSeconds > 0 && timeTakenSeconds <= config.maxAvgTime) {
    xp += parseFloat((Math.max(0, 1 - timeTakenSeconds / config.maxAvgTime) * 2).toFixed(2));
  }

  if (!weakness) xp += 1;

  const levels = ["Beginner", "Intermediate", "Advanced"];
  if (taskLevel && levels.indexOf(taskLevel) > levels.indexOf(skillLevel)) xp += 3;

  return parseFloat(xp.toFixed(2));
}

function rollingAvg(current, n, newVal) {
  if (n <= 1) return newVal;
  return parseFloat(((current * (n - 1) + newVal) / n).toFixed(1));
}

function recentAccuracy(sessions, n = 10) {
  const recent = sessions.slice(-n);
  if (!recent.length) return 0;
  return parseFloat((recent.filter((s) => s.solved).length / recent.length).toFixed(2));
}

function checkLevelUp(progress, sessions) {
  const cfg = LEVEL_CONFIG[progress.skillLevel];
  if (!cfg?.next) return { shouldLevelUp: false, criteria: {} };

  const accuracy = recentAccuracy(sessions);

  const criteria = {
    bktMastery: progress.bktMastery >= cfg.masteryThreshold,
    minSolved: progress.solvedAtCurrentLevel >= cfg.minSolved,
    accuracy: accuracy >= cfg.minAccuracy,
    timeOk: progress.avgSolveTime > 0 && progress.avgSolveTime <= cfg.maxAvgTime,
    cleanSolves: progress.consecutiveCleanSolves >= cfg.minConsecutiveCorrect
  };

  const metCount = Object.values(criteria).filter(Boolean).length;

  console.log(`🧠 Level-up [${progress.skillLevel}]:`, criteria, `→ ${metCount}/5`);

  const optional = [criteria.accuracy, criteria.timeOk, criteria.cleanSolves].filter(Boolean).length;
  const shouldLevelUp = criteria.bktMastery && criteria.minSolved && optional >= 2;

  return { shouldLevelUp, criteria, metCount, accuracy };
}

function levelUpProgress(progress, sessions) {
  const cfg = LEVEL_CONFIG[progress.skillLevel];
  if (!cfg?.next) return { atMaxLevel: true };

  const accuracy = recentAccuracy(sessions);
  return {
    nextLevel: cfg.next,
    bktMastery: progress.bktMastery,
    bktTarget: cfg.masteryThreshold,
    bktPercent: Math.min(100, Math.round((progress.bktMastery / cfg.masteryThreshold) * 100)),
    solvedAtCurrentLevel: progress.solvedAtCurrentLevel,
    minSolved: cfg.minSolved,
    solvedPercent: Math.min(100, Math.round((progress.solvedAtCurrentLevel / cfg.minSolved) * 100)),
    accuracy,
    minAccuracy: cfg.minAccuracy,
    accuracyPercent: Math.min(100, Math.round((accuracy / cfg.minAccuracy) * 100)),
    avgSolveTime: progress.avgSolveTime,
    maxAvgTime: cfg.maxAvgTime,
    timeOk: progress.avgSolveTime > 0 && progress.avgSolveTime <= cfg.maxAvgTime,
    consecutiveCleanSolves: progress.consecutiveCleanSolves,
    minConsecutiveCorrect: cfg.minConsecutiveCorrect,
    cleanPercent: Math.min(100, Math.round((progress.consecutiveCleanSolves / cfg.minConsecutiveCorrect) * 100)),
    totalXP: progress.totalXP || 0
  };
}

function detectFastLearner(progress, sessions) {
  const cfg = LEVEL_CONFIG[progress.skillLevel];
  if (!cfg?.next) return false;

  const recent = sessions.slice(-3);
  if (recent.length < 3) return false;

  const allSolvedFast = recent.every(
    (s) =>
      s.solved &&
      s.timeTakenSeconds > 0 &&
      s.timeTakenSeconds <= cfg.zpdTimeThreshold
  );

  const hasCleanStreak = progress.consecutiveCleanSolves >= cfg.zpdMinCleanSolves;
  const result = allSolvedFast && hasCleanStreak;

  if (result) {
    console.log(
      `⚡ ZPD Fast Learner detected: ${progress.skillLevel} student solving in avg ${Math.round(
        recent.reduce((a, s) => a + s.timeTakenSeconds, 0) / 3
      )}s with ${progress.consecutiveCleanSolves} clean solves`
    );
  }

  return result;
}

function updateConceptProgress(progress, concept, solved, timeTakenSeconds) {
  if (!concept) return;

  if (!progress.conceptProgress) {
    progress.conceptProgress = new Map();
  }

  const current = progress.conceptProgress.get(concept) || {
    attempts: 0,
    solved: 0,
    mastery: 0.2,
    avgSolveTime: 0
  };

  current.attempts += 1;
  if (solved) current.solved += 1;

  current.mastery = updateBKT(current.mastery, solved, progress.skillLevel);

  if (solved && timeTakenSeconds > 0) {
    current.avgSolveTime =
      current.solved <= 1
        ? timeTakenSeconds
        : parseFloat(
            (
              (current.avgSolveTime * (current.solved - 1) + timeTakenSeconds) /
              current.solved
            ).toFixed(1)
          );
  }

  progress.conceptProgress.set(concept, current);
  progress.markModified("conceptProgress");
}

router.post("/save", async (req, res) => {
  try {
    const {
      userId,
      task,
      weakness,
      concept,
      learningMode = "level_up",
      skillLevel,
      solved,
      timeTakenSeconds = 0,
      taskLevel,
      codeSubmission
    } = req.body;

    let progress = await StudentProgress.findOne({ userId });

    if (!progress) {
      progress = new StudentProgress({
        userId,
        skillLevel,
        bktMastery: BKT.pKnown[skillLevel] || 0.2
      });
    }

    if (!progress.conceptProgress) progress.conceptProgress = new Map();
    if (!progress.weaknessHistory) progress.weaknessHistory = new Map();

    progress.preferredLearningMode = learningMode;
    if (learningMode === "improve_concept") {
      if (concept) progress.targetConcept = concept;
    } else {
      progress.targetConcept = null;
    }

    progress.sessions.push({
      task,
      weakness,
      concept,
      learningMode,
      skillLevel,
      solved,
      timeTakenSeconds,
      taskLevel: taskLevel || skillLevel,
      codeSubmission: codeSubmission || "",
      timestamp: new Date()
    });

    if (weakness && solved) {
      progress.weaknessHistory.set(
        weakness,
        (progress.weaknessHistory.get(weakness) || 0) + 1
      );
      progress.markModified("weaknessHistory");
    }

    progress.bktMastery = updateBKT(progress.bktMastery, solved, progress.skillLevel);
    updateConceptProgress(progress, concept, solved, timeTakenSeconds);

    if (solved) {
      progress.totalSolved += 1;
      progress.solvedAtCurrentLevel += 1;
      progress.avgSolveTime = rollingAvg(
        progress.avgSolveTime,
        progress.totalSolved,
        timeTakenSeconds
      );
      progress.consecutiveCleanSolves = weakness ? 0 : progress.consecutiveCleanSolves + 1;
      progress.totalXP = (progress.totalXP || 0) + calcXP(
        solved,
        weakness,
        timeTakenSeconds,
        progress.skillLevel,
        taskLevel
      );

      console.log(
        `💾 BKT: ${progress.bktMastery} | XP: ${progress.totalXP} | Streak: ${progress.consecutiveCleanSolves}`
      );
    } else {
      progress.consecutiveCleanSolves = 0;
    }

    const previousLevel = progress.skillLevel;
    let leveledUp = false;
    let levelCheck = { criteria: {} };

    if (solved) {
      levelCheck = checkLevelUp(progress, progress.sessions);

      if (levelCheck.shouldLevelUp) {
        const cfg = LEVEL_CONFIG[progress.skillLevel];
        progress.skillLevel = cfg.next;
        progress.solvedAtCurrentLevel = 0;
        progress.consecutiveCleanSolves = 0;
        progress.bktMastery = BKT.pKnown[cfg.next] || 0.3;
        progress.zpd_boost = false;
        leveledUp = true;
        console.log(`🎉 LEVEL UP: ${previousLevel} → ${progress.skillLevel}`);
      } else {
        const isFastLearner = detectFastLearner(progress, progress.sessions);
        if (isFastLearner) {
          progress.zpd_boost = true;
          console.log(`⚡ ZPD Boost activated → serving ${LEVEL_CONFIG[progress.skillLevel].next} tasks`);
        } else if (progress.zpd_boost) {
          const recentFailed = progress.sessions.slice(-2).some((s) => !s.solved);
          if (recentFailed) {
            progress.zpd_boost = false;
            console.log(`📉 ZPD Boost deactivated → student struggling, returning to ${progress.skillLevel} tasks`);
          }
        }
      }
    }

    await progress.save();

    res.json({
      success: true,
      skillLevel: progress.skillLevel,
      previousLevel,
      leveledUp,
      totalSolved: progress.totalSolved,
      totalXP: progress.totalXP,
      bktMastery: progress.bktMastery,
      avgSolveTime: progress.avgSolveTime,
      consecutiveCleanSolves: progress.consecutiveCleanSolves,
      levelUpProgress: levelUpProgress(progress, progress.sessions),
      criteria: levelCheck.criteria || {},
      zpdBoost: progress.zpd_boost || false
    });
  } catch (err) {
    console.error("Progress save error:", err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const progress = await StudentProgress.findOne({ userId: req.params.userId });

    if (!progress) {
      return res.json({
        totalSolved: 0,
        totalXP: 0,
        skillLevel: "Beginner",
        bktMastery: BKT.pKnown.Beginner,
        sessions: [],
        weaknessHistory: {},
        conceptProgress: {},
        preferredLearningMode: "level_up",
        targetConcept: null,
        zpd_boost: false,
        levelUpProgress: levelUpProgress(
          {
            skillLevel: "Beginner",
            bktMastery: BKT.pKnown.Beginner,
            solvedAtCurrentLevel: 0,
            avgSolveTime: 0,
            consecutiveCleanSolves: 0,
            totalXP: 0
          },
          []
        )
      });
    }

    const data = progress.toObject();

    data.conceptProgress = Object.fromEntries(progress.conceptProgress || []);
    data.weaknessHistory = Object.fromEntries(progress.weaknessHistory || []);
    data.levelUpProgress = levelUpProgress(progress, progress.sessions);

    res.json(data);
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

router.post("/reset-level", async (req, res) => {
  try {
    const { userId, skillLevel } = req.body;

    if (!userId || !skillLevel) {
      return res.status(400).json({ error: "userId and skillLevel are required" });
    }

    await StudentProgress.findOneAndUpdate(
      { userId },
      {
        $set: {
          skillLevel,
          bktMastery: BKT.pKnown[skillLevel] || 0.2,
          consecutiveCleanSolves: 0,
          solvedAtCurrentLevel: 0,
          preferredLearningMode: "level_up",
          targetConcept: null,
          zpd_boost: false
        }
      },
      { upsert: true }
    );

    console.log(`🔄 Level reset: userId=${userId} → ${skillLevel}`);
    res.json({ success: true, skillLevel });
  } catch (err) {
    console.error("Reset level error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;