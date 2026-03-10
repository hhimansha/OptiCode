import RefactorHistory from '../../models/IT22606860/RefactorHistory.js';
import CodeRisk from '../../models/IT22606860/CodeRisk.js';
import BestPractice from '../../models/IT22606860/BestPractice.js';
import mongoose from 'mongoose';
import axios from 'axios';

// Python ML API URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Helper to compute basic quality metrics
const computeBasicMetrics = (code) => {
    if (!code) return { loc: 0, complexity: 1, maintainabilityIndex: 50 };
    const lines = code.split('\n');
    const loc = lines.length;
    const complexityKeywords = ['if', 'elif', 'else', 'for', 'while', 'try', 'except', 'catch', 'switch', 'case', '&&', '||', 'and', 'or'];
    let complexity = 1;
    complexityKeywords.forEach(kw => {
        const regex = new RegExp(`\\b${kw}\\b`, 'g');
        const matches = code.match(regex);
        if (matches) complexity += matches.length;
    });
    const maintainabilityIndex = Math.max(0, Math.min(100,
        171 - 5.2 * Math.log(Math.max(1, complexity)) - 0.23 * complexity - 16.2 * Math.log(Math.max(1, loc))
    ));
    return { loc, complexity, maintainabilityIndex: parseFloat(maintainabilityIndex.toFixed(2)) };
};

