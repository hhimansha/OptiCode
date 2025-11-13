from flask import Flask, request, jsonify
from flask_cors import CORS
from assessment_system import CodingSkillAssessor

app = Flask(__name__)
CORS(app)
assessor = CodingSkillAssessor()

@app.route('/')
def home():
    return jsonify({"message": "Skill model API is running"})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        answers = data.get('quiz_answers', [])
        prediction = assessor.predict_skill_level(answers)
        return jsonify(prediction)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
