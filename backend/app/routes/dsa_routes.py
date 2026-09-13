from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, DsaProblem, DsaSubmission

dsa_bp = Blueprint('dsa', __name__, url_prefix='/api/dsa')

@dsa_bp.route('/problems', methods=['GET'])
def get_dsa_problems():
    topic = request.args.get('topic')
    difficulty = request.args.get('difficulty')

    query = DsaProblem.query
    if topic and topic.strip():
        query = query.filter(DsaProblem.topic.ilike(f"%{topic}%"))
    if difficulty and difficulty.strip():
        query = query.filter_by(difficulty=difficulty)

    problems = query.all()
    return jsonify({'problems': [p.to_dict() for p in problems]}), 200

@dsa_bp.route('/problem/<int:problem_id>', methods=['GET'])
def get_dsa_problem_detail(problem_id):
    problem = DsaProblem.query.get_or_404(problem_id)
    return jsonify({'problem': problem.to_dict()}), 200

@dsa_bp.route('/submit/<int:problem_id>', methods=['POST'])
@jwt_required()
def submit_dsa_solution(problem_id):
    user_id = int(get_jwt_identity())
    problem = DsaProblem.query.get_or_404(problem_id)
    data = request.get_json() or {}
    code = data.get('code', '').strip()

    if not code:
        return jsonify({'error': 'Code content is required.'}), 400

    # Basic code evaluation heuristic or syntax check simulation
    has_return = 'return' in code or 'print' in code
    status = 'Solved' if has_return and len(code) > 20 else 'Attempted'
    score = 100 if status == 'Solved' else 50

    submission = DsaSubmission(
        problem_id=problem_id,
        student_id=user_id,
        code=code,
        status=status,
        score=score
    )
    db.session.add(submission)
    db.session.commit()

    return jsonify({
        'message': 'Solution submitted successfully!',
        'status': status,
        'score': score,
        'submission': submission.to_dict()
    }), 200

@dsa_bp.route('/user-stats', methods=['GET'])
@jwt_required()
def get_user_dsa_stats():
    user_id = int(get_jwt_identity())
    submissions = DsaSubmission.query.filter_by(student_id=user_id).all()
    
    total_solved = len(set([s.problem_id for s in submissions if s.status == 'Solved']))
    total_attempted = len(set([s.problem_id for s in submissions]))
    total_problems = DsaProblem.query.count()

    easy_solved = len(set([s.problem_id for s in submissions if s.status == 'Solved' and s.problem and s.problem.difficulty == 'Easy']))
    medium_solved = len(set([s.problem_id for s in submissions if s.status == 'Solved' and s.problem and s.problem.difficulty == 'Medium']))
    hard_solved = len(set([s.problem_id for s in submissions if s.status == 'Solved' and s.problem and s.problem.difficulty == 'Hard']))

    return jsonify({
        'total_problems': total_problems,
        'total_solved': total_solved,
        'total_attempted': total_attempted,
        'easy_solved': easy_solved,
        'medium_solved': medium_solved,
        'hard_solved': hard_solved,
        'recent_submissions': [s.to_dict() for s in submissions[-5:]]
    }), 200