// Helper to analyze and save best practices & security data
const saveBestPracticesAndSecurity = async (originalCode, refactoredCode, historyId, language) => {
    try {
        console.log('\n========================================');
        console.log('[BP&SEC] 🚀 STARTING ANALYSIS');
        console.log('[BP&SEC] History ID:', historyId);
        console.log('[BP&SEC] Code length:', originalCode?.length || 0);
        console.log('[BP&SEC] ML API URL:', ML_API_URL);
        console.log('========================================\n');

        // 1. Call Python best practices API
        let bestPracticesData = null;
        try {
            console.log('[BP&SEC] 📞 Calling best practices API...');
            const bpResponse = await axios.post(`${ML_API_URL}/api/best-practices`, {
                code: originalCode
            }, { timeout: 15000 });

            console.log('[BP&SEC] 📥 Response status:', bpResponse.status);
            if (bpResponse.data && bpResponse.data.success) {
                bestPracticesData = bpResponse.data;
                console.log('[BP&SEC] ✅ Best practices analysis completed');
                console.log('[BP&SEC] Violations found:', bestPracticesData.violations?.length || 0);
                console.log('[BP&SEC] Recommendations found:', bestPracticesData.recommendations?.length || 0);
            } else {
                console.log('[BP&SEC] ⚠️ Response success=false');
            }
        } catch (bpError) {
            console.error('[BP&SEC] ❌ Best practices API FAILED:', bpError.message);
            if (bpError.code === 'ECONNREFUSED') {
                console.error('[BP&SEC] 💡 Python backend is NOT RUNNING on port 8000!');
                console.error('[BP&SEC] 💡 Run: python run_backend.py');
            }
        }

        // 2. Call Python code analysis API (includes security via Bandit)
        let securityData = null;
        try {
            console.log('[BP&SEC] 📞 Calling security analysis API...');
            const secResponse = await axios.post(`${ML_API_URL}/api/analyze`, {
                code: originalCode
            }, { timeout: 15000 });

            console.log('[BP&SEC] 📥 Response status:', secResponse.status);
            if (secResponse.data && secResponse.data.success) {
                securityData = secResponse.data.security;
                console.log('[BP&SEC] ✅ Security analysis completed');
                console.log('[BP&SEC] Security issues found:', securityData?.total_issues || 0);
            } else {
                console.log('[BP&SEC] ⚠️ Security response success=false');
            }
        } catch (secError) {
            console.error('[BP&SEC] ❌ Security API FAILED:', secError.message);
            if (secError.code === 'ECONNREFUSED') {
                console.error('[BP&SEC] 💡 Python backend is NOT RUNNING on port 8000!');
            }
        }

        // 3. Save Best Practices violations to database
        let savedBPCount = 0;
        if (bestPracticesData && bestPracticesData.violations) {
            const violations = bestPracticesData.violations;
            console.log(`[BP&SEC] 💾 Saving ${violations.length} best practice violations...`);

            for (const violation of violations) {
                try {
                    // Map severity: high/medium -> error, low -> warning
                    let mappedSeverity = 'warning';
                    if (violation.severity === 'high') mappedSeverity = 'error';
                    else if (violation.severity === 'medium') mappedSeverity = 'warning';
                    else if (violation.severity === 'low') mappedSeverity = 'info';

                    // Map category to allowed values
                    let mappedCategory = 'pythonic';
                    const principle = (violation.principle || '').toLowerCase();
                    if (principle.includes('pep8') || principle.includes('pep 8')) mappedCategory = 'pep8';
                    else if (principle.includes('security')) mappedCategory = 'security';
                    else if (principle.includes('performance')) mappedCategory = 'performance';
                    else if (principle.includes('anti')) mappedCategory = 'anti-pattern';

                    await BestPractice.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: mappedCategory,
                        severity: mappedSeverity,
                        line: violation.line || 1,
                        code: violation.code || originalCode.split('\n')[0] || 'N/A',
                        message: violation.description || violation.principle || 'Best practice violation',
                        recommendation: violation.recommendation || 'Follow Python best practices',
                        goodExample: violation.example || '# Good: Follow best practices',
                        badExample: violation.badExample || violation.code || '# Bad: Current code',
                        reference: violation.reference || 'PEP 8 Style Guide',
                        applied: false
                    });
                    savedBPCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save best practice:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedBPCount}/${violations.length} violations to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No best practice violations to save');
        }

        // Also save recommendations
        if (bestPracticesData && bestPracticesData.recommendations) {
            const recommendations = bestPracticesData.recommendations;
            console.log(`[BP&SEC] 💾 Saving ${recommendations.length} recommendations...`);

            let savedRecCount = 0;
            for (const rec of recommendations) {
                try {
                    // Map severity: high/medium -> error, low -> info
                    let mappedSeverity = 'info';
                    if (rec.severity === 'high') mappedSeverity = 'error';
                    else if (rec.severity === 'medium') mappedSeverity = 'warning';
                    else if (rec.severity === 'low') mappedSeverity = 'info';

                    // Map category to allowed values
                    let mappedCategory = 'pythonic';
                    const principle = (rec.principle || '').toLowerCase();
                    if (principle.includes('pep8') || principle.includes('pep 8')) mappedCategory = 'pep8';
                    else if (principle.includes('security')) mappedCategory = 'security';
                    else if (principle.includes('performance')) mappedCategory = 'performance';
                    else if (principle.includes('anti')) mappedCategory = 'anti-pattern';

                    await BestPractice.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: mappedCategory,
                        severity: mappedSeverity,
                        line: rec.line || 1,
                        code: rec.code || originalCode.split('\n')[0] || 'N/A',
                        message: rec.description || rec.principle || 'Improvement suggestion',
                        recommendation: rec.recommendation || 'Consider improving this code',
                        goodExample: rec.example || '# Good: Follow best practices',
                        badExample: rec.badExample || rec.code || '# Current code',
                        reference: rec.reference || 'Python Best Practices',
                        applied: false
                    });
                    savedRecCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save recommendation:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedRecCount}/${recommendations.length} recommendations to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No recommendations to save');
        }

        // 4. Save Security issues to database
        let savedSecCount = 0;
        if (securityData && securityData.issues) {
            const issues = securityData.issues;
            console.log(`[BP&SEC] 💾 Saving ${issues.length} security issues...`);

            for (const issue of issues) {
                try {
                    // Map severity: HIGH -> high, MEDIUM -> medium, LOW -> low
                    let mappedSeverity = (issue.issue_severity || 'medium').toLowerCase();
                    if (!['critical', 'high', 'medium', 'low'].includes(mappedSeverity)) {
                        mappedSeverity = 'medium';
                    }

                    await CodeRisk.create({
                        sessionId: historyId.toString(),
                        historyId: historyId,
                        category: 'security',
                        severity: mappedSeverity,
                        line: issue.line_number || 1,
                        code: issue.code || originalCode.split('\n')[(issue.line_number || 1) - 1] || 'N/A',
                        message: issue.issue_text || 'Security vulnerability detected',
                        explanation: issue.issue_text || 'This code contains a potential security vulnerability',
                        fixSuggestion: issue.more_info || 'Review and fix this security issue',
                        impact: issue.issue_confidence || 'HIGH',
                        fixed: false
                    });
                    savedSecCount++;
                } catch (saveError) {
                    console.error('[BP&SEC] ❌ Failed to save security issue:', saveError.message);
                }
            }
            console.log(`[BP&SEC] ✅ Saved ${savedSecCount}/${issues.length} security issues to DB`);
        } else {
            console.log('[BP&SEC] ℹ️ No security issues to save');
        }

        console.log('\n========================================');
        console.log('[BP&SEC] 🎉 ANALYSIS COMPLETE');
        console.log(`[BP&SEC] Summary: ${savedBPCount} BP + ${savedSecCount} Security = ${savedBPCount + savedSecCount} total saved`);
        console.log('========================================\n');
        return true;

    } catch (error) {
        console.error('[BP&SEC] ❌ Error in saveBestPracticesAndSecurity:', error.message);
        return false;
    }
};

