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

@api_bp.get("/leaderboard/grouped")
def leaderboard_grouped():

    out = []

    for tour in Tournament.query.order_by(Tournament.name):

        # top 3 teams 
        teams_q = (Team.query.filter_by(tournament_id=tour.id)
                          .order_by(Team.points.desc(), Team.name)
                          .limit(3))
        top_teams = [{"id": t.id,
                      "name": t.name,
                      "points": t.points,
                      "rank": i + 1}
                     for i, t in enumerate(teams_q)]

        # aggregate player goals across all matches in this tournament 
        player_goals = {}
        matches = Match.query.filter_by(tournament_id=tour.id).all()
        for m in matches:
            for s in (m.scorers or []):
                name  = s.get("player_name") or s.get("playerName")
                goals = int(s.get("goals", 0))
                player_goals[name] = player_goals.get(name, 0) + goals

        # sort & take top‑3
        top_players = [
            {"name": n, "goals": g, "rank": i + 1}
            for i, (n, g) in enumerate(
                sorted(player_goals.items(), key=lambda kv: kv[1], reverse=True)[:3]
            )
        ]

        out.append({
            "tournament": {"id": tour.id, "name": tour.name},
            "topTeams": top_teams,
            "topPlayers": top_players,
        })

    return jsonify(out)
