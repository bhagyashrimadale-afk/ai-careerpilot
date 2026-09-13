from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.schema import User, StudentProfile, JobPosting, JobApplication, DsaProblem, AptitudeTestResult, MockInterview
from app.services.readiness_service import ReadinessService

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/student', methods=['GET'])
@jwt_required()
def get_student_dashboard():
    user_id = int(get_jwt_identity())
    readiness = ReadinessService.calculate_readiness_score(user_id)
    
    profile = StudentProfile.query.filter_by(user_id=user_id).first()
    recent_applications = JobApplication.query.filter_by(student_id=user_id).order_by(JobApplication.applied_at.desc()).limit(5).all()
    
    total_applied = JobApplication.query.filter_by(student_id=user_id, status='Applied').count()
    total_interviews = JobApplication.query.filter_by(student_id=user_id, status='Interview').count()
    total_offers = JobApplication.query.filter_by(student_id=user_id, status='Selected').count()

    return jsonify({
        'readiness': readiness,
        'profile_summary': profile.to_dict() if profile else None,
        'application_counts': {
            'applied': total_applied,
            'interview': total_interviews,
            'selected': total_offers
        },
        'recent_applications': [a.to_dict() for a in recent_applications]
    }), 200

@dashboard_bp.route('/recruiter', methods=['GET'])
@jwt_required()
def get_recruiter_dashboard():
    user_id = int(get_jwt_identity())
    jobs = JobPosting.query.filter_by(recruiter_id=user_id).all()
    job_ids = [j.id for j in jobs]
    
    total_jobs = len(jobs)
    total_applicants = JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).count() if job_ids else 0
    shortlisted = JobApplication.query.filter(JobApplication.job_id.in_(job_ids), JobApplication.status == 'Interview').count() if job_ids else 0

    return jsonify({
        'total_jobs_posted': total_jobs,
        'total_applicants': total_applicants,
        'shortlisted_applicants': shortlisted,
        'posted_jobs': [j.to_dict() for j in jobs]
    }), 200

@dashboard_bp.route('/admin', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    total_users = User.query.count()
    total_students = User.query.filter_by(role='student').count()
    total_recruiters = User.query.filter_by(role='recruiter').count()
    total_jobs = JobPosting.query.count()
    total_dsa_problems = DsaProblem.query.count()
    total_applications = JobApplication.query.count()

    return jsonify({
        'total_users': total_users,
        'total_students': total_students,
        'total_recruiters': total_recruiters,
        'total_jobs': total_jobs,
        'total_dsa_problems': total_dsa_problems,
        'total_applications': total_applications
    }), 200
