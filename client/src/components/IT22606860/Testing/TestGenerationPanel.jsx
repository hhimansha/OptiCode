// import React, { useState } from 'react';
// import { FaFlask, FaCheckCircle, FaTimesCircle, FaCopy } from 'react-icons/fa';
// import toast from 'react-hot-toast';

// const TestGenerationPanel = ({ tests, onGenerate, loading }) => {
//     // const [generatedTests, setGeneratedTests] = useState(tests || '');

//     const handleCopy = () => {
//         navigator.clipboard.writeText(generatedTests);
//         toast.success('Tests copied to clipboard!');
//     };

//     return (
//         <div className="card">
//             <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                     <FaFlask /> Automated Test Generation
//                 </h3>
//                 {!loading && (
//                     <button
//                         onClick={onGenerate}
//                         className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
//                     >
//                         Generate Tests
//                     </button>
//                 )}
//             </div>

//             {loading && (
//                 <div className="text-center py-8">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
//                     <p className="text-white mt-4">Generating tests...</p>
//                 </div>
//             )}

//             {!loading && generatedTests && (
//                 <div>
//                     <div className="flex items-center justify-between mb-3">
//                         <p className="text-gray-300">Generated test code:</p>
//                         <button
//                             onClick={handleCopy}
//                             className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
//                         >
//                             <FaCopy /> Copy
//                         </button>
//                     </div>
//                     <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
//                         {generatedTests}
//                     </pre>

//                     <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
//                         <p className="text-sm text-blue-400 font-semibold mb-2">💡 How to use:</p>
//                         <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
//                             <li>Copy the generated test code</li>
//                             <li>Save it to a file named <code className="bg-gray-800 px-1 rounded">test_code.py</code></li>
//                             <li>Run: <code className="bg-gray-800 px-1 rounded">pytest test_code.py</code></li>
//                         </ol>
//                     </div>
//                 </div>
//             )}

//             {!loading && !generatedTests && (
//                 <div className="text-center py-8 text-gray-400">
//                     <FaFlask className="text-6xl mx-auto mb-4 opacity-50" />
//                     <p>Click "Generate Tests" to create automated test cases</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TestGenerationPanel;