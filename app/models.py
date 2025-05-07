from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

class Tournament(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    teams = db.relationship("Team", backref="tournament", lazy=True)
    matches = db.relationship("Match", backref="tournament", lazy=True)

class Team(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournament.id"), nullable=False)
    points = db.Column(db.Integer, default=0)

class Match(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournament.id"), nullable=False)
    team1_id = db.Column(db.Integer, db.ForeignKey("team.id"), nullable=False)
    team2_id = db.Column(db.Integer, db.ForeignKey("team.id"), nullable=False)
    team1_score = db.Column(db.Integer, nullable=False)
    team2_score = db.Column(db.Integer, nullable=False)
    played_on = db.Column(db.Date, nullable=False)
