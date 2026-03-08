# Python LLM Backend API Reference
# Port: 8001
# This document describes the expected API endpoints for the LLM backend

"""
IMPORTANT: This is reference documentation only.
Your Python LLM backend should implement these endpoints.
This file is NOT executable - it's just documentation.
"""

# ============================================
# Required Endpoints
# ============================================

"""
1. POST /chat
   Description: Handle chat messages from the AI assistant
   
   Request Body:
   {
       "message": "How can I optimize this code?",
       "history": [
           {"role": "user", "content": "Previous message"},
           {"role": "assistant", "content": "Previous response"}
       ]
   }
   
   Response:
   {
       "response": "Here are some ways to optimize your code...",
       "metadata": {
           "analysisType": "performance",
           "tokensUsed": 150
       }
   }
"""

"""
2. GET /chat/history
   Description: Retrieve chat history
   
   Response:
   {
       "history": [
           {
               "id": 1,
               "role": "user",
               "content": "Message content",
               "timestamp": "2026-02-09T10:00:00Z"
           },
           ...
       ]
   }
"""

"""
3. DELETE /chat/history
   Description: Clear chat history
   
   Response:
   {
       "success": true,
       "message": "Chat history cleared"
   }
"""

"""
4. POST /analyze/comparison
   Description: Analyze code comparison with memory/performance metrics
   
   Request Body:
   {
       "before": "const items = [];\nfor(let i=0; i<data.length; i++) {...}",
       "after": "const items = data.filter(x => x.active);",
       "language": "javascript"
   }
   
   Response:
   {
       "analysis": {
           "memoryOptimization": {
               "before": {
                   "estimatedMemory": "~2.4 KB",
                   "complexityScore": 75,
                   "issues": [
                       "Multiple intermediate arrays created",
                       "Manual memory management required"
                   ]
               },
               "after": {
                   "estimatedMemory": "~1.2 KB",
                   "complexityScore": 90,
                   "improvements": [
                       "Single array operation",
                       "Automatic memory management",
                       "No intermediate allocations"
                   ]
               },
               "improvement": "50%"
           },
           "performance": {
               "before": {
                   "timeComplexity": "O(n²)",
                   "spaceComplexity": "O(n)",
                   "bottlenecks": [
                       "Nested loops",
                       "Multiple array iterations"
                   ]
               },
               "after": {
                   "timeComplexity": "O(n)",
                   "spaceComplexity": "O(n)",
                   "optimizations": [
                       "Single pass algorithm",
                       "Built-in optimization"
                   ]
               },
               "improvement": "~50% faster"
           },
           "codeQuality": {
               "before": {
                   "linesOfCode": 8,
                   "maintainabilityIndex": 65,
                   "cyclomaticComplexity": 4
               },
               "after": {
                   "linesOfCode": 1,
                   "maintainabilityIndex": 95,
                   "cyclomaticComplexity": 1
               }
           },
           "refactoringPatterns": [
               "Array Method Replacement",
               "Declarative Programming",
               "Single Responsibility"
           ],
           "risks": {
               "resolved": [
                   "Off-by-one errors in loops",
                   "Index management issues"
               ],
               "remaining": [
                   "Ensure filter predicate handles null values"
               ]
           }
       }
   }
"""

"""
5. POST /insights
   Description: Get refactoring insights and recommendations
   
   Request Body:
   {
       "code": "function processData(items) {...}",
       "focus": "memory|performance|quality|general"
   }
   
   Response:
   {
       "insights": {
           "recommendations": [
               "Use const instead of let for non-reassigned variables",
               "Consider using array methods for better readability"
           ],
           "patterns": ["Extract Method", "Guard Clause"],
           "complexity": {
               "current": "High",
               "suggestions": "Break into smaller functions"
           }
       }
   }
"""

"""
6. GET /health
   Description: Health check endpoint
   
   Response:
   {
       "status": "healthy",
       "model": "gpt-4",
       "version": "1.0.0",
       "uptime": 3600
   }
"""

# ============================================
# Implementation Notes
# ============================================

"""
Backend Implementation Tips:

1. Use FastAPI or Flask for the REST API
2. Integrate with OpenAI, Anthropic, or local LLM
3. Implement rate limiting for API calls
4. Cache common responses
5. Store chat history in database or memory
6. Handle long-running requests with proper timeouts
7. Implement proper error handling

Example FastAPI Structure:

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai  # or your LLM library

app = FastAPI()

class ChatRequest(BaseModel):
    message: str
    history: list = []

class ComparisonRequest(BaseModel):
    before: str
    after: str
    language: str = "javascript"

@app.post("/chat")
async def chat(request: ChatRequest):
    # Process with LLM
    response = await your_llm_service(request.message, request.history)
    return {"response": response, "metadata": {...}}

@app.post("/analyze/comparison")
async def analyze_comparison(request: ComparisonRequest):
    # Analyze code with LLM
    analysis = await analyze_code(request.before, request.after)
    return {"analysis": analysis}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
"""

# ============================================
# Environment Variables
# ============================================

"""
Required environment variables for your Python backend:

OPENAI_API_KEY=your-api-key-here
PORT=8001
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
MAX_TOKENS=2000
TEMPERATURE=0.7
MODEL=gpt-4-turbo-preview
"""

# ============================================
# Sample LLM Prompts
# ============================================

"""
System Prompt for Chat:
You are an expert code refactoring assistant. You help developers understand 
refactoring techniques, identify code risks, improve their skills, and optimize 
performance. Provide clear, actionable advice with code examples when relevant.

System Prompt for Code Comparison:
Analyze the provided before and after code. Calculate memory usage differences,
identify performance improvements, assess code quality metrics, list refactoring
patterns applied, and identify resolved and remaining risks. Be specific and 
quantitative in your analysis.
"""
