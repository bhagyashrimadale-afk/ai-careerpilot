from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, MockInterview, InterviewResponse, StudentProfile
from app.services.ai_service import AIService

interview_bp = Blueprint('interview', __name__, url_prefix='/api/interview')

DEFAULT_QUESTIONS_BY_ROLE = {
    "Full Stack Developer": [
        {"text": "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?", "type": "Technical"},
        {"text": "How do JWT (JSON Web Tokens) work for authenticating REST APIs?", "type": "Technical"},
        {"text": "Describe a challenging project bug you encountered and how you solved it.", "type": "Behavioral"},
        {"text": "What is the Virtual DOM in React and how does reconciliation work?", "type": "Technical"},
        {"text": "Where do you see yourself professionally in 3 years?", "type": "HR"}
    ],
    "Frontend Developer": [
        {"text": "Explain React hooks rules and why we cannot call hooks inside loops or conditions.", "type": "Technical"},
        {"text": "How do you optimize a React web application for peak loading performance?", "type": "Technical"},
        {"text": "What is CSS Flexbox vs Grid and when do you use each?", "type": "Technical"},
        {"text": "How do you handle conflict or tight deadlines when working in a development team?", "type": "Behavioral"}
    ],
    "Software Engineer": [
        {"text": "Explain time and space complexity of QuickSort vs MergeSort.", "type": "Technical"},
        {"text": "How do you handle API error scenarios and maintain resilience in backends?", "type": "Technical"},
        {"text": "Tell me about a time you had to learn a new technology quickly under pressure.", "type": "Behavioral"}
    ]
}

@interview_bp.route('/start', methods=['POST'])
@jwt_required()
def start_interview():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    
    target_role = data.get('target_role') or (profile.target_role if profile else 'Full Stack Developer')
    experience_level = data.get('experience_level', 'Entry Level')

    interview = MockInterview(
        student_id=user_id,
        target_role=target_role,
        experience_level=experience_level
    )
    db.session.add(interview)
    db.session.commit()

    questions = DEFAULT_QUESTIONS_BY_ROLE.get(target_role, DEFAULT_QUESTIONS_BY_ROLE["Software Engineer"])

    return jsonify({
        'message': 'Mock Interview session initialized!',
        'interview_id': interview.id,
        'target_role': target_role,
        'questions': questions
    }), 201

@interview_bp.route('/evaluate-answer', methods=['POST'])
@jwt_required()
def evaluate_answer():
    data = request.get_json() or {}
    interview_id = data.get('interview_id')
    question_text = data.get('question_text', '').strip()
    question_type = data.get('question_type', 'Technical')
    user_answer = data.get('user_answer', '').strip()

    if not interview_id or not question_text or not user_answer:
        return jsonify({'error': 'Interview ID, question, and answer are required.'}), 400

    interview = MockInterview.query.get_or_404(interview_id)

    # AI Evaluation
    eval_res = AIService.evaluate_interview_answer(
        question_text=question_text,
        question_type=question_type,
        user_answer=user_answer,
        target_role=interview.target_role
    )

    score = eval_res.get('score', 70)
    feedback = eval_res.get('feedback', 'Good answer!')
    suggested = eval_res.get('suggested_improvement', '')

    response = InterviewResponse(
        interview_id=interview_id,
        question_text=question_text,
        question_type=question_type,
        user_answer=user_answer,
        score=score,
        feedback=feedback,
        suggested_improvement=suggested
    )
    db.session.add(response)

    # Recalculate interview overall score
    all_responses = InterviewResponse.query.filter_by(interview_id=interview_id).all()
    scores = [r.score for r in all_responses] + [score]
    interview.overall_score = int(sum(scores) / len(scores))
    interview.feedback_summary = f"Completed {len(scores)} questions with average score of {interview.overall_score}%."
    
    db.session.commit()

    return jsonify({
        'evaluation': {
            'score': score,
            'feedback': feedback,
            'suggested_improvement': suggested
        },
        'interview_overall_score': interview.overall_score
    }), 200

@interview_bp.route('/history', methods=['GET'])
@jwt_required()
def get_interview_history():
    user_id = int(get_jwt_identity())
    interviews = MockInterview.query.filter_by(student_id=user_id).order_by(MockInterview.created_at.desc()).all()
    return jsonify({'interviews': [i.to_dict() for i in interviews]}), 200
