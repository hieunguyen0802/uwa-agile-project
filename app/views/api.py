from datetime import date
from flask import Blueprint, jsonify, request, abort
from sqlalchemy import desc
from app.models import db, Tournament, Team, Match

api_bp = Blueprint("api", __name__)

# according to front ends expectation
def match_to_dict(m: Match):
    return {
        "id":           m.id,
        "matchDate":    m.played_on.isoformat(),
        "tournament":   m.tournament.name,
        "homeTeam":     m.team1.name,
        "awayTeam":     m.team2.name,
        "homeScore":    m.team1_score,
        "awayScore":    m.team2_score,
        "scorers":      m.scorers or []
    }

# GET /api/matches 
@api_bp.get("/matches")
def all_matches():
    return jsonify([match_to_dict(m) for m in Match.query.order_by(desc(Match.played_on)).all()])

# POST /api/matches
@api_bp.post("/matches")
def create_match():
    d = request.get_json(force=True)

    # validate payload
    required = {"matchDate", "tournament", "homeTeam", "awayTeam", "homeScore", "awayScore"}
    if not required.issubset(d):
        abort(400, "Missing required fields")

    tour = Tournament.query.filter_by(name=d["tournament"]).first()
    if not tour:
        tour = Tournament(name=d["tournament"])
        db.session.add(tour); db.session.flush()

    def get_or_make_team(name):
        team = Team.query.filter_by(name=name).first()
        if not team:
            team = Team(name=name, tournament=tour)
            db.session.add(team); db.session.flush()
        return team

    t1 = get_or_make_team(d["homeTeam"])
    t2 = get_or_make_team(d["awayTeam"])

    m = Match(
        tournament=tour,
        team1=t1, team2=t2,
        team1_score=int(d["homeScore"]),
        team2_score=int(d["awayScore"]),
        played_on = date.fromisoformat(d["matchDate"]),
        scorers   = d.get("scorers", [])
    )
    db.session.add(m)

    # points update
    if m.team1_score > m.team2_score:
        t1.points += 2
    elif m.team1_score < m.team2_score:
        t2.points += 2
    else:
        t1.points += 1; t2.points += 1

    db.session.commit()
    return jsonify(match_to_dict(m)), 201
