from datetime import date
from flask import Blueprint, jsonify, request, abort
from app.models import db, Team, Match, Tournament, User
from werkzeug.security import generate_password_hash, check_password_hash

api_bp = Blueprint("api", __name__)

@api_bp.route("/signup", methods=["POST"])
def api_signup():
    data = request.get_json()
    if not all(k in data for k in ("username", "email", "password")):
        return jsonify({"error": "Missing fields"}), 400
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = generate_password_hash(data["password"])
    new_user = User(username=data["username"], email=data["email"], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@api_bp.route("/login", methods=["POST"])
def api_login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if user and check_password_hash(user.password, data["password"]):
        return jsonify({"message": "Login successful", "user": {"username": user.username}})
    return jsonify({"error": "Invalid credentials"}), 401
