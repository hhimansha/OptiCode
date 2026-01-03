class ComparisonService {
    /**
     * Compare multiple model outputs
     */
    compareModels(modelResults) {
        if (!Array.isArray(modelResults) || modelResults.length === 0) {
            return null;
        }

        // Calculate scores for each model
        const scoredModels = modelResults.map(model => {
            let score = 0;

            // Quality score (40 points)
            if (model.qualityMetrics?.improvement?.overallScore) {
                score += (model.qualityMetrics.improvement.overallScore / 100) * 40;
            }

            // Processing time (20 points - faster is better)
            if (model.processing_time) {
                if (model.processing_time < 1000) {
                    score += 20;
                } else if (model.processing_time < 3000) {
                    score += 15;
                } else if (model.processing_time < 5000) {
                    score += 10;
                } else {
                    score += 5;
                }
            }

            // Risk reduction (20 points)
            if (model.riskAnalysis?.risksFixed !== undefined) {
                score += Math.min(20, model.riskAnalysis.risksFixed * 2);
            }

            // Code length reduction (10 points)
            if (model.qualityMetrics?.improvement?.locReduction) {
                score += Math.min(10, (model.qualityMetrics.improvement.locReduction / 10));
            }

            // Complexity reduction (10 points)
            if (model.qualityMetrics?.improvement?.complexityReduction) {
                score += Math.min(10, model.qualityMetrics.improvement.complexityReduction);
            }

            return {
                ...model,
                totalScore: Math.round(score)
            };
        });

        // Sort by score
        scoredModels.sort((a, b) => b.totalScore - a.totalScore);

        // Find winner
        const winner = scoredModels[0];

        return {
            models: scoredModels,
            winner: {
                model_id: winner.model_id,
                model_name: winner.model_name,
                score: winner.totalScore,
                reasons: this._getWinnerReasons(winner, scoredModels)
            },
            comparison: this._generateComparison(scoredModels)
        };
    }

    /**
     * Get reasons why a model won
     */
    _getWinnerReasons(winner, allModels) {
        const reasons = [];

        // Best quality
        const bestQuality = Math.max(...allModels.map(m => 
            m.qualityMetrics?.improvement?.overallScore || 0
        ));
        if (winner.qualityMetrics?.improvement?.overallScore === bestQuality) {
            reasons.push('Highest quality improvement');
        }

        // Fastest
        const fastest = Math.min(...allModels.map(m => m.processing_time || Infinity));
        if (winner.processing_time === fastest) {
            reasons.push('Fastest processing time');
        }

        // Most risks fixed
        const mostRisksFixed = Math.max(...allModels.map(m => 
            m.riskAnalysis?.risksFixed || 0
        ));
        if (winner.riskAnalysis?.risksFixed === mostRisksFixed) {
            reasons.push('Fixed most security risks');
        }

        // Best complexity reduction
        const bestComplexity = Math.max(...allModels.map(m => 
            m.qualityMetrics?.improvement?.complexityReduction || 0
        ));
        if (winner.qualityMetrics?.improvement?.complexityReduction === bestComplexity) {
            reasons.push('Best complexity reduction');
        }

        return reasons.length > 0 ? reasons : ['Best overall score'];
    }

    /**
     * Generate detailed comparison
     */
    _generateComparison(models) {
        return {
            qualityScores: models.map(m => ({
                model: m.model_name,
                score: m.qualityMetrics?.improvement?.overallScore || 0
            })),
            processingTimes: models.map(m => ({
                model: m.model_name,
                time: m.processing_time
            })),
            risksFixed: models.map(m => ({
                model: m.model_name,
                fixed: m.riskAnalysis?.risksFixed || 0
            })),
            codeReduction: models.map(m => ({
                model: m.model_name,
                reduction: m.qualityMetrics?.improvement?.locReduction || 0
            }))
        };
    }

    /**
     * Generate voting recommendation
     */
    generateVotingRecommendation(models) {
        const comparison = this.compareModels(models);
        
        if (!comparison) {
            return {
                recommended: null,
                reason: 'No models available for comparison'
            };
        }

        return {
            recommended: comparison.winner.model_id,
            modelName: comparison.winner.model_name,
            score: comparison.winner.score,
            reasons: comparison.winner.reasons,
            alternatives: comparison.models.slice(1).map(m => ({
                model_id: m.model_id,
                model_name: m.model_name,
                score: m.totalScore
            }))
        };
    }
}

module.exports = new ComparisonService();