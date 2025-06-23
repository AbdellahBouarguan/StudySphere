from flask import Flask
from backend.extensions import db, login_manager
from backend.models import User

def create_app():
    app = Flask(__name__, static_folder='../frontend', static_url_path='/')
    app.config['SECRET_KEY'] = 'your_secret_key_here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/study-sphere.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    with app.app_context():
        from backend import models  # Import models here to register them with SQLAlchemy
        db.create_all()

    # Import and register blueprints here
    from backend.routes.auth import bp as auth_bp
    from backend.routes.study import bp as study_bp
    from backend.routes.groups import bp as groups_bp
    from backend.routes.tasks import bp as tasks_bp
    from backend.routes.subjects import bp as subjects_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(study_bp)
    app.register_blueprint(groups_bp)
    app.register_blueprint(tasks_bp)
    app.register_blueprint(subjects_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app
