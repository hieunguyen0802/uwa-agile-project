# filepath: /Users/rachel/Desktop/5505_Group/uwa-agile-project/app/__init__.py
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from livereload import Server
from flask_sqlalchemy import SQLAlchemy
from datetime import date
from flask_login import LoginManager
from .models import db, User, Team, Match, Tournament   # import after db instance is created
from .views.pages import pages_bp
from .views.debug import debug_bp
from .views.api import api_bp   
import json

login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.config.update(
        SQLALCHEMY_DATABASE_URI="sqlite:///tourda.db",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SECRET_KEY="change-me-in-prod",
        
    )
    app.debug = True
    app.secret_key = 'your_secret_key'  # 用于flash消息
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "pages.login" # change this
    
    @login_manager.user_loader
    def load_user(uid):
        return db.session.get(User, int(uid))
    
    app.register_blueprint(pages_bp)
    app.register_blueprint(debug_bp) 
    app.register_blueprint(api_bp, url_prefix="/api") 
    @app.cli.command("seed")
    def seed():
        db.drop_all()
        db.create_all()

        # 2 tournaments
        cup      = Tournament(name="Summer Cup")
        league   = Tournament(name="Winter League")

        # teams belong to tournaments
        lions    = Team(name="Lions",  tournament=cup)
        tigers   = Team(name="Tigers", tournament=cup)
        dragons  = Team(name="Dragons", tournament=league)
        sharks   = Team(name="Sharks",  tournament=league)

        demo_user = User(email="demo@example.com", username="demo")
        demo_user.set_password("password")

        # one demo match
        m = Match(tournament=cup, team1=lions, team2=tigers,
                  team1_score=2, team2_score=1, played_on=date(2025, 5, 2))
        db.session.add_all([cup, league, lions, tigers, dragons, sharks, demo_user])
        db.session.flush()  
        
        lions.points += 2            # winner gets 2 points
        db.session.add(m)
        db.session.commit()
        print("✅  Seed complete (2 tournaments, 4 teams, 1 match).")
    
    @app.shell_context_processor
    def _shell_ctx():
        return dict(db=db, User=User, Team=Team, Match=Match, Share=Match) 
    
    return app
            
    

# # 模拟用户数据库
# users = {
#     'john.doe@example.com': {'name': 'John Doe', 'id': 1},
#     'jane.smith@example.com': {'name': 'Jane Smith', 'id': 2},
#     'robert.johnson@example.com': {'name': 'Robert Johnson', 'id': 3},
#     'emma.williams@example.com': {'name': 'Emma Williams', 'id': 4},
# }

# # 模拟仪表板共享数据
# shared_dashboards = []

# @app.route('/')
# def home():
#     return render_template('index.html')

# @app.route('/simple')
# def simple():
#     return render_template('simple.html')

# @app.route('/squad')
# def squad():
#     return render_template('squad.html')

# @app.route('/teams')
# def teams():
#     return render_template('squad.html')

# @app.route('/team/<team_id>')
# def team_detail(team_id):
#     # In a real app, you would retrieve team data based on team_id
#     return render_template('SingleTeam.html')

# @app.route('/upload')
# def upload():
#     return render_template('upload.html')

# @app.route('/dashboard')
# def dashboard():
#     return render_template('dashboard.html')

# @app.route('/shared-dashboards')
# def shared_dashboards_page():
#     # 在实际应用中，这里应该获取当前用户共享的和被共享的仪表板
#     return render_template('shared-dashboards.html')

# @app.route('/data')
# def data():
#     return render_template('data.html')

# @app.route('/test')
# def test():
#     return render_template('test.html')

# @app.route('/profile')
# def profile():
#     return render_template('profile.html')

# @app.route('/login',  methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         email = request.form.get('email')
#         password = request.form.get('password')
#         return redirect(url_for('home'))
#     return render_template('auth/login.html')


# @app.route('/signup')
# def signup():
#     return render_template('auth/signup.html')

# @app.route('/share-dashboard', methods=['POST'])
# def share_dashboard():
#     """处理仪表板共享请求"""
#     if request.method == 'POST':
#         dashboard_name = request.form.get('dashboardName')
#         shared_with_json = request.form.get('sharedWith')
#         permission_level = request.form.get('permissionLevel')
#         note = request.form.get('note')
        
#         # 解析共享用户列表
#         try:
#             shared_with = json.loads(shared_with_json)
#         except:
#             shared_with = []
            
#         # 验证接收者邮箱是否存在
#         invalid_emails = [email for email in shared_with if email not in users]
        
#         if invalid_emails:
#             flash(f"The following emails are not registered users: {', '.join(invalid_emails)}")
#             return redirect(url_for('dashboard'))
            
#         # 创建共享记录
#         dashboard = {
#             'id': len(shared_dashboards) + 1,
#             'name': dashboard_name,
#             'creator': 'current_user@example.com',  # 在实际应用中，这应该是当前登录用户
#             'shared_with': shared_with,
#             'permission_level': permission_level,
#             'note': note,
#             'created_at': '2025-05-01'  # 在实际应用中，这应该使用 datetime.now()
#         }
        
#         shared_dashboards.append(dashboard)
        
#         # 将响应返回为JSON
#         if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
#             return jsonify({'success': True, 'message': 'Dashboard shared successfully'})
        
#         # 非AJAX请求返回重定向
#         flash('Dashboard shared successfully!')
#         return redirect(url_for('dashboard'))

# @app.route('/api/users', methods=['GET'])
# def get_users():
#     """API endpoint to get a list of users"""
#     query = request.args.get('q', '').lower()
    
#     filtered_users = []
#     for email, user_data in users.items():
#         if query in email.lower() or query in user_data['name'].lower():
#             filtered_users.append({
#                 'id': user_data['id'],
#                 'name': user_data['name'],
#                 'email': email
#             })
    
#     return jsonify(filtered_users)


# Run the app
if __name__ == '__main__':
    flask_app = create_app()
    server = Server(flask_app.wsgi_app)
    server.serve(debug=True, port=5002)
