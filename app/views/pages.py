from flask import Blueprint, render_template, redirect, url_for, request

pages_bp = Blueprint("pages", __name__)

@pages_bp.route("/")
def home():              return render_template("index.html")

@pages_bp.route("/simple")
def simple():            return render_template("simple.html")

@pages_bp.route("/squad")
@pages_bp.route("/teams")
def squad():             return render_template("squad.html")

@pages_bp.route("/team/<team_id>")
def team_detail(team_id): return render_template("SingleTeam.html")

@pages_bp.route("/SingleTeam")
def single_team():        return render_template("SingleTeam.html")

# @pages_bp.route("/upload")
# def upload():            return render_template("upload.html")

@pages_bp.route("/dashboard")
def dashboard():         return render_template("dashboard.html")


@pages_bp.route("/data")
def data():              return render_template("data.html")


@pages_bp.route("/profile")
def profile():           return render_template("profile.html")

@pages_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        return redirect(url_for('home'))
    return render_template('auth/login.html')

@pages_bp.route("/signup")
def signup():           return render_template("auth/signup.html")