from flask import Blueprint, flash, render_template, redirect, url_for, request
from flask_login import (
    current_user, login_user, logout_user, login_required
)
from app.models import db, User


pages_bp = Blueprint("pages", __name__)

@pages_bp.route("/")
@login_required
def home():              return render_template("index.html")

@pages_bp.route("/simple")
@login_required
def simple():            return render_template("simple.html")

@pages_bp.route("/squad")
@pages_bp.route("/teams")
@login_required
def squad():             return render_template("squad.html")

@pages_bp.route("/team/<team_id>")
@login_required
def team_detail(team_id): return render_template("SingleTeam.html")

@pages_bp.route("/SingleTeam")
@login_required
def single_team():        return render_template("SingleTeam.html")

# @pages_bp.route("/upload")
# def upload():            return render_template("upload.html")

@pages_bp.route("/dashboard")
@login_required
def dashboard():         return render_template("dashboard.html")


@pages_bp.route("/data")
@login_required
def data():              return render_template("data.html")


@pages_bp.route("/profile")
@login_required
def profile():           return render_template("profile.html")

@pages_bp.route("/signup", methods=["GET", "POST"])
def signup():
    if current_user.is_authenticated:
        return redirect(url_for("pages.home"))

    if request.method == "POST":
        email    = request.form["email"].lower().strip()
        username = request.form["username"].strip()
        password = request.form["password"]

        # simple uniqueness check
        if User.query.filter(
            (User.email == email) | (User.username == username)
        ).first():
            flash("User with that email or username already exists", "danger")
            return redirect(url_for("pages.signup"))

        u = User(email=email, username=username)
        u.set_password(password)
        db.session.add(u); db.session.commit()
        login_user(u)
        return redirect(url_for("pages.home"))

    return render_template("auth/signup.html")

@pages_bp.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("pages.home"))

    if request.method == "POST":
        ident    = request.form["identifier"].strip()
        password = request.form["password"]

        user = User.query.filter(
            (User.email == ident) | (User.username == ident)
        ).first()

        if user and user.check_password(password):
            login_user(user)
            request.session.pop("_flashes", None) if hasattr(request, "session") else None
            return redirect(request.args.get("next") or url_for("pages.home"))

        flash("Invalid credentials", "danger")
        return render_template("auth/login.html")   #

    return render_template("auth/login.html")


@pages_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("pages.login"))