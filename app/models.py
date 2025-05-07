from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()   



#  Authentication table (these fields should be enough, but will need to add mobile etc later)
class User(UserMixin, db.Model):
    __tablename__ = "users"
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    username   = db.Column(db.String(30),  unique=True, nullable=False)
    pw_hash    = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime,    default=datetime.utcnow)

    def set_password(self, raw):   self.pw_hash = generate_password_hash(raw)
    def check_password(self, raw): return check_password_hash(self.pw_hash, raw)

# Tournaments  
class Tournament(db.Model):
    __tablename__ = "tournaments"
    id        = db.Column(db.Integer, primary_key=True)
    name      = db.Column(db.String(80), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teams   = db.relationship("Team",  back_populates="tournament")
    matches = db.relationship("Match", back_populates="tournament")

#  Teams (with points) 
class Team(db.Model):
    __tablename__ = "teams"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(50), unique=True, nullable=False)
    description   = db.Column(db.Text)
    points        = db.Column(db.Integer, default=0, nullable=False)

    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=False)
    tournament    = db.relationship("Tournament", back_populates="teams")

    matches_as_team1 = db.relationship("Match", foreign_keys="Match.team1_id",
                                       back_populates="team1")
    matches_as_team2 = db.relationship("Match", foreign_keys="Match.team2_id",
                                       back_populates="team2")

#  Matches 
class Match(db.Model):
    __tablename__ = "matches"
    id            = db.Column(db.Integer, primary_key=True)
    tournament_id = db.Column(db.Integer, db.ForeignKey("tournaments.id"), nullable=False)

    team1_id    = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    team2_id    = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    team1_score = db.Column(db.Integer, nullable=False)
    team2_score = db.Column(db.Integer, nullable=False)
    played_on   = db.Column(db.Date,    nullable=False)

    # per‑match scorer list
    scorers     = db.Column(db.JSON, default=list)   # [{player_id, player_name, goals}, …]

    tournament = db.relationship("Tournament", back_populates="matches")
    team1      = db.relationship("Team", foreign_keys=[team1_id], back_populates="matches_as_team1")
    team2      = db.relationship("Team", foreign_keys=[team2_id], back_populates="matches_as_team2")

    shares     = db.relationship("Share", back_populates="match") # sharing 

# Share  ( need to update this)   
class Share(db.Model):
    __tablename__ = "shares"
    id          = db.Column(db.Integer, primary_key=True)
    sender_id   = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    match_id    = db.Column(db.Integer, db.ForeignKey("matches.id"), nullable=False)
    sent_at     = db.Column(db.DateTime, default=datetime.utcnow)

    match = db.relationship("Match", back_populates="shares")
    sender   = db.relationship("User", foreign_keys=[sender_id])
    receiver = db.relationship("User", foreign_keys=[receiver_id])
