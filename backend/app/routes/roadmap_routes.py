import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, CareerRoadmap, StudentProfile
from app.services.ai_service import AIService

roadmap_bp = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')

@roadmap_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_roadmap():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}

    target_role = data.get('target_role') or (profile.target_role if profile else 'Full Stack Developer')
    skills = [s.name for s in profile.skills] if profile else []

    milestones = AIService.generate_career_roadmap(target_role, skills)

    roadmap = CareerRoadmap.query.filter_by(student_id=user_id, target_role=target_role).first()
    if not roadmap:
        roadmap = CareerRoadmap(
            student_id=user_id,
            target_role=target_role,
            steps=json.dumps(milestones),
            current_step_index=1
        )
        db.session.add(roadmap)
    else:
        roadmap.steps = json.dumps(milestones)

    db.session.commit()

    return jsonify({
        'message': 'Roadmap generated successfully!',
        'roadmap': {
            'id': roadmap.id,
            'target_role': target_role,
            'milestones': milestones,
            'current_step_index': roadmap.current_step_index
        }
    }), 200

@roadmap_bp.route('/', methods=['GET'])
@jwt_required()
def get_roadmap():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    target_role = profile.target_role if profile else 'Full Stack Developer'

    roadmap = CareerRoadmap.query.filter_by(student_id=user_id).order_by(CareerRoadmap.created_at.desc()).first()
    if not roadmap:
        skills = [s.name for s in profile.skills] if profile else []
        milestones = AIService.generate_career_roadmap(target_role, skills)
        roadmap = CareerRoadmap(
            student_id=user_id,
            target_role=target_role,
            steps=json.dumps(milestones),
            current_step_index=1
        )
        db.session.add(roadmap)
        db.session.commit()

    try:
        steps_list = json.loads(roadmap.steps)
    except:
        steps_list = []

    return jsonify({
        'roadmap': {
            'id': roadmap.id,
            'target_role': roadmap.target_role,
            'milestones': steps_list,
            'current_step_index': roadmap.current_step_index
        }
    }), 200
