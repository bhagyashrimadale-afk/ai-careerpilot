import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, StudentProfile
from app.services.ai_service import AIService

resume_bp = Blueprint('resume', __name__, url_prefix='/api/resume')

@resume_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_resume():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({'error': 'Profile not found. Please create profile first.'}), 404
        
    data = request.get_json(silent=True) or request.get_json(force=True) or {}
    resume_text = data.get('resume_text', '').strip()
    target_role = data.get('target_role', '').strip() or profile.target_role or 'Full Stack Developer'

    # Check for file upload if request is multipart/form-data
    if 'resume_file' in request.files:
        file = request.files['resume_file']
        if file and file.filename:
            content = file.read().decode('utf-8', errors='ignore')
            if content.strip():
                resume_text = content.strip()

    if not resume_text and profile.resume_text:
        resume_text = profile.resume_text

    if not resume_text:
        return jsonify({'error': 'Please provide resume text or upload a valid resume file for ATS analysis.'}), 400

    # Trigger AI analysis
    analysis_result = AIService.analyze_resume_ats(resume_text, target_role)
    
    # Save to profile
    profile.resume_text = resume_text
    profile.target_role = target_role
    profile.ats_score = analysis_result.get('ats_score', 0)
    profile.missing_skills = json.dumps(analysis_result.get('missing_skills', []))
    profile.ats_analysis = json.dumps(analysis_result)
    
    db.session.commit()

    return jsonify({
        'message': 'Resume ATS Analysis complete!',
        'analysis': analysis_result,
        'ats_score': profile.ats_score
    }), 200

@resume_bp.route('/latest', methods=['GET'])
@jwt_required()
def get_latest_analysis():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not profile or not profile.ats_analysis:
        return jsonify({'analysis': None, 'ats_score': 0}), 200
        
    try:
        analysis_data = json.loads(profile.ats_analysis)
    except:
        analysis_data = None
        
    return jsonify({
        'analysis': analysis_data,
        'ats_score': profile.ats_score,
        'target_role': profile.target_role,
        'resume_text': profile.resume_text
    }), 200