// Create new history entry
export const createHistory = async (req, res, next) => {
    try {
        const { 
            originalCode, 
            refactoredCode, 
            language = 'python',
            instruction = 'Unified comprehensive refactoring',
            modelUsed = 'ast',
            processingTime = 0,
            changesApplied = [],
            summary = {}
        } = req.body;

        if (!originalCode || !refactoredCode) {
            return res.status(400).json({
                success: false,
                message: 'Both originalCode and refactoredCode are required'
            });
        }

        // Compute quality metrics
        const beforeMetrics = computeBasicMetrics(originalCode);
        const afterMetrics = computeBasicMetrics(refactoredCode);
        const improvement = {
            locReduction: parseFloat(((beforeMetrics.loc - afterMetrics.loc) / Math.max(beforeMetrics.loc, 1) * 100).toFixed(2)),
            complexityReduction: parseFloat(((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100).toFixed(2)),
            maintainabilityImprovement: parseFloat((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex).toFixed(2)),
            overallScore: parseFloat((((afterMetrics.maintainabilityIndex - beforeMetrics.maintainabilityIndex) + ((beforeMetrics.complexity - afterMetrics.complexity) / Math.max(beforeMetrics.complexity, 1) * 100)) / 2).toFixed(2))
        };

        const history = await RefactorHistory.create({
            userId: req.userId || null,
            inputCode: originalCode,
            originalCode: originalCode,
            refactoredCode: refactoredCode,
            language: language,
            instruction: instruction,
            modelUsed: modelUsed,
            processingTime: processingTime,
            status: 'completed',
            qualityMetrics: {
                before: beforeMetrics,
                after: afterMetrics,
                improvement
            },
            changesApplied: changesApplied,
            summary: summary
        });

        console.log(`[HISTORY] Created history entry: ${history._id}`);

        // ========== NEW: Analyze and save Best Practices & Security data ==========
        // Run async without blocking the response
        saveBestPracticesAndSecurity(originalCode, refactoredCode, history._id, language)
            .catch(err => console.error('[HISTORY] Best practices/security save error:', err.message));

        res.status(201).json({
            success: true,
            data: history,
            historyId: history._id,
            message: 'History saved successfully'
        });
    } catch (error) {
        console.error('[HISTORY CREATE] Error:', error.message);
        next(error);
    }
};

// Get refactoring history with pagination
export const getHistory = async (req, res, next) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            modelUsed, 
            sortBy = 'createdAt' 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build query - scope to authenticated user
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }
        if (modelUsed) {
            query.modelUsed = modelUsed;
        }

        // Get history with pagination - include inputCode for preview
        const history = await RefactorHistory.find(query)
            .sort({ [sortBy]: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('instruction language modelUsed processingTime status createdAt qualityMetrics riskAnalysis changesApplied inputCode refactoredCode'); // Include code for display

        const total = await RefactorHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: history,
            history: history, // For backward compatibility
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Get single history item by ID
export const getHistoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const historyItem = await RefactorHistory.findById(id);

        if (!historyItem) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: historyItem,
            history: historyItem // For backward compatibility
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Update history item (for renaming instruction, adding risk analysis, etc.)
export const updateHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { instruction, riskAnalysis, userRating, userFeedback, accepted } = req.body;

        const updateData = {};
        if (instruction !== undefined) updateData.instruction = instruction;
        if (riskAnalysis !== undefined) updateData.riskAnalysis = riskAnalysis;
        if (userRating !== undefined) updateData.userRating = userRating;
        if (userFeedback !== undefined) updateData.userFeedback = userFeedback;
        if (accepted !== undefined) updateData.accepted = accepted;

        const updated = await RefactorHistory.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        console.log(`[HISTORY] Updated history entry: ${id}`);
        if (riskAnalysis) {
            console.log('[HISTORY] Risk Analysis saved:', {
                before: riskAnalysis.before?.riskScore,
                after: riskAnalysis.after?.riskScore,
                reduction: riskAnalysis.before?.riskScore - riskAnalysis.after?.riskScore
            });
        }

        // ========== EXTRACT SECURITY ISSUES FROM LLM RISK ANALYSIS ==========
        if (riskAnalysis?.detailed) {
            console.log('[RISK→SECURITY] Extracting security issues from LLM risk analysis...');
            
            try {
                const securityIssues = [];
                const riskData = riskAnalysis.detailed;
                
                // 1. Check risk factors for security-related items
                if (riskData.riskFactors && Array.isArray(riskData.riskFactors)) {
                    riskData.riskFactors.forEach((factor, idx) => {
                        const factorName = (factor.factor || '').toLowerCase();
                        const description = (factor.description || '').toLowerCase();
                        
                        // Check if factor is security-related
                        if (factorName.includes('security') || factorName.includes('vulnerability') || 
                            factorName.includes('injection') || factorName.includes('authentication') ||
                            description.includes('security') || description.includes('exploit') ||
                            description.includes('vulnerable') || description.includes('unsafe')) {
                            
                            // Map risk score to severity
                            const riskScore = factor.score || 50;
                            let severity = 'medium';
                            if (riskScore >= 80) severity = 'critical';
                            else if (riskScore >= 60) severity = 'high';
                            else if (riskScore < 30) severity = 'low';
                            
                            securityIssues.push({
                                sessionId: id.toString(),
                                historyId: updated._id,
                                category: 'security',
                                severity: severity,
                                line: 1, // LLM doesn't provide line numbers
                                code: 'N/A',
                                message: factor.factor || 'Security risk factor identified',
                                explanation: factor.description || 'Security concern detected during risk analysis',
                                fixSuggestion: `Risk Score: ${riskScore}/100. Review and address this security concern.`,
                                impact: `${riskData.riskLevel} risk - ${riskData.explanation}`,
                                fixed: false
                            });
                        }
                    });
                }
                
                // 2. Check potential issues for security terms
                if (riskData.potentialIssues && Array.isArray(riskData.potentialIssues)) {
                    riskData.potentialIssues.forEach((issue, idx) => {
                        const issueLower = (issue || '').toLowerCase();
                        
                        if (issueLower.includes('security') || issueLower.includes('vulnerability') ||
                            issueLower.includes('inject') || issueLower.includes('xss') ||
                            issueLower.includes('csrf') || issueLower.includes('unsafe')) {
                            
                            // Map overall risk to severity
                            const riskScore = riskData.riskScore || 50;
                            let severity = 'medium';
                            if (riskScore >= 70) severity = 'high';
                            else if (riskScore < 40) severity = 'low';
                            
                            securityIssues.push({
                                sessionId: id.toString(),
                                historyId: updated._id,
                                category: 'security',
                                severity: severity,
                                line: 1,
                                code: 'N/A',
                                message: 'Potential security issue',
                                explanation: issue || 'Security issue detected by LLM analysis',
                                fixSuggestion: riskData.recommendation || 'Review this security concern before applying changes',
                                impact: riskData.riskLevel || 'medium',
                                fixed: false
                            });
                        }
                    });
                }
                
                // 3. Check if overall risk is high and mentions security
                const explanation = (riskData.explanation || '').toLowerCase();
                if (riskData.riskScore >= 60 && 
                    (explanation.includes('security') || explanation.includes('vulnerable'))) {
                    
                    securityIssues.push({
                        sessionId: id.toString(),
                        historyId: updated._id,
                        category: 'security',
                        severity: riskData.riskScore >= 80 ? 'critical' : 'high',
                        line: 1,
                        code: 'N/A',
                        message: 'High-risk refactoring with security concerns',
                        explanation: riskData.explanation,
                        fixSuggestion: riskData.recommendation || 'Carefully review security implications',
                        impact: `Risk Score: ${riskData.riskScore}/100 - ${riskData.riskLevel} risk`,
                        fixed: false
                    });
                }
                
                // Save security issues to CodeRisk collection
                if (securityIssues.length > 0) {
                    console.log(`[RISK→SECURITY] Found ${securityIssues.length} security-related issues from LLM analysis`);
                    
                    let savedCount = 0;
                    for (const issue of securityIssues) {
                        try {
                            await CodeRisk.create(issue);
                            savedCount++;
                        } catch (err) {
                            console.error('[RISK→SECURITY] Failed to save:', err.message);
                        }
                    }
                    
                    console.log(`[RISK→SECURITY] ✅ Saved ${savedCount}/${securityIssues.length} security issues to CodeRisk`);
                } else {
                    console.log('[RISK→SECURITY] ℹ️  No security-specific issues found in LLM risk analysis');
                }
            } catch (extractError) {
                console.error('[RISK→SECURITY] Error extracting security issues:', extractError.message);
            }
        }
        // ====================================================================

        res.status(200).json({
            success: true,
            data: updated,
            message: 'History updated successfully'
        });
    } catch (error) {
        console.error('[HISTORY UPDATE] Error:', error.message);
        next(error);
    }
};

