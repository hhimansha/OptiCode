import express from "express";
import { askGemini } from "../../services/IT22604194/geminiService.js";

const router = express.Router();

router.post("/hint", async (req, res) => {
  try {
    const { weakness, skill, code, task } = req.body;

    const reply = await askGemini({
      weakness,
      skill,
      code,
      task
    });

    res.json({ hint: reply });

  } catch (err) {
    console.error("Gemini hint error:", err);
    res.status(500).json({ hint: "Gemini tutor failed" });
  }
});

export default router;
