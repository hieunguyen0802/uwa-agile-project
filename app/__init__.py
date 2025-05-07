from flask import Flask
from app.extensions import db, login_manager
from app.views.auth import auth_bp
from app.views.pages import pages_bp
from app.views.api import api_bp

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///instance/tourda.db"
    app.config["SECRET_KEY"] = "dev"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    login_manager.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(pages_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    return app
