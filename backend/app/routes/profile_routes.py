from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, StudentProfile, Education, Skill, Project, Certification

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id, headline="Student", target_role="Software Engineer")
        db.session.add(profile)
        db.session.commit()
    return jsonify({'profile': profile.to_dict()}), 200

@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    if not profile:
        profile = StudentProfile(user_id=user_id)
        db.session.add(profile)
        
    data = request.get_json() or {}
    profile.headline = data.get('headline', profile.headline)
    profile.target_role = data.get('target_role', profile.target_role)
    profile.bio = data.get('bio', profile.bio)
    profile.phone = data.get('phone', profile.phone)
    profile.github_url = data.get('github_url', profile.github_url)
    profile.linkedin_url = data.get('linkedin_url', profile.linkedin_url)
    profile.portfolio_url = data.get('portfolio_url', profile.portfolio_url)
    profile.resume_text = data.get('resume_text', profile.resume_text)
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully!', 'profile': profile.to_dict()}), 200

@profile_bp.route('/education', methods=['POST'])
@jwt_required()
def add_education():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    
    edu = Education(
        profile_id=profile.id,
        institution=data.get('institution', ''),
        degree=data.get('degree', ''),
        field_of_study=data.get('field_of_study', ''),
        start_year=data.get('start_year', ''),
        end_year=data.get('end_year', ''),
        grade=data.get('grade', '')
    )
    db.session.add(edu)
    db.session.commit()
    return jsonify({'message': 'Education added!', 'education': edu.to_dict()}), 201

@profile_bp.route('/education/<int:edu_id>', methods=['DELETE'])
@jwt_required()
def delete_education(edu_id):
    edu = Education.query.get(edu_id)
    if edu:
        db.session.delete(edu)
        db.session.commit()
    return jsonify({'message': 'Education removed!'}), 200

@profile_bp.route('/skill', methods=['POST'])
@jwt_required()
def add_skill():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'Skill name is required'}), 400
        
    skill = Skill(
        profile_id=profile.id,
        name=name,
        level=data.get('level', 'Intermediate'),
        category=data.get('category', 'Technical')
    )
    db.session.add(skill)
    db.session.commit()
    return jsonify({'message': 'Skill added!', 'skill': skill.to_dict()}), 201

@profile_bp.route('/skill/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    skill = Skill.query.get(skill_id)
    if skill:
        db.session.delete(skill)
        db.session.commit()
    return jsonify({'message': 'Skill removed!'}), 200

@profile_bp.route('/project', methods=['POST'])
@jwt_required()
def add_project():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    
    proj = Project(
        profile_id=profile.id,
        title=data.get('title', ''),
        description=data.get('description', ''),
        tech_stack=data.get('tech_stack', ''),
        repo_url=data.get('repo_url', ''),
        live_url=data.get('live_url', '')
    )
    db.session.add(proj)
    db.session.commit()
    return jsonify({'message': 'Project added!', 'project': proj.to_dict()}), 201

@profile_bp.route('/project/<int:proj_id>', methods=['DELETE'])
@jwt_required()
def delete_project(proj_id):
    proj = Project.query.get(proj_id)
    if proj:
        db.session.delete(proj)
        db.session.commit()
    return jsonify({'message': 'Project removed!'}), 200

@profile_bp.route('/certification', methods=['POST'])
@jwt_required()
def add_certification():
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    
    cert = Certification(
        profile_id=profile.id,
        title=data.get('title', ''),
        issuer=data.get('issuer', ''),
        issue_date=data.get('issue_date', ''),
        credential_url=data.get('credential_url', '')
    )
    db.session.add(cert)
    db.session.commit()
    return jsonify({'message': 'Certification added!', 'certification': cert.to_dict()}), 201

@profile_bp.route('/certification/<int:cert_id>', methods=['DELETE'])
@jwt_required()
def delete_certification(cert_id):
    cert = Certification.query.get(cert_id)
    if cert:
        db.session.delete(cert)
        db.session.commit()
    return jsonify({'message': 'Certification removed!'}), 200
