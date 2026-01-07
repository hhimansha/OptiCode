const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/IT22606860';

// Test code sample
const testCode = `
def calculate_total(items):
    result = []
    for i in range(len(items)):
        result.append(items[i] * 2)
    return result
`;

async function testRefactorAPI() {
    try {
        console.log('Testing Refactor API...\n');

        // 1. Refactor code
        console.log('1. Refactoring code...');
        const refactorResponse = await axios.post(`${BASE_URL}/refactor/refactor`, {
            code: testCode,
            instruction: 'Refactor this code',
            language: 'python'
        });
        console.log('✓ Refactored successfully');
        console.log('Processing time:', refactorResponse.data.processing_time, 'ms\n');

        // 2. Analyze risks
        console.log('2. Analyzing risks...');
        const riskResponse = await axios.post(`${BASE_URL}/risks/analyze`, {
            code: testCode
        });
        console.log('✓ Risks found:', riskResponse.data.total);
        console.log('Risk score:', riskResponse.data.risk_score, '/100\n');

        // 3. Analyze best practices
        console.log('3. Analyzing best practices...');
        const practicesResponse = await axios.post(`${BASE_URL}/best-practices/analyze`, {
            code: testCode
        });
        console.log('✓ Violations found:', practicesResponse.data.violations.length);
        console.log('By severity:', practicesResponse.data.by_severity, '\n');

        // 4. Execute code
        console.log('4. Executing code...');
        const executeResponse = await axios.post(`${BASE_URL}/refactor/execute`, {
            code: testCode
        });
        console.log('✓ Execution result:', executeResponse.data.success ? 'Success' : 'Failed\n');

        // 5. Get analytics
        console.log('5. Getting analytics dashboard...');
        const analyticsResponse = await axios.get(`${BASE_URL}/analytics/dashboard`);
        console.log('✓ Total refactorings:', analyticsResponse.data.dashboard.totalRefactorings);
        console.log('Average improvement:', analyticsResponse.data.dashboard.avgQualityImprovement, '%\n');

        console.log('✅ All tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

// Run tests
testRefactorAPI();