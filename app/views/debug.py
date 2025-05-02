from flask import Blueprint, jsonify
from app.models import User, Team, Match, db

debug_bp = Blueprint("debug", __name__)

@debug_bp.get("/debug/users")
def dbg_users():
    return jsonify([{"id":u.id, "username":u.username, "email":u.email} for u in User.query.all()])

@debug_bp.get("/debug/teams")
def dbg_teams():
    return jsonify([{"id":t.id, "name":t.name, "desc":t.description, "points":t.points } for t in Team.query.all()])

@debug_bp.get("/debug/matches")
def dbg_matches():
    return jsonify([
        {"id":m.id, "team1":m.team1.name, "team2":m.team2.name,
         "score":f"{m.team1_score}-{m.team2_score}"} for m in Match.query.all()
    ])
