/**
 * Code Concept Extractor - API Service
 * Student: IT22601360
 *
 * AI calls  → Python FastAPI service  (port 8000)
 * Save/History → Express/MongoDB       (port 5000)
 */

import axios from 'axios';

const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';
const MERN_API_URL   = import.meta.env.VITE_API_URL        || 'http://localhost:5000';

// ── Axios clients ─────────────────────────────────────────────────────────────

const aiClient = axios.create({
  baseURL: `${AI_SERVICE_URL}/api/IT22601360`,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
});

const mernClient = axios.create({
  baseURL: `${MERN_API_URL}/api/IT22601360`,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

aiClient.interceptors.request.use(cfg => {
  console.log(`🚀 AI → ${cfg.method?.toUpperCase()} ${cfg.url}`);
  return cfg;
});
aiClient.interceptors.response.use(
  res   => { console.log(`✅ AI ← ${res.status}`); return res; },
  err   => { console.error('❌ AI Error:', err.response?.data || err.message); return Promise.reject(err); },
);

mernClient.interceptors.response.use(
  res   => res,
  err   => { console.error('❌ MERN Error:', err.response?.data || err.message); return Promise.reject(err); },
);


// ── AI Service ────────────────────────────────────────────────────────────────

export const conceptExtractorApi = {

  /**
   * Single-snippet extraction (paste mode).
   * extraction_mode: 'hybrid' (default) | 'llm_only'
   */
  extractConcepts: async (code, language = 'python', extraction_mode = 'hybrid') => {
    try {
      const { data } = await aiClient.post('/extract-enhanced', { code, language, extraction_mode });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to extract concepts. Please try again.');
    }
  },

  /**
   * Upload a collection of File objects (from webkitdirectory input).
   * Sends multipart/form-data to /extract-files.
   * extraction_mode: 'hybrid' (default) | 'llm_only'
   *
   * @param {File[]} files - Array of File objects from the folder input
   * @param {Function} [onUploadProgress] - Optional axios upload progress callback
   * @param {string} [extraction_mode] - 'hybrid' or 'llm_only'
   */
  uploadProjectFiles: async (files, onUploadProgress = null, extraction_mode = 'hybrid') => {
    if (!files || files.length === 0) throw new Error('No files provided');

    const formData = new FormData();
    files.forEach(file => formData.append('files', file, file.webkitRelativePath || file.name));

    try {
      const { data } = await aiClient.post(
        `/extract-files?extraction_mode=${extraction_mode}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 600_000, // 10 min for large projects
          onUploadProgress,
        }
      );
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to analyze project. Please try again.');
    }
  },

  /**
   * Run BOTH modes on the same file list and return side-by-side results.
   * Used by the research Compare mode.
   * Runs hybrid + llm_only in parallel (2 API calls total).
   *
   * @param {File[]} files
   * @returns {{ hybrid: object, llm_only: object }}
   */
  uploadProjectFilesCompare: async (files) => {
    if (!files || files.length === 0) throw new Error('No files provided');

    const makeForm = () => {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f, f.webkitRelativePath || f.name));
      return fd;
    };

    const [hybridRes, llmRes] = await Promise.all([
      aiClient.post('/extract-files?extraction_mode=hybrid',   makeForm(), {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600_000,
      }),
      aiClient.post('/extract-files?extraction_mode=llm_only', makeForm(), {
        headers: { 'Content-Type': 'multipart/form-data' }, timeout: 600_000,
      }),
    ]);

    return { hybrid: hybridRes.data, llm_only: llmRes.data };
  },

  /**
   * Run BOTH modes on the same code snippet and return side-by-side results.
   * Used by the research Compare mode in paste mode.
   *
   * @returns {{ hybrid: object, llm_only: object }}
   */
  extractConceptsCompare: async (code, language = 'python') => {
    const [hybridRes, llmRes] = await Promise.all([
      aiClient.post('/extract-enhanced', { code, language, extraction_mode: 'hybrid' }),
      aiClient.post('/extract-enhanced', { code, language, extraction_mode: 'llm_only' }),
    ]);
    return { hybrid: hybridRes.data, llm_only: llmRes.data };
  },

  /**
   * Generate a natural-language project purpose from concept metadata.
   */
  generateProjectPurpose: async (filenames, conceptNames) => {
    try {
      const { data } = await aiClient.post('/project-purpose', { filenames, conceptNames });
      return data.purpose || '';
    } catch {
      return '';
    }
  },

  quickClassify: async (code, language = 'python') => {
    try {
      const { data } = await aiClient.post('/classify', { code, language }, { timeout: 5_000 });
      return data;
    } catch {
      return null;
    }
  },

  getConceptDetails: async (conceptName, codeContext = '', detailLevel = 'intermediate') => {
    try {
      const { data } = await aiClient.post('/concept-details', { conceptName, codeContext, detailLevel });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to get concept details.');
    }
  },

  getVisualization: async (concepts, type = 'all') => {
    try {
      const { data } = await aiClient.post('/visualize', { concepts, type });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.detail || 'Failed to generate visualization.');
    }
  },

  getSupportedLanguages: async () => {
    try {
      const { data } = await aiClient.get('/supported-languages');
      return data;
    } catch {
      return { languages: ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust'] };
    }
  },

  getModelInfo: async () => {
    try {
      const { data } = await aiClient.get('/model-info');
      return data;
    } catch {
      return null;
    }
  },

  healthCheck: async () => {
    try {
      const { data } = await aiClient.get('/health');
      return data;
    } catch (err) {
      return { status: 'unhealthy', error: err.message };
    }
  },
};


// ── MongoDB History API ───────────────────────────────────────────────────────

export const conceptHistoryApi = {

  saveExtraction: async (extractionResult, sourceCode, language, userId = null) => {
    try {
      const { data } = await mernClient.post('/history', {
        sourceCode,
        language,
        concepts:       extractionResult.concepts       || [],
        metrics:        extractionResult.metrics        || {},
        processingTime: extractionResult.processingTime || 0,
        ...(userId && { userId }),
      });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to save extraction.');
    }
  },

  getHistory: async (options = {}) => {
    try {
      const { page = 1, limit = 20, language, concept, userId } = options;
      const params = { page, limit };
      if (language) params.language = language;
      if (concept)  params.concept  = concept;
      if (userId)   params.userId   = userId;
      const { data } = await mernClient.get('/history', { params });
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch history.');
    }
  },

  getExtractionById: async (id) => {
    try {
      const { data } = await mernClient.get(`/history/${id}`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to fetch extraction.');
    }
  },

  deleteExtraction: async (id) => {
    try {
      const { data } = await mernClient.delete(`/history/${id}`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete extraction.');
    }
  },

  getStats: async () => {
    try {
      const { data } = await mernClient.get('/history/stats/summary');
      return data;
    } catch {
      return null;
    }
  },
};

export default conceptExtractorApi;