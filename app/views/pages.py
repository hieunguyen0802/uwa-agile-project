from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import login_required
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

@pages_bp.route("/upload")
@login_required
def upload():            return render_template("upload.html")

@pages_bp.route("/dashboard")
@login_required
def dashboard():         return render_template("dashboard.html")

@pages_bp.route("/shared-dashboards")
@login_required
def shared_dashboards(): return render_template("shared-dashboards.html")

@pages_bp.route("/data")
@login_required
def data():              return render_template("data.html")

@pages_bp.route("/test")
@login_required
def test():              return render_template("test.html")

@pages_bp.route("/profile")
@login_required
def profile():           return render_template("profile.html")

# @pages_bp.route("/login", methods=["GET", "POST"])
# def login():
#     if request.method == "POST":
#         # TODO: real auth
#         return redirect(url_for("pages.home"))
#     return render_template("auth/login.html")

@pages_bp.route("/signup")
def signup():           return render_template("auth/signup.html")
