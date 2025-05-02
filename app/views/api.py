from datetime import date
from flask import Blueprint, jsonify, request, abort
from app.models import db, Team, Match, Tournament

api_bp = Blueprint("api", __name__)

@api_bp.get("/teams")
def list_teams():
    q = Team.query
    tid = request.args.get("tournament_id", type=int)
    if tid:
        q = q.filter_by(tournament_id=tid)
    teams = q.order_by(Team.name).all()
    return jsonify([{"id": t.id, "name": t.name, "points": t.points} for t in teams])

# GET /api/tournaments 
@api_bp.get("/tournaments")
def list_tournaments():
    return jsonify([{"id": t.id, "name": t.name} for t in Tournament.query.all()])

# Post Matches
@api_bp.post("/matches")
def create_match():
    """Body: {tournament_id, team1_id, team2_id, team1_score, team2_score, played_on}"""
    d = request.get_json(force=True)

    required = {"tournament_id", "team1_id", "team2_id",
                "team1_score", "team2_score", "played_on"}
    if not required.issubset(d):
        abort(400, "Missing fields")

    if d["team1_id"] == d["team2_id"]:
        abort(400, "Teams must differ")

    # FK look‑ups + same‑tournament check
    tour = Tournament.query.get_or_404(d["tournament_id"])
    t1   = Team.query.get_or_404(d["team1_id"])
    t2   = Team.query.get_or_404(d["team2_id"])
    if t1.tournament_id != tour.id or t2.tournament_id != tour.id:
        abort(400, "Teams do not belong to that tournament")

    # parse date
    try:
        played_on = date.fromisoformat(d["played_on"])
    except ValueError:
        abort(400, "Invalid date format (YYYY‑MM‑DD)")

    # create match
    m = Match(
        tournament=tour,
        team1=t1, team2=t2,
        team1_score=int(d["team1_score"]),
        team2_score=int(d["team2_score"]),
        played_on=played_on
    )
    db.session.add(m)

    # update points
    if m.team1_score > m.team2_score:
        t1.points += 2
    elif m.team1_score < m.team2_score:
        t2.points += 2
    else:  # draw
        t1.points += 1
        t2.points += 1

    db.session.commit()
    return jsonify({"id": m.id, "team1_points": t1.points, "team2_points": t2.points}), 201