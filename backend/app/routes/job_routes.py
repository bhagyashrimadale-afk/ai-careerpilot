import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import db, User, JobPosting, JobApplication, StudentProfile
from app.services.ai_service import AIService

job_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

@job_bp.route('/', methods=['GET'])
def get_jobs():
    jobs = JobPosting.query.order_by(JobPosting.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]}), 200

@job_bp.route('/<int:job_id>', methods=['GET'])
def get_job_detail(job_id):
    job = JobPosting.query.get_or_404(job_id)
    return jsonify({'job': job.to_dict()}), 200

@job_bp.route('/', methods=['POST'])
@jwt_required()
def create_job():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if user.role not in ['recruiter', 'admin']:
        return jsonify({'error': 'Unauthorized. Only recruiters or admins can post jobs.'}), 403

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    description = data.get('description', '').strip()

    if not title or not company or not description:
        return jsonify({'error': 'Title, company, and description are required.'}), 400

    requirements = data.get('requirements', [])
    if isinstance(requirements, list):
        requirements = json.dumps(requirements)

    job = JobPosting(
        recruiter_id=user_id,
        title=title,
        company=company,
        location=data.get('location', 'Remote'),
        type=data.get('type', 'Full-time'),
        salary_range=data.get('salary_range', '$80,000 - $110,000 / year'),
        description=description,
        requirements=requirements
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({'message': 'Job posted successfully!', 'job': job.to_dict()}), 201

@job_bp.route('/match/<int:job_id>', methods=['POST'])
@jwt_required()
def match_job_ai(job_id):
    user_id = int(get_jwt_identity())
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    job = JobPosting.query.get_or_404(job_id)

    student_skills = [s.name for s in profile.skills] if profile else []
    resume_text = profile.resume_text if profile else ""

    try:
        job_reqs = json.loads(job.requirements)
        if isinstance(job_reqs, list):
            job_req_str = ", ".join(job_reqs)
        else:
            job_req_str = str(job_reqs)
    except:
        job_req_str = job.requirements or ""

    match_result = AIService.match_job_skills(
        student_skills=student_skills,
        resume_text=resume_text,
        job_requirements=job_req_str,
        job_description=job.description
    )

    return jsonify({'match': match_result}), 200

@job_bp.route('/apply/<int:job_id>', methods=['POST'])
@jwt_required()
def apply_or_save_job(job_id):
    user_id = int(get_jwt_identity())
    job = JobPosting.query.get_or_404(job_id)
    data = request.get_json() or {}
    status = data.get('status', 'Applied') # Saved, Applied

    app = JobApplication.query.filter_by(job_id=job_id, student_id=user_id).first()
    
    # Run AI match calculation
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    student_skills = [s.name for s in profile.skills] if profile else []
    resume_text = profile.resume_text if profile else ""
    try:
        job_reqs = json.loads(job.requirements)
        job_req_str = ", ".join(job_reqs) if isinstance(job_reqs, list) else str(job_reqs)
    except:
        job_req_str = job.requirements or ""

    match_res = AIService.match_job_skills(student_skills, resume_text, job_req_str, job.description)
    match_pct = match_res.get('match_percentage', 70)
    match_reasons = json.dumps(match_res.get('matching_skills', []))

    if not app:
        app = JobApplication(
            job_id=job_id,
            student_id=user_id,
            status=status,
            notes=data.get('notes', ''),
            ai_match_percentage=match_pct,
            match_reasons=match_reasons
        )
        db.session.add(app)
    else:
        app.status = status
        app.ai_match_percentage = match_pct
        if data.get('notes'):
            app.notes = data.get('notes')

    db.session.commit()
    return jsonify({'message': f'Job status updated to {status}!', 'application': app.to_dict()}), 200

@job_bp.route('/applications', methods=['GET'])
@jwt_required()
def get_user_applications():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if user.role == 'student':
        apps = JobApplication.query.filter_by(student_id=user_id).all()
        return jsonify({'applications': [a.to_dict() for a in apps]}), 200
    elif user.role in ['recruiter', 'admin']:
        # Recruiter gets applications for their jobs
        recruiter_jobs = JobPosting.query.filter_by(recruiter_id=user_id).all()
        job_ids = [j.id for j in recruiter_jobs]
        apps = JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).all() if job_ids else []
        return jsonify({'applications': [a.to_dict() for a in apps]}), 200
    return jsonify({'applications': []}), 200

@job_bp.route('/application/<int:app_id>/status', methods=['PUT'])
@jwt_required()
def update_application_status(app_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    app = JobApplication.query.get_or_404(app_id)

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['Saved', 'Applied', 'Interview', 'Selected', 'Rejected']:
        return jsonify({'error': 'Invalid status'}), 400

    app.status = new_status
    if data.get('notes'):
        app.notes = data.get('notes')
        
    db.session.commit()
    return jsonify({'message': 'Application status updated!', 'application': app.to_dict()}), 200