// Delete a history item
export const deleteHistory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deleted = await RefactorHistory.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'History item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'History item deleted successfully'
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Clear all history
export const clearAllHistory = async (req, res, next) => {
    try {
        // Build query - only delete user's own history if authenticated
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const result = await RefactorHistory.deleteMany(query);

        res.status(200).json({
            success: true,
            message: req.user 
                ? `Deleted ${result.deletedCount} history items`
                : 'All history cleared successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('[HISTORY] Error:', error.message);
        next(error);
    }
};

// Get history statistics
export const getHistoryStats = async (req, res, next) => {
    try {
        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const stats = await RefactorHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalRefactorings: { $sum: 1 },
                    avgProcessingTime: { $avg: '$processingTime' },
                    totalProcessingTime: { $sum: '$processingTime' },
                    byModel: {
                        $push: '$modelUsed'
                    },
                    byLanguage: {
                        $push: '$language'
                    },
                    avgRating: { $avg: '$userRating' },
                    acceptedCount: {
                        $sum: { $cond: ['$accepted', 1, 0] }
                    }
                }
            }
        ]);

        // Count by model
        const modelCounts = {};
        if (stats.length > 0 && stats[0].byModel) {
            stats[0].byModel.forEach(model => {
                if (model) {
                    modelCounts[model] = (modelCounts[model] || 0) + 1;
                }
            });
        }

        // Count by language
        const languageCounts = {};
        if (stats.length > 0 && stats[0].byLanguage) {
            stats[0].byLanguage.forEach(lang => {
                if (lang) {
                    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
                }
            });
        }

        res.status(200).json({
            success: true,
            stats: stats.length > 0 ? {
                totalRefactorings: stats[0].totalRefactorings,
                avgProcessingTime: Math.round(stats[0].avgProcessingTime || 0),
                totalProcessingTime: stats[0].totalProcessingTime,
                avgRating: stats[0].avgRating ? stats[0].avgRating.toFixed(2) : null,
                acceptedCount: stats[0].acceptedCount,
                acceptanceRate: stats[0].totalRefactorings > 0 
                    ? ((stats[0].acceptedCount / stats[0].totalRefactorings) * 100).toFixed(2) 
                    : 0,
                modelCounts,
                languageCounts
            } : {
                totalRefactorings: 0,
                avgProcessingTime: 0,
                totalProcessingTime: 0,
                avgRating: null,
                acceptedCount: 0,
                acceptanceRate: 0,
                modelCounts: {},
                languageCounts: {}
            }
        });
    } catch (error) {
        console.error('[HISTORY STATS] Error:', error.message);
        next(error);
    }
};

