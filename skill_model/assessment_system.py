# coding_skill_assessor/02_assessment_system.py
import pandas as pd
import numpy as np
import joblib
from typing import List, Dict, Any

class CodingSkillAssessor:
    def __init__(self, model_path: str = 'coding_skill_classifier.pkl', 
                 encoder_path: str = 'label_encoder.pkl'):
        print("Loading coding skill assessment system...")
        try:
            self.model = joblib.load(model_path)
            self.encoder = joblib.load(encoder_path)
            self.feature_names = ['foundational_coding', 'problem_solving', 'workflow', 
                                'tools', 'computational', 'confidence', 'average_score']
            self.quiz_structure = self._define_quiz_structure()
            print("Assessment system loaded successfully!")
        except FileNotFoundError as e:
            print(f"Error loading files: {e}")
            print("Please run train_model.py first to create the model files")
            raise
    
    def _define_quiz_structure(self) -> Dict[str, List[int]]:
        return {
            'foundational_coding': list(range(0, 5)),
            'problem_solving': list(range(5, 10)),
            'workflow': list(range(10, 15)),
            'tools': list(range(15, 20)),
            'computational': list(range(20, 25)),
            'confidence': list(range(25, 30))
        }
    
    def answer_to_score(self, answer_index: int) -> int:
        return answer_index + 1
    
    def process_quiz_responses(self, quiz_answers: List[int]) -> Dict[str, float]:
        if len(quiz_answers) != 30:
            raise ValueError(f"Expected 30 answers, got {len(quiz_answers)}")
        
        print("Processing quiz responses...")
        
        answer_scores = [self.answer_to_score(ans) for ans in quiz_answers]
        
        category_scores = {}
        for category, question_indices in self.quiz_structure.items():
            category_total = sum(answer_scores[i] for i in question_indices)
            category_avg = category_total / len(question_indices)
            category_scores[category] = round(category_avg, 2)
            print(f"  {category}: {category_avg:.2f}")
        
        category_scores['average_score'] = round(sum(category_scores.values()) / 6, 2)
        print(f"  Overall average: {category_scores['average_score']:.2f}")
        
        return category_scores
    
    def predict_skill_level(self, quiz_answers: List[int]) -> Dict[str, Any]:
        print("Making skill level prediction...")
        
        features = self.process_quiz_responses(quiz_answers)
        
        feature_vector = [features[col] for col in self.feature_names]
        feature_df = pd.DataFrame([feature_vector], columns=self.feature_names)
        
        prediction_encoded = self.model.predict(feature_df)[0]
        prediction_proba = self.model.predict_proba(feature_df)[0]
        
        skill_level = self.encoder.inverse_transform([prediction_encoded])[0]
        confidence = round(prediction_proba[prediction_encoded] * 100, 1)
        
        print(f"Prediction: {skill_level} (Confidence: {confidence}%)")
        
        class_probabilities = {}
        for i, class_name in enumerate(self.encoder.classes_):
            class_probabilities[class_name] = f"{prediction_proba[i]*100:.1f}%"
        
        return {
            'skill_level': skill_level,
            'confidence': f"{confidence}%",
            'confidence_raw': confidence,
            'category_scores': features,
            'probabilities': class_probabilities
        }

def display_results(prediction: Dict, analysis: Dict):
    print("\n" + "="*60)
    print("CODING SKILL ASSESSMENT RESULTS")
    print("="*60)
    
    print(f"OVERALL ASSESSMENT:")
    print(f"  Skill Level: {prediction['skill_level']}")
    print(f"  Confidence: {prediction['confidence']}")
    print(f"  Overall Score: {prediction['category_scores']['average_score']}/5.0")
    
    print(f"CATEGORY SCORES:")
    for category, score in prediction['category_scores'].items():
        if category != 'average_score':
            stars = "*" * int(score)
            print(f"  {category.replace('_', ' ').title():<20}: {score:.2f} {stars}")
    
    print(f"PROBABILITY DISTRIBUTION:")
    for level in ['Beginner', 'Intermediate', 'Advanced']:
        if level in prediction['probabilities']:
            print(f"  {level:<12}: {prediction['probabilities'][level]}")
    
    print(f"STRENGTHS:")
    if analysis['strengths']:
        for strength in analysis['strengths']:
            print(f"  [STRONG] {strength['message']} (Score: {strength['score']})")
    else:
        print("  No standout strengths identified")
    
    print(f"IMPROVEMENT AREAS:")
    if analysis['improvement_areas']:
        for area in analysis['improvement_areas']:
            print(f"  [NEEDS WORK] {area['message']} (Score: {area['score']})")
    else:
        print("  No major improvement areas identified")
    
    print(f"RECOMMENDATIONS:")
    for i, recommendation in enumerate(analysis['recommendations'], 1):
        print(f"  {i}. {recommendation}")
    
    print("="*60)