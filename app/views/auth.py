from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_user, logout_user, login_required
from werkzeug.security import check_password_hash

from app.models import db, User

auth_bp = Blueprint("auth", __name__, template_folder="../templates")


# SIGN UP 
@auth_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        email    = request.form["email"].strip().lower()
        username = request.form["username"].strip()
        password = request.form["password"]

        # simple uniqueness checks
        if User.query.filter((User.email == email) | (User.username == username)).first():
            flash("Email or username already taken", "error")
            return redirect(url_for("auth.signup"))

        user = User(email=email, username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect(url_for("pages.home"))

    return render_template("auth/signup.html")


# LOGIN 
@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email_or_username = request.form["email"].strip().lower()
        password          = request.form["password"]

        user = (User.query.filter_by(email=email_or_username).first() or
                User.query.filter_by(username=email_or_username).first())
        if not user or not check_password_hash(user.pw_hash, password):
            flash("Incorrect credentials", "error")
            return redirect(url_for("auth.login"))

        login_user(user)
        return redirect(url_for("pages.home"))

    return render_template("auth/login.html")


# LOG OUT 
@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("auth.login"))
