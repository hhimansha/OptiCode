/**
 * TASK SUBMISSION ROUTER
 * API endpoints for submitting and evaluating student code
 */

import express from 'express';
import userAuth from '../middlewares/Userauth.js';
import StudentProgress from '../models/StudentProgress.js';
import { structuredTasks } from '../data/structuredTasks.js';
import { SafeCodeExecutor, AnswerValidator } from '../services/CodeSubmissionEngine.js';

const router = express.Router();

/**
 * POST /api/tasks/submit
 */
router.post('/submit', userAuth, async (req, res) => {
  try {
    const { skillLevel, errorType, taskIndex, code, taskMetadata = {} } = req.body;
    const userId = req.userId;

    // 1. VALIDATION
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: '❌ Code submission is required',
        code: 'MISSING_CODE'
      });
    }

    if (!skillLevel || !errorType || taskIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: '❌ Missing task information',
        code: 'MISSING_TASK_INFO'
      });
    }

    // 2. MAP SKILL LEVEL
    const skillLevelMap = {
      1: 'Beginner',
      2: 'Beginner',
      3: 'Intermediate',
      4: 'Intermediate',
      5: 'Advanced'
    };

    const skillName = skillLevelMap[skillLevel];
    const tasks = structuredTasks[skillName]?.[errorType];

    if (!tasks || !tasks[taskIndex]) {
      return res.status(400).json({
        success: false,
        message: '❌ Task not found',
        code: 'TASK_NOT_FOUND'
      });
    }

    const task = tasks[taskIndex];

    // 3. CHECK solution_code
    if (!task.solution_code) {
      return res.status(500).json({
        success: false,
        message: '❌ Task missing solution_code',
        code: 'MISSING_SOLUTION_CODE'
      });
    }

    console.log(`🧠 Running solution code...`);

    // 4. EXECUTE SOLUTION CODE
    const solutionExecution = await SafeCodeExecutor.execute(task.solution_code);

    if (solutionExecution.error) {
      return res.status(500).json({
        success: false,
        message: '❌ Solution execution failed',
        error: solutionExecution.error,
        code: 'SOLUTION_EXECUTION_FAILED'
      });
    }

    const correctOutput = solutionExecution.output;

    // 5. EXECUTE STUDENT CODE
    console.log(`📝 Running student code...`);

    const studentExecution = await SafeCodeExecutor.execute(code);

    if (studentExecution.error) {
      return res.status(200).json({
        success: false,
        correct: false,
        verdict: 'RUNTIME_ERROR',
        message: '❌ Runtime Error',
        error: studentExecution.error,
        executionTime: studentExecution.executionTime || 0
      });
    }

    const studentOutput = studentExecution.output;

    // 6. VALIDATE OUTPUT
    const result = AnswerValidator.validate(
      studentOutput,
      correctOutput,
      taskMetadata
    );

    // 7. SAVE PROGRESS (optional but recommended)
    try {
      let progress = await StudentProgress.findOne({ userId });

      if (!progress) {
        progress = new StudentProgress({ userId, sessions: [] });
      }

      progress.sessions.push({
        task: task.task,
        codeSubmission: code,
        solved: result.correct,
        skillLevel: skillLevel,
        taskLevel: errorType,
        timeTakenSeconds: Math.round((studentExecution.executionTime || 0) / 1000)
      });

      await progress.save();
    } catch (dbError) {
      console.warn('⚠️ Could not save progress:', dbError.message);
    }

    // 8. RETURN RESPONSE
    return res.status(200).json({
      success: result.correct,
      correct: result.correct,
      verdict: result.verdict,
      message: result.message,
      feedback: result.feedback,
      executionTime: studentExecution.executionTime,
      metadata: {
        skillLevel,
        errorType,
        taskIndex,
        task: task.task
      }
    });

  } catch (error) {
    console.error('❌ Submission error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Server error during submission evaluation',
      error: error.message,
      code: 'SUBMISSION_ERROR'
    });
  }
});

/**
 * GET /api/tasks/get
 */
router.get('/get', async (req, res) => {
  try {
    const { skillLevel, errorType, taskIndex } = req.query;

    if (!skillLevel || !errorType || taskIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: '❌ Missing query parameters'
      });
    }

    const skillLevelMap = {
      1: 'Beginner',
      2: 'Beginner',
      3: 'Intermediate',
      4: 'Intermediate',
      5: 'Advanced'
    };

    const skillName = skillLevelMap[parseInt(skillLevel)];
    const tasks = structuredTasks[skillName]?.[errorType];

    if (!tasks || !tasks[parseInt(taskIndex)]) {
      return res.status(404).json({
        success: false,
        message: '❌ Task not found'
      });
    }

    const task = tasks[parseInt(taskIndex)];

    // Hide solution_code
    const { solution_code, expected_output, test_input, ...taskData } = task;

    return res.status(200).json({
      success: true,
      task: taskData,
      metadata: {
        skillLevel,
        errorType,
        taskIndex,
        totalTasksInCategory: tasks.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching task:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Server error fetching task'
    });
  }
});

/**
 * POST /api/tasks/test (optional sandbox)
 */
router.post('/test', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '❌ Code is required'
      });
    }

    const execution = await SafeCodeExecutor.execute(code);

    return res.status(200).json(execution);

  } catch (error) {
    console.error('❌ Test error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Test execution failed',
      error: error.message
    });
  }
});

/**
 * GET /api/tasks/progress/:userId
 */
router.get('/progress/:userId', userAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: '❌ Unauthorized'
      });
    }

    const progress = await StudentProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: '❌ No progress found'
      });
    }

    const stats = {
      totalAttempts: progress.sessions.length,
      correctAnswers: progress.sessions.filter(s => s.solved).length,
      successRate: progress.sessions.length
        ? ((progress.sessions.filter(s => s.solved).length / progress.sessions.length) * 100).toFixed(2)
        : 0,
      averageTime: progress.sessions.length
        ? Math.round(progress.sessions.reduce((sum, s) => sum + s.timeTakenSeconds, 0) / progress.sessions.length)
        : 0
    };

    return res.status(200).json({
      success: true,
      stats,
      sessions: progress.sessions.slice(-10)
    });

  } catch (error) {
    console.error('❌ Progress error:', error);
    return res.status(500).json({
      success: false,
      message: '❌ Error fetching progress'
    });
  }
});

export default router;