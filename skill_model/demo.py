# coding_skill_assessor/03_demo.py
from assessment_system import CodingSkillAssessor, display_results

def run_demo():
    print("CODING SKILL ASSESSMENT SYSTEM DEMO")
    print("=" * 50)
    
    try:
        assessor = CodingSkillAssessor()
        print("Assessor initialized successfully!")
    except Exception as e:
        print(f"Failed to initialize assessor: {e}")
        return
    
    student_profiles = {
        "Beginner Student": 
            [0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        
        "Intermediate Student":
            [2, 2, 3, 2, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
        
        "Advanced Student":
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
    }
    
    for profile_name, quiz_answers in student_profiles.items():
        print(f"\n{'='*50}")
        print(f"TESTING: {profile_name}")
        print(f"{'='*50}")
        
        try:
            prediction = assessor.predict_skill_level(quiz_answers)
            
            # Generate analysis without calling predict again
            analysis = get_analysis_from_prediction(prediction)
            
            display_results(prediction, analysis)
            
        except Exception as e:
            print(f"Error processing {profile_name}: {e}")
            continue
    
    print("\nDemo completed successfully!")

def get_analysis_from_prediction(prediction):
    """Generate analysis from existing prediction without re-predicting"""
    scores = prediction['category_scores']
    
    analysis = {
        'strengths': [],
        'improvement_areas': [],
        'recommendations': []
    }
    
    # Identify strengths and improvement areas
    for category, score in scores.items():
        if category != 'average_score':
            category_name = category.replace('_', ' ').title()
            if score >= 4.0:
                analysis['strengths'].append({
                    'category': category_name,
                    'score': score,
                    'message': f"Excellent performance in {category_name}"
                })
            elif score <= 2.5:
                analysis['improvement_areas'].append({
                    'category': category_name, 
                    'score': score,
                    'message': f"Needs improvement in {category_name}"
                })
    
    # Generate recommendations
    skill_level = prediction['skill_level']
    if skill_level == 'Beginner':
        analysis['recommendations'] = [
            "Focus on basic programming concepts and syntax",
            "Practice with simple coding exercises daily", 
            "Learn fundamental algorithms and data structures",
            "Build small projects to gain hands-on experience",
            "Join coding communities for support and guidance"
        ]
    elif skill_level == 'Intermediate':
        analysis['recommendations'] = [
            "Work on larger, more complex projects",
            "Learn about software design patterns and architecture",
            "Practice debugging and troubleshooting complex issues", 
            "Collaborate with other developers on group projects",
            "Study advanced algorithms and optimization techniques"
        ]
    else:  # Advanced
        analysis['recommendations'] = [
            "Contribute to open source projects",
            "Mentor other developers and share knowledge", 
            "Explore advanced algorithms and system design",
            "Learn about DevOps, testing, and deployment strategies",
            "Stay updated with latest technologies and frameworks"
        ]
    
    return analysis

def interactive_mode():
    print("\nINTERACTIVE MODE")
    print("=" * 30)
    print("Enter quiz responses for a custom student profile")
    print("For each question, enter 0-4 (0=lowest, 4=highest)")
    
    try:
        assessor = CodingSkillAssessor()
    except Exception as e:
        print(f"Failed to initialize assessor: {e}")
        return
    
    print("\nPlease enter 30 numbers (0-4) separated by spaces:")
    print("Example: 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3 2 3")
    
    try:
        input_str = input("Quiz answers: ").strip()
        quiz_answers = [int(x) for x in input_str.split()]
        
        if len(quiz_answers) != 30:
            print("Please enter exactly 30 numbers")
            return
            
    except ValueError:
        print("Please enter valid numbers (0-4)")
        return
    except Exception as e:
        print(f"Error: {e}")
        return
    
    try:
        prediction = assessor.predict_skill_level(quiz_answers)
        analysis = get_analysis_from_prediction(prediction)
        display_results(prediction, analysis)
    except Exception as e:
        print(f"Error during assessment: {e}")

if __name__ == "__main__":
    print("Coding Skill Assessment System")
    print("1. Run Demo")
    print("2. Interactive Mode")
    
    choice = input("Select mode (1 or 2): ").strip()
    
    if choice == "1":
        run_demo()
    elif choice == "2":
        interactive_mode()
    else:
        print("Invalid choice")