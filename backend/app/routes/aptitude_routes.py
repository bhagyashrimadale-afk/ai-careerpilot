import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, AptitudeCategory, AptitudeQuestion, AptitudeTestResult

aptitude_bp = Blueprint('aptitude', __name__, url_prefix='/api/aptitude')

@aptitude_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = AptitudeCategory.query.all()
    return jsonify({'categories': [c.to_dict() for c in categories]}), 200

@aptitude_bp.route('/quiz/<int:category_id>', methods=['GET'])
def get_quiz_questions(category_id):
    questions = AptitudeQuestion.query.filter_by(category_id=category_id).limit(10).all()
    return jsonify({
        'category_id': category_id,
        'questions': [q.to_dict(include_answer=False) for q in questions],
        'time_limit_seconds': len(questions) * 90 # 1.5 min per question
    }), 200

@aptitude_bp.route('/submit/<int:category_id>', methods=['POST'])
@jwt_required()
def submit_quiz(category_id):
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    answers = data.get('answers', {}) # Dict of { question_id: "A" }

    questions = AptitudeQuestion.query.filter_by(category_id=category_id).all()
    if not questions:
        return jsonify({'error': 'No questions found for category.'}), 404

    correct_count = 0
    weak_topics = set()
    question_details = []

    for q in questions:
        user_ans = answers.get(str(q.id)) or answers.get(q.id)
        is_correct = (user_ans == q.correct_option)
        
        if is_correct:
            correct_count += 1
        else:
            weak_topics.add(q.topic_tag or "General")

        question_details.append({
            'question_id': q.id,
            'question_text': q.question_text,
            'user_answer': user_ans,
            'correct_answer': q.correct_option,
            'is_correct': is_correct,
            'explanation': q.explanation,
            'topic_tag': q.topic_tag
        })

    total_q = len(questions)
    score_pct = (correct_count / max(total_q, 1)) * 100

    result = AptitudeTestResult(
        student_id=user_id,
        category_id=category_id,
        total_questions=total_q,
        correct_answers=correct_count,
        score_percentage=score_pct,
        weak_topics=json.dumps(list(weak_topics))
    )
    db.session.add(result)
    db.session.commit()

    return jsonify({
        'message': 'Quiz submitted!',
        'total_questions': total_q,
        'correct_answers': correct_count,
        'score_percentage': round(score_pct, 1),
        'weak_topics': list(weak_topics),
        'details': question_details
    }), 200

@aptitude_bp.route('/results', methods=['GET'])
@jwt_required()
def get_user_results():
    user_id = int(get_jwt_identity())
    results = AptitudeTestResult.query.filter_by(student_id=user_id).order_by(AptitudeTestResult.completed_at.desc()).all()
    return jsonify({'results': [r.to_dict() for r in results]}), 200
