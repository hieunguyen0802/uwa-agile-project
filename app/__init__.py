# filepath: /Users/rachel/Desktop/5505_Group/uwa-agile-project/app/__init__.py
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from livereload import Server
from flask_sqlalchemy import SQLAlchemy
from datetime import date
from flask_login import LoginManager
from .models import db, Match, Team,Tournament,Share,User  # import after db instance is created
from .views.pages import pages_bp
#from .views.debug import debug_bp
from .views.api import api_bp   
#from .views.auth import auth_bp
import json



app = Flask(__name__)
app.config.update(
    SQLALCHEMY_DATABASE_URI="sqlite:///tourda.db",
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY="change-me-in-prod",
    
)
app.debug = True
app.secret_key = 'your_secret_key'  # 用于flash消息
db.init_app(app)
@app.before_first_request
def _ensure_schema():
    db.create_all() 
app.register_blueprint(pages_bp)
#app.register_blueprint(debug_bp) 
app.register_blueprint(api_bp, url_prefix="/api") 
@app.cli.command("seed")
def seed():
    print("Recreating database …")
    db.drop_all()
    db.create_all()

    # users 
    alice = User(email="alice@example.com", username="alice")
    bob   = User(email="bob@example.com",   username="bob")
    for u in (alice, bob):
        u.set_password("password")

    # tournaments 
    cup   = Tournament(name="Summer Cup")
    league= Tournament(name="Winter League")

    # teams 
    lions   = Team(name="Lions",   tournament=cup,    points=0)
    tigers  = Team(name="Tigers",  tournament=cup,    points=0)
    dragons = Team(name="Dragons", tournament=league, points=0)
    sharks  = Team(name="Sharks",  tournament=league, points=0)

    # matches  
    m1 = Match(
        tournament=cup,
        team1=lions, team2=tigers,
        team1_score=3, team2_score=1,
        played_on=date(2025, 5, 5),
        scorers=[
            {"player_id": 1, "playerName": "Leo", "goals": 2, "team":"home"},
            {"player_id": 2, "playerName": "Max", "goals": 1, "team":"home"},
            {"player_id": 3, "playerName": "Raj", "goals": 1, "team":"away"}
        ]
    )
    lions.points  += 2   # winner
    tigers.points += 0

    m2 = Match(
        tournament=league,
        team1=dragons, team2=sharks,
        team1_score=2, team2_score=2,
        played_on=date(2025, 5, 6),
        scorers=[
            {"player_id": 4, "playerName": "Kai",  "goals": 1, "team":"home"},
            {"player_id": 5, "playerName": "Zane", "goals": 1, "team":"home"},
            {"player_id": 6, "playerName": "Finn", "goals": 2, "team":"away"}
        ]
    )
    dragons.points += 1   # draw
    sharks.points  += 1

    # share example 
    # share = Share(sender_id=alice.id, receiver_id=bob.id, match=m1)

    # commit 
    db.session.add_all([
        alice, bob,
        cup, league,
        lions, tigers, dragons, sharks,
        m1, m2
    ])
    db.session.commit()
    print("✅  Seed complete:")
    print(f"    ➜ Users       : {User.query.count()}")
    print(f"    ➜ Tournaments : {Tournament.query.count()}")
    print(f"    ➜ Teams       : {Team.query.count()} (Lions pts {lions.points})")
    print(f"    ➜ Matches     : {Match.query.count()}")
# 
# Run the app
if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve(debug=True, port=5002)

