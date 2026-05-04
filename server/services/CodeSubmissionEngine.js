/**
 * SAFE CODE EXECUTOR
 * Executes Python code with multiple layers of protection
 * Prevents system crashes, memory leaks, and security issues
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class SafeCodeExecutor {

  /**
   * Execute Python code safely with timeouts and restrictions
   * @param {string} code - Python code to execute
   * @param {number} timeout - Max execution time in ms (default 5000)
   */
  static async execute(code, timeout = 5000) {
    return new Promise((resolve) => {
      let output = '';
      let error  = '';
      const startTime = Date.now();
      let completed   = false;

      try {
        // ── STEP 1: Safety check ────────────────────────────────────────
        const validation = this.validateCodeSafety(code);
        if (!validation.safe) {
          return resolve({
            success: false, output: '',
            error: `⚠️ Code contains unsafe operation: ${validation.reason}`,
            executionTime: 0, verdict: 'UNSAFE_CODE'
          });
        }

        // ── STEP 2: Execute in isolated subprocess ──────────────────────
        // NOTE: syntax check removed — Python itself catches syntax errors
        // and returns a proper RUNTIME_ERROR with the actual error message
        const python = spawn('python', ['-c', code], {
          timeout,
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            PYTHONDONTWRITEBYTECODE: '1',
            PYTHONUNBUFFERED: '1'
          }
        });

        // ── STEP 3: Timeout protection ──────────────────────────────────
        const timeoutId = setTimeout(() => {
          if (!completed) {
            completed = true;
            python.kill('SIGKILL');
            return resolve({
              success: false, output,
              error: `⏱️ Execution timeout (${timeout}ms) - possible infinite loop`,
              executionTime: Date.now() - startTime, verdict: 'TIMEOUT'
            });
          }
        }, timeout);

        // ── STEP 4: Capture output ──────────────────────────────────────
        python.stdout.on('data', (data) => {
          output += data.toString();
          if (output.length > 1024 * 1024) python.kill();
        });

        python.stderr.on('data', (data) => {
          error += data.toString();
        });

        // ── STEP 5: Process completion ──────────────────────────────────
        python.on('close', (code) => {
          if (completed) return;
          completed = true;
          clearTimeout(timeoutId);
          const executionTime = Date.now() - startTime;

          if (code !== 0) {
            return resolve({
              success: false, output,
              error: error || `Process exited with code ${code}`,
              executionTime, verdict: 'RUNTIME_ERROR'
            });
          }

          resolve({
            success: true,
            output: output.trim(),
            error: '', executionTime, verdict: 'SUCCESS'
          });
        });

        python.on('error', (err) => {
          if (completed) return;
          completed = true;
          clearTimeout(timeoutId);
          resolve({
            success: false, output: '',
            error: `Failed to execute: ${err.message}`,
            executionTime: Date.now() - startTime,
            verdict: 'EXECUTION_FAILED'
          });
        });

      } catch (err) {
        return resolve({
          success: false, output: '',
          error: `Error during setup: ${err.message}`,
          executionTime: Date.now() - startTime,
          verdict: 'SETUP_ERROR'
        });
      }
    });
  }

  /**
   * Validate code for dangerous patterns
   */
  static validateCodeSafety(code) {
    const dangerousPatterns = [
      { pattern: /import\s+os/,      reason: 'File system access not allowed' },
      { pattern: /__import__/,        reason: 'Dynamic import not allowed' },
      { pattern: /exec\s*\(/,         reason: 'exec() not allowed' },
      { pattern: /eval\s*\(/,         reason: 'eval() not allowed' },
      { pattern: /compile\s*\(/,      reason: 'compile() not allowed' },
      { pattern: /subprocess/,        reason: 'Subprocess execution not allowed' },
      { pattern: /socket/,            reason: 'Network access not allowed' },
      { pattern: /requests/,          reason: 'HTTP requests not allowed' },
      { pattern: /urllib/,            reason: 'URL access not allowed' },
      { pattern: /open\s*\(/,         reason: 'File operations not allowed' },
      { pattern: /\.write\s*\(/,      reason: 'File write not allowed' },
      { pattern: /shutil/,            reason: 'Shell utilities not allowed' },
      { pattern: /ctypes/,            reason: 'C type bindings not allowed' },
    ];

    for (const { pattern, reason } of dangerousPatterns) {
      if (pattern.test(code)) return { safe: false, reason };
    }
    return { safe: true, reason: '' };
  }
}

// ═════════════════════════════════════════════════════════════════════════
// ANSWER VALIDATOR
// Smart type-aware comparison — handles numeric, list, set, sentence, etc.
// ═════════════════════════════════════════════════════════════════════════
export class AnswerValidator {

  static validate(actualOutput, expectedOutput, taskMetadata = {}) {

    // ── Open-ended: check code structure not output ──────────────────────
    if (taskMetadata.validationType === 'open_ended') {
      return this.validateOpenEnded(actualOutput, taskMetadata.code || '');
    }

    // ── Contains: pass if expected appears anywhere in output ────────────
    if (taskMetadata.validationType === 'contains_output') {
      return this.validateContains(actualOutput, expectedOutput);
    }

    // ── Normalize both sides ─────────────────────────────────────────────
    const actual   = this.normalize(actualOutput);
    const expected = this.normalize(expectedOutput);

    // Direct match after normalization — always wins
    if (actual === expected) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'EXACT_MATCH' };
    }

    // ── Auto-detect type if not provided ────────────────────────────────
    const taskType = taskMetadata.type || this.detectTaskType(expectedOutput);

    switch (taskType) {
      case 'numeric':
        return this.validateNumeric(actual, expected, taskMetadata.tolerance || 0.01);
      case 'array':
      case 'list':
        return this.validateArray(actual, expected);
      case 'set':
      case 'unordered':
        return this.validateSet(actual, expected);
      case 'multiline':
        return this.validateMultiLine(actual, expected);
      case 'sentence':
        return this.validateSentence(actual, expected);
      default:
        return this.validateString(actual, expected);
    }
  }

  // ── Normalize: trim, unify whitespace, unify line endings ───────────────
  static normalize(output) {
    if (!output) return '';
    return String(output)
      .trim()
      .replace(/\r\n/g, '\n')
      .replace(/\s+\n/g, '\n');
  }

  // ── Detect output type from expected value ───────────────────────────────
  static detectTaskType(output) {
    const s = String(output).trim();

    // List: [1, 2, 3]
    if (s.startsWith('[') && s.endsWith(']')) return 'array';

    // Set: {1, 2, 3}
    if (s.startsWith('{') && s.includes(',') && !s.includes(':')) return 'set';

    // Dict: {a: 1}
    if (s.startsWith('{') && s.includes(':')) return 'dict';

    // Pure number
    if (/^-?\d+(\.\d+)?$/.test(s)) return 'numeric';

    // Multiline
    if (s.includes('\n')) return 'multiline';

    // Sentence — contains spaces, longer than 10 chars, has letters
    // Covers: "Cannot divide by zero", "Hello World", "Invalid number" etc.
    if (s.includes(' ') && s.length > 10 && /[a-zA-Z]/.test(s)) return 'sentence';

    return 'string';
  }

  // ── SENTENCE VALIDATION ──────────────────────────────────────────────────
  // Ignores punctuation, capitalization, extra spaces.
  // Fixes issues like "Cannot divide by zero" vs "Cannot divide by zero."
  static validateSentence(actual, expected) {

    const clean = (str) => str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')   // remove all punctuation . ! ? , etc.
      .replace(/\s+/g, ' ')           // collapse multiple spaces
      .trim();

    const cleanActual   = clean(actual);
    const cleanExpected = clean(expected);

    // Exact match after cleaning
    if (cleanActual === cleanExpected) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'SENTENCE_MATCH' };
    }

    // Contains check — student may have printed extra lines
    if (cleanActual.includes(cleanExpected)) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'SENTENCE_CONTAINS' };
    }

    return {
      correct: false,
      message: `❌ Expected: ${expected}\nGot: ${actual}`,
      match: 'SENTENCE_MISMATCH'
    };
  }

  // ── OPEN-ENDED VALIDATION ────────────────────────────────────────────────
  // For tasks like "store your name and print it" — no fixed expected output
  static validateOpenEnded(actualOutput, code) {
    const hasAssignment = /^\s*\w+\s*=\s*.+/m.test(code);
    const hasPrint      = /print\s*\(/.test(code);
    const hasOutput     = actualOutput && actualOutput.trim().length > 0;

    if (hasAssignment && hasPrint && hasOutput) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'OPEN_ENDED_MATCH' };
    }
    if (!hasAssignment) {
      return { correct: false, message: '❌ Store a value in a variable first', match: 'MISSING_VARIABLE' };
    }
    if (!hasPrint) {
      return { correct: false, message: '❌ Use print() to display the variable', match: 'MISSING_PRINT' };
    }
    return { correct: false, message: '❌ No output produced', match: 'NO_OUTPUT' };
  }

  // ── CONTAINS VALIDATION ──────────────────────────────────────────────────
  // Pass if expected appears on any line of actual output
  static validateContains(actualOutput, expectedOutput) {
    const expected = this.normalize(expectedOutput);
    const lines    = actualOutput.split('\n');

    for (const line of lines) {
      if (this.normalize(line) === expected) {
        return { correct: true, message: '✅ Your answer is correct!', match: 'CONTAINS_MATCH' };
      }
    }

    // Also try full output normalized
    if (this.normalize(actualOutput) === expected) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'CONTAINS_MATCH' };
    }

    return {
      correct: false,
      message: `❌ Expected output not found\nExpected: ${expectedOutput}\nGot: ${actualOutput}`,
      match: 'CONTAINS_MISS'
    };
  }

  // ── NUMERIC VALIDATION ───────────────────────────────────────────────────
  // Handles float precision: 25.0 vs 25, 3.14 vs 3.14159
  static validateNumeric(actual, expected, tolerance) {
    try {
      const actualNum   = parseFloat(actual);
      const expectedNum = parseFloat(expected);

      if (isNaN(actualNum) || isNaN(expectedNum)) {
        return { correct: false, message: `❌ Expected number, got: ${actual}`, match: 'TYPE_MISMATCH' };
      }
      if (Math.abs(actualNum - expectedNum) < tolerance) {
        return { correct: true, message: '✅ Your answer is correct!', match: 'NUMERIC_MATCH' };
      }
      return { correct: false, message: `❌ Expected: ${expected}, Got: ${actual}`, match: 'VALUE_MISMATCH' };
    } catch (e) {
      return { correct: false, message: '❌ Error comparing numbers', match: 'ERROR' };
    }
  }

  // ── ARRAY VALIDATION ─────────────────────────────────────────────────────
  // Order-sensitive list comparison
  static validateArray(actual, expected) {
    try {
      const actualArray   = this.parseArray(actual);
      const expectedArray = this.parseArray(expected);

      if (!actualArray || !expectedArray) {
        return { correct: false, message: `❌ Expected: ${expected}\nGot: ${actual}`, match: 'PARSE_ERROR' };
      }
      if (actualArray.length !== expectedArray.length) {
        return { correct: false, message: `❌ Wrong number of elements (Expected: ${expectedArray.length}, Got: ${actualArray.length})`, match: 'LENGTH_MISMATCH' };
      }
      for (let i = 0; i < actualArray.length; i++) {
        if (String(actualArray[i]).trim() !== String(expectedArray[i]).trim()) {
          return { correct: false, message: `❌ Element ${i} wrong\nExpected: ${expectedArray[i]}\nGot: ${actualArray[i]}`, match: 'ELEMENT_MISMATCH' };
        }
      }
      return { correct: true, message: '✅ Your answer is correct!', match: 'ARRAY_MATCH' };
    } catch (e) {
      return { correct: false, message: '❌ Error comparing arrays', match: 'ERROR' };
    }
  }

  // ── SET VALIDATION ───────────────────────────────────────────────────────
  // Order-insensitive set comparison: {1,2,3} == {3,1,2}
  static validateSet(actual, expected) {
    try {
      const parseSet = (str) => new Set(
        String(str).trim()
          .replace(/^\{/, '').replace(/\}$/, '')
          .split(',')
          .map(x => x.trim())
      );

      const actualSet   = parseSet(actual);
      const expectedSet = parseSet(expected);

      if (actualSet.size !== expectedSet.size) {
        return { correct: false, message: `❌ Set size wrong (Expected: ${expectedSet.size}, Got: ${actualSet.size})`, match: 'SIZE_MISMATCH' };
      }
      for (const item of expectedSet) {
        if (!actualSet.has(item)) {
          return { correct: false, message: `❌ Missing element: ${item}`, match: 'ELEMENT_MISSING' };
        }
      }
      return { correct: true, message: '✅ Your answer is correct!', match: 'SET_MATCH' };
    } catch (e) {
      return { correct: false, message: '❌ Error comparing sets', match: 'ERROR' };
    }
  }

  // ── MULTILINE VALIDATION ─────────────────────────────────────────────────
  // Line-by-line comparison for outputs like "1\n2\n3"
  static validateMultiLine(actual, expected) {
    const actualLines   = actual.split('\n').map(l => l.trim()).filter(l => l);
    const expectedLines = expected.split('\n').map(l => l.trim()).filter(l => l);

    if (actualLines.length !== expectedLines.length) {
      return {
        correct: false,
        message: `❌ Wrong number of output lines (Expected: ${expectedLines.length}, Got: ${actualLines.length})`,
        match: 'LINE_COUNT_MISMATCH'
      };
    }
    for (let i = 0; i < actualLines.length; i++) {
      if (actualLines[i] !== expectedLines[i]) {
        return {
          correct: false,
          message: `❌ Line ${i + 1} wrong\nExpected: ${expectedLines[i]}\nGot: ${actualLines[i]}`,
          match: 'LINE_MISMATCH'
        };
      }
    }
    return { correct: true, message: '✅ Your answer is correct!', match: 'MULTILINE_MATCH' };
  }

  // ── STRING VALIDATION ────────────────────────────────────────────────────
  static validateString(actual, expected) {
    if (actual === expected) {
      return { correct: true, message: '✅ Your answer is correct!', match: 'STRING_MATCH' };
    }
    return {
      correct: false,
      message: `❌ Expected: ${expected}\nGot: ${actual}`,
      match: 'STRING_MISMATCH'
    };
  }

  // ── PARSE ARRAY ──────────────────────────────────────────────────────────
  static parseArray(str) {
    try {
      str = String(str).trim();
      if (str.startsWith('[') && str.endsWith(']')) {
        const jsonStr = str.replace(/'/g, '"');
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (e) { return null; }
  }
}

// ═════════════════════════════════════════════════════════════════════════
// SUBMISSION HANDLER
// Main entry point — orchestrates execution and validation
// ═════════════════════════════════════════════════════════════════════════
export class SubmissionHandler {

  static async handleSubmission(code, expectedOutput, taskMetadata = {}) {
    try {
      // Pass code into metadata so open_ended validator can inspect it
      taskMetadata.code = code;

      // 1. Execute code
      const execution = await SafeCodeExecutor.execute(code, 5000);

      // 2. Handle execution failures
      if (!execution.success) {
        return {
          success: false, correct: false,
          message: `❌ ${execution.error}`,
          verdict: execution.verdict,
          executionTime: execution.executionTime,
          feedback: { type: 'ERROR', description: execution.error }
        };
      }

      // 3. Validate answer
      const validation = AnswerValidator.validate(
        execution.output,
        expectedOutput,
        taskMetadata
      );

      // 4. Build feedback
      const feedback = {
        type:          validation.correct ? 'CORRECT' : 'WRONG',
        description:   validation.message,
        matchType:     validation.match,
        executionTime: execution.executionTime
      };

      if (!validation.correct) {
        feedback.details = {
          expected: expectedOutput,
          actual:   execution.output
        };
      }

      return {
        success:       true,
        correct:       validation.correct,
        message:       validation.message,
        verdict:       validation.correct ? 'CORRECT' : 'WRONG_OUTPUT',
        executionTime: execution.executionTime,
        feedback
      };

    } catch (error) {
      return {
        success: false, correct: false,
        message: `❌ Unexpected error: ${error.message}`,
        verdict: 'SYSTEM_ERROR',
        executionTime: 0,
        feedback: { type: 'ERROR', description: 'System error during evaluation' }
      };
    }
  }
}
