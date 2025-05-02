from datetime import date
from flask import Blueprint, jsonify, request, abort
from app.models import db, Team, Match

api_bp = Blueprint("api", __name__)

@api_bp.get("/teams")
def list_teams():
    """Return [{id, name}] for dropdowns."""
    teams = Team.query.all()
    return jsonify([{"id": t.id, "name": t.name} for t in teams])

@api_bp.post("/matches")
def create_match():
    """Create a new match; body =
       {team1_id, team2_id, team1_score, team2_score, played_on}"""
    data = request.get_json(force=True)

    # simple validation 
    required = {"team1_id", "team2_id", "team1_score", "team2_score", "played_on"}
    if not required.issubset(data):
        abort(400, "Missing fields")

    if data["team1_id"] == data["team2_id"]:
        abort(400, "Teams must be different")

    # parse date (YYYY‑MM‑DD)
    try:
        played_on = date.fromisoformat(data["played_on"])
    except ValueError:
        abort(400, "Invalid date format (YYYY-MM-DD expected)")

    # foreign‑key check
    team1 = Team.query.get_or_404(data["team1_id"])
    team2 = Team.query.get_or_404(data["team2_id"])

    match = Match(
        team1_id=team1.id,
        team2_id=team2.id,
        team1_score=int(data["team1_score"]),
        team2_score=int(data["team2_score"]),
        played_on=played_on,
    )
    db.session.add(match)
    db.session.commit()
    return jsonify({"id": match.id}), 201