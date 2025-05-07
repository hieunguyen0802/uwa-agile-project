from flask import Blueprint, render_template

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login")
def login_page():
    return render_template("auth/login.html")

@auth_bp.route("/signup")
def signup_page():
    return render_template("auth/signup.html")
