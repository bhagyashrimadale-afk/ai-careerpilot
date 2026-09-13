from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'student', 'recruiter', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    job_postings = db.relationship('JobPosting', backref='recruiter', lazy=True)
    job_applications = db.relationship('JobApplication', backref='student', lazy=True)
    dsa_submissions = db.relationship('DsaSubmission', backref='student', lazy=True)
    aptitude_results = db.relationship('AptitudeTestResult', backref='student', lazy=True)
    mock_interviews = db.relationship('MockInterview', backref='student', lazy=True)
    roadmaps = db.relationship('CareerRoadmap', backref='student', lazy=True)
    notifications = db.relationship('Notification', backref='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    headline = db.Column(db.String(200), default='')
    target_role = db.Column(db.String(100), default='Full Stack Developer')
    bio = db.Column(db.Text, default='')
    phone = db.Column(db.String(20), default='')
    github_url = db.Column(db.String(255), default='')
    linkedin_url = db.Column(db.String(255), default='')
    portfolio_url = db.Column(db.String(255), default='')
    resume_text = db.Column(db.Text, default='')
    ats_score = db.Column(db.Integer, default=0)
    missing_skills = db.Column(db.Text, default='[]')  # JSON string
    ats_analysis = db.Column(db.Text, default='{}')   # JSON string
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    education = db.relationship('Education', backref='profile', cascade="all, delete-orphan")
    skills = db.relationship('Skill', backref='profile', cascade="all, delete-orphan")
    projects = db.relationship('Project', backref='profile', cascade="all, delete-orphan")
    certifications = db.relationship('Certification', backref='profile', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'headline': self.headline,
            'target_role': self.target_role,
            'bio': self.bio,
            'phone': self.phone,
            'github_url': self.github_url,
            'linkedin_url': self.linkedin_url,
            'portfolio_url': self.portfolio_url,
            'resume_text': self.resume_text,
            'ats_score': self.ats_score,
            'missing_skills': self.missing_skills,
            'ats_analysis': self.ats_analysis,
            'education': [e.to_dict() for e in self.education],
            'skills': [s.to_dict() for s in self.skills],
            'projects': [p.to_dict() for p in self.projects],
            'certifications': [c.to_dict() for c in self.certifications]
        }

class Education(db.Model):
    __tablename__ = 'education'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    institution = db.Column(db.String(150), nullable=False)
    degree = db.Column(db.String(100), nullable=False)
    field_of_study = db.Column(db.String(100), nullable=False)
    start_year = db.Column(db.String(10))
    end_year = db.Column(db.String(10))
    grade = db.Column(db.String(20))

    def to_dict(self):
        return {
            'id': self.id,
            'institution': self.institution,
            'degree': self.degree,
            'field_of_study': self.field_of_study,
            'start_year': self.start_year,
            'end_year': self.end_year,
            'grade': self.grade
        }

class Skill(db.Model):
    __tablename__ = 'skills'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    level = db.Column(db.String(30), default='Intermediate') # Beginner, Intermediate, Advanced
    category = db.Column(db.String(50), default='Technical')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'level': self.level,
            'category': self.category
        }

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    tech_stack = db.Column(db.String(255))
    repo_url = db.Column(db.String(255))
    live_url = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'tech_stack': self.tech_stack,
            'repo_url': self.repo_url,
            'live_url': self.live_url
        }

class Certification(db.Model):
    __tablename__ = 'certifications'
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey('student_profiles.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    issuer = db.Column(db.String(100), nullable=False)
    issue_date = db.Column(db.String(30))
    credential_url = db.Column(db.String(255))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'issuer': self.issuer,
            'issue_date': self.issue_date,
            'credential_url': self.credential_url
        }

class JobPosting(db.Model):
    __tablename__ = 'job_postings'
    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), default='Full-time')
    salary_range = db.Column(db.String(80))
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, default='[]') # JSON array of skills/requirements
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    applications = db.relationship('JobApplication', backref='job', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'recruiter_id': self.recruiter_id,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'type': self.type,
            'salary_range': self.salary_range,
            'description': self.description,
            'requirements': self.requirements,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class JobApplication(db.Model):
    __tablename__ = 'job_applications'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('job_postings.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(30), default='Saved') # Saved, Applied, Interview, Selected, Rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, default='')
    ai_match_percentage = db.Column(db.Integer, default=0)
    match_reasons = db.Column(db.Text, default='[]') # JSON

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'student_id': self.student_id,
            'job_title': self.job.title if self.job else '',
            'company': self.job.company if self.job else '',
            'status': self.status,
            'applied_at': self.applied_at.isoformat() if self.applied_at else None,
            'notes': self.notes,
            'ai_match_percentage': self.ai_match_percentage,
            'match_reasons': self.match_reasons
        }

class DsaProblem(db.Model):
    __tablename__ = 'dsa_problems'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    topic = db.Column(db.String(80), nullable=False) # Arrays, Strings, Trees, Graphs, DP, Dynamic Programming, etc.
    difficulty = db.Column(db.String(20), nullable=False) # Easy, Medium, Hard
    description = db.Column(db.Text, nullable=False)
    constraints = db.Column(db.Text)
    example_input = db.Column(db.Text)
    example_output = db.Column(db.Text)
    starter_code = db.Column(db.Text)

    submissions = db.relationship('DsaSubmission', backref='problem', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'topic': self.topic,
            'difficulty': self.difficulty,
            'description': self.description,
            'constraints': self.constraints,
            'example_input': self.example_input,
            'example_output': self.example_output,
            'starter_code': self.starter_code
        }

class DsaSubmission(db.Model):
    __tablename__ = 'dsa_submissions'
    id = db.Column(db.Integer, primary_key=True)
    problem_id = db.Column(db.Integer, db.ForeignKey('dsa_problems.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    code = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(30), default='Solved') # Solved, Attempted
    score = db.Column(db.Integer, default=100)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'problem_id': self.problem_id,
            'problem_title': self.problem.title if self.problem else '',
            'difficulty': self.problem.difficulty if self.problem else '',
            'student_id': self.student_id,
            'code': self.code,
            'status': self.status,
            'score': self.score,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }

class AptitudeCategory(db.Model):
    __tablename__ = 'aptitude_categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False) # Quantitative, Logical Reasoning, Verbal Ability
    description = db.Column(db.Text)
    
    questions = db.relationship('AptitudeQuestion', backref='category', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'question_count': len(self.questions)
        }

class AptitudeQuestion(db.Model):
    __tablename__ = 'aptitude_questions'
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey('aptitude_categories.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    option_a = db.Column(db.String(255), nullable=False)
    option_b = db.Column(db.String(255), nullable=False)
    option_c = db.Column(db.String(255), nullable=False)
    option_d = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.String(5), nullable=False) # 'A', 'B', 'C', 'D'
    explanation = db.Column(db.Text)
    topic_tag = db.Column(db.String(80), default='General')

    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'category_id': self.category_id,
            'question_text': self.question_text,
            'options': {
                'A': self.option_a,
                'B': self.option_b,
                'C': self.option_c,
                'D': self.option_d
            },
            'topic_tag': self.topic_tag
        }
        if include_answer:
            data['correct_option'] = self.correct_option
            data['explanation'] = self.explanation
        return data

class AptitudeTestResult(db.Model):
    __tablename__ = 'aptitude_test_results'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('aptitude_categories.id'), nullable=False)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    score_percentage = db.Column(db.Float, nullable=False)
    weak_topics = db.Column(db.Text, default='[]') # JSON list of weak topic strings
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else '',
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'score_percentage': self.score_percentage,
            'weak_topics': self.weak_topics,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

class MockInterview(db.Model):
    __tablename__ = 'mock_interviews'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_role = db.Column(db.String(100), nullable=False)
    experience_level = db.Column(db.String(50), default='Entry Level')
    overall_score = db.Column(db.Integer, default=0)
    feedback_summary = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    responses = db.relationship('InterviewResponse', backref='interview', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'target_role': self.target_role,
            'experience_level': self.experience_level,
            'overall_score': self.overall_score,
            'feedback_summary': self.feedback_summary,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'responses': [r.to_dict() for r in self.responses]
        }

class InterviewResponse(db.Model):
    __tablename__ = 'interview_responses'
    id = db.Column(db.Integer, primary_key=True)
    interview_id = db.Column(db.Integer, db.ForeignKey('mock_interviews.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), default='Technical') # Technical, HR, Behavioral
    user_answer = db.Column(db.Text, nullable=False)
    score = db.Column(db.Integer, default=0)
    feedback = db.Column(db.Text, default='')
    suggested_improvement = db.Column(db.Text, default='')

    def to_dict(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'user_answer': self.user_answer,
            'score': self.score,
            'feedback': self.feedback,
            'suggested_improvement': self.suggested_improvement
        }

class CareerRoadmap(db.Model):
    __tablename__ = 'career_roadmaps'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    target_role = db.Column(db.String(100), nullable=False)
    steps = db.Column(db.Text, default='[]') # JSON string of roadmap milestones
    current_step_index = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'target_role': self.target_role,
            'steps': self.steps,
            'current_step_index': self.current_step_index,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(30), default='system') # drive, interview, system, reminder
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
