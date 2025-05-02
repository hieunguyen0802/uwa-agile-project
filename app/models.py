from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()            # will be initialised in __init__.py


class User(UserMixin, db.Model):
    __tablename__ = "users"
    id         = db.Column(db.Integer, primary_key=True)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    username   = db.Column(db.String(30),  unique=True, nullable=False)
    pw_hash    = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime,    default=datetime.utcnow)
    sent      = db.relationship("Share", foreign_keys="Share.sender_id",
                                back_populates="sender")
    received  = db.relationship("Share", foreign_keys="Share.receiver_id",
                                back_populates="receiver")

    # helpers
    def set_password(self, raw):  self.pw_hash = generate_password_hash(raw)
    def check_password(self, raw): return check_password_hash(self.pw_hash, raw)

    def __repr__(self): return f"<User {self.username}>"


class Team(db.Model):
    __tablename__ = "teams"
    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    matches_as_team1 = db.relationship("Match", foreign_keys="Match.team1_id",
                                       back_populates="team1")
    matches_as_team2 = db.relationship("Match", foreign_keys="Match.team2_id",
                                       back_populates="team2")

    def __repr__(self): return f"<Team {self.name}>"


class Match(db.Model):
    __tablename__ = "matches"
    id          = db.Column(db.Integer, primary_key=True)
    team1_id    = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    team2_id    = db.Column(db.Integer, db.ForeignKey("teams.id"), nullable=False)
    team1_score = db.Column(db.Integer, nullable=False)
    team2_score = db.Column(db.Integer, nullable=False)
    played_on   = db.Column(db.Date,    nullable=False)

    team1  = db.relationship("Team", foreign_keys=[team1_id],
                             back_populates="matches_as_team1")
    team2  = db.relationship("Team", foreign_keys=[team2_id],
                             back_populates="matches_as_team2")
    shares = db.relationship("Share", back_populates="match")

    def __repr__(self):
        return f"<Match {self.team1.name} {self.team1_score}–{self.team2_score} {self.team2.name}>"


class Share(db.Model):
    __tablename__ = "shares"
    id          = db.Column(db.Integer, primary_key=True)
    sender_id   = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey("users.id"),  nullable=False)
    match_id    = db.Column(db.Integer, db.ForeignKey("matches.id"), nullable=False)
    sent_at     = db.Column(db.DateTime, default=datetime.utcnow)

    sender   = db.relationship("User",  foreign_keys=[sender_id],   back_populates="sent")
    receiver = db.relationship("User",  foreign_keys=[receiver_id], back_populates="received")
    match    = db.relationship("Match", back_populates="shares")

    def __repr__(self):
        return f"<Share match={self.match_id} from={self.sender_id} to={self.receiver_id}>"