// Get recent history (last N items)
export const getRecentHistory = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;
        const limitNum = parseInt(limit);

        const query = {};
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        const recent = await RefactorHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(limitNum)
            .select('instruction language modelUsed processingTime userRating createdAt');

        res.status(200).json({
            success: true,
            data: recent
        });
    } catch (error) {
        console.error('[RECENT HISTORY] Error:', error.message);
        next(error);
    }
};

// Search history
export const searchHistory = async (req, res, next) => {
    try {
        const { 
            query: searchQuery, 
            language, 
            modelUsed, 
            page = 1, 
            limit = 10 
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = {};
        
        // User filter
        if (req.userId) {
            query.userId = new mongoose.Types.ObjectId(req.userId);
        }

        // Search in instruction or code
        if (searchQuery) {
            query.$or = [
                { instruction: { $regex: searchQuery, $options: 'i' } },
                { originalCode: { $regex: searchQuery, $options: 'i' } }
            ];
        }

        // Filter by language
        if (language) {
            query.language = language;
        }

        // Filter by model
        if (modelUsed) {
            query.modelUsed = modelUsed;
        }

        const results = await RefactorHistory.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select('-originalCode -refactoredCode');

        const total = await RefactorHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: results,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[SEARCH HISTORY] Error:', error.message);
        next(error);
    }
};