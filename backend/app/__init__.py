from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models.schema import db
from config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    jwt = JWTManager(app)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.profile_routes import profile_bp
    from app.routes.resume_routes import resume_bp
    from app.routes.job_routes import job_bp
    from app.routes.dsa_routes import dsa_bp
    from app.routes.aptitude_routes import aptitude_bp
    from app.routes.interview_routes import interview_bp
    from app.routes.roadmap_routes import roadmap_bp
    from app.routes.dashboard_routes import dashboard_bp
    from app.routes.notification_routes import notification_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(resume_bp)
    app.register_blueprint(job_bp)
    app.register_blueprint(dsa_bp)
    app.register_blueprint(aptitude_bp)
    app.register_blueprint(interview_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(notification_bp)

    @app.route('/', methods=['GET'])
    def root_info():
        return jsonify({
            'message': 'AI CareerPilot Backend REST API is active and running!',
            'status': 'healthy',
            'health_check': '/api/health',
            'frontend_url': 'http://localhost:3000'
        }), 200

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'app': 'AI CareerPilot API',
            'version': '1.0.0'
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    with app.app_context():
        db.create_all()

    return app
