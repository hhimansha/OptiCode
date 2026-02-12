# AI Refactor Assistant

## Overview
The AI Refactor Assistant is an intelligent chatbot interface that helps developers understand code refactoring, identify risks, improve coding skills, and optimize performance. It provides interactive chat, code comparison with memory/performance analysis, and refactoring insights.

## Features

### 1. **AI Chat Assistant**
- Interactive chatbot powered by LLM (Large Language Model)
- Ask questions about:
  - How code was refactored
  - Risks and vulnerabilities in code
  - Tips to improve refactoring skills
  - Ways to increase code performance
- Context-aware responses using chat history
- Syntax-highlighted code snippets in responses

### 2. **Code Comparison Tool**
- Side-by-side before/after code comparison
- **Memory Optimization Analysis**:
  - Estimated memory usage comparison
  - Memory issues identified
  - Improvements applied
- **Performance Metrics**:
  - Time complexity analysis (Big O)
  - Space complexity analysis
  - Performance bottlenecks identified
  - Optimizations applied
- **Code Quality Metrics**:
  - Lines of code comparison
  - Maintainability index
  - Cyclomatic complexity
- **Visual Metrics Cards** showing improvement percentages
- Multiple view modes: Split, Before Only, After Only

### 3. **Refactoring Insights**
- Best practices for memory optimization
- Performance optimization techniques
- Code quality guidelines
- Common refactoring patterns
- Learning resources and example questions

## File Structure

```
client/src/
├── pages/IT22606860/
│   └── RefactorAssistant.jsx          # Main page with tabs
├── component/IT22606860/
│   ├── RefactorAssistantChat.jsx      # Chat interface component
│   └── CodeComparison.jsx             # Code comparison component
└── services/
    └── api.js                          # API endpoints for LLM backend
```

## API Endpoints

The assistant connects to your Python LLM backend running on **port 8001**:

### Chat Endpoints
- `POST /chat` - Send chat message
  ```json
  {
    "message": "How can I improve performance?",
    "history": [...previous messages]
  }
  ```

- `GET /chat/history` - Get chat history
- `DELETE /chat/history` - Clear chat history

### Analysis Endpoints
- `POST /analyze/comparison` - Analyze code comparison
  ```json
  {
    "before": "// original code",
    "after": "// refactored code",
    "language": "javascript"
  }
  ```

- `POST /insights` - Get refactoring insights
  ```json
  {
    "code": "// your code",
    "focus": "memory|performance|quality|general"
  }
  ```

- `GET /health` - Check LLM service health

## Usage

### Accessing the Assistant
Navigate to `/assistant` in your application or click "AI Assistant" in the navigation menu.

### Using the Chat
1. Type your question in the input box
2. Use quick question buttons for common queries
3. Chat history is maintained for context
4. Code snippets are automatically syntax highlighted

### Using Code Comparison
1. Switch to "Code Comparison" tab
2. Paste your original code in "Before" section
3. Paste your refactored code in "After" section
4. Click "Analyze Comparison" button
5. View detailed metrics and analysis
6. Use view mode buttons to switch between layouts

### Example Comparisons Included
- Array Filter Optimization
- Memory-Efficient Data Processing

## Quick Question Examples

1. **"How did you refactor this code?"**
   - Get explanations of refactoring approaches used

2. **"What are the risks in this code?"**
   - Identify potential vulnerabilities and issues

3. **"How can I improve my refactoring skills?"**
   - Receive tips and best practices

4. **"How to increase code performance?"**
   - Get optimization strategies

## Memory Optimization Tips

- Use array methods (filter, map, reduce) instead of loops
- Avoid creating unnecessary intermediate arrays
- Use WeakMap/WeakSet for garbage-collected cache
- Clean up event listeners and timers properly

## Performance Optimization Tips

- Reduce time complexity with appropriate data structures
- Debounce/throttle expensive operations
- Use memoization for expensive computations
- Lazy load components and data when appropriate

## Code Quality Best Practices

- Follow Single Responsibility Principle
- Use descriptive names for variables and functions
- Keep functions small and focused
- Write self-documenting code

## Refactoring Patterns

- **Extract Method**: Break down large functions
- **Replace Conditional with Polymorphism**
- **Introduce Parameter Object**: Group related parameters
- **Strategy Pattern**: Handle algorithm variations

## Backend Requirements

Your Python LLM backend (port 8001) should implement:

1. **Chat endpoint** that:
   - Accepts user message and chat history
   - Returns AI-generated response
   - Handles context from previous messages

2. **Code comparison endpoint** that:
   - Analyzes before/after code
   - Calculates memory and performance metrics
   - Identifies improvements and remaining issues

3. **Health check endpoint** for service monitoring

## Technologies Used

- **React** - UI framework
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP requests
- **React Hot Toast** - Notifications
- **React Syntax Highlighter** - Code display with syntax highlighting
- **React Icons** - Icon components

## Styling

The assistant uses a dark theme with gradient accents:
- Primary: Indigo to Purple gradient
- Background: Gray gradient
- Syntax highlighting: VS Code Dark Plus theme

## Notes

- Ensure your Python LLM backend is running on port 8001
- Chat history is limited to last 10 messages for context
- Timeouts are set to 90 seconds for LLM responses
- Code snippets in chat are automatically detected and highlighted
- The comparison tool works with any programming language

## Future Enhancements

- Support for multiple programming languages
- Real-time collaboration features
- Export comparison reports
- Save favorite insights
- Integration with code editor
- Advanced metrics (cognitive complexity, coupling)
- Historical trend analysis
