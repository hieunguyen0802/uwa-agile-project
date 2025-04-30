# filepath: /Users/rachel/Desktop/5505_Group/uwa-agile-project/app/__init__.py
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from livereload import Server
import json

app = Flask(__name__)
app.debug = True
app.secret_key = 'your_secret_key'  # 用于flash消息

# 模拟用户数据库
users = {
    'john.doe@example.com': {'name': 'John Doe', 'id': 1},
    'jane.smith@example.com': {'name': 'Jane Smith', 'id': 2},
    'robert.johnson@example.com': {'name': 'Robert Johnson', 'id': 3},
    'emma.williams@example.com': {'name': 'Emma Williams', 'id': 4},
}

# 模拟仪表板共享数据
shared_dashboards = []

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/simple')
def simple():
    return render_template('simple.html')

@app.route('/squad')
def squad():
    return render_template('squad.html')

@app.route('/teams')
def teams():
    return render_template('squad.html')

@app.route('/team/<team_id>')
def team_detail(team_id):
    # In a real app, you would retrieve team data based on team_id
    return render_template('SingleTeam.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/shared-dashboards')
def shared_dashboards_page():
    # 在实际应用中，这里应该获取当前用户共享的和被共享的仪表板
    return render_template('shared-dashboards.html')

@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/login',  methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        return redirect(url_for('home'))
    return render_template('auth/login.html')


@app.route('/signup')
def signup():
    return render_template('auth/signup.html')

@app.route('/share-dashboard', methods=['POST'])
def share_dashboard():
    """处理仪表板共享请求"""
    if request.method == 'POST':
        dashboard_name = request.form.get('dashboardName')
        shared_with_json = request.form.get('sharedWith')
        permission_level = request.form.get('permissionLevel')
        note = request.form.get('note')
        
        # 解析共享用户列表
        try:
            shared_with = json.loads(shared_with_json)
        except:
            shared_with = []
            
        # 验证接收者邮箱是否存在
        invalid_emails = [email for email in shared_with if email not in users]
        
        if invalid_emails:
            flash(f"The following emails are not registered users: {', '.join(invalid_emails)}")
            return redirect(url_for('dashboard'))
            
        # 创建共享记录
        dashboard = {
            'id': len(shared_dashboards) + 1,
            'name': dashboard_name,
            'creator': 'current_user@example.com',  # 在实际应用中，这应该是当前登录用户
            'shared_with': shared_with,
            'permission_level': permission_level,
            'note': note,
            'created_at': '2025-05-01'  # 在实际应用中，这应该使用 datetime.now()
        }
        
        shared_dashboards.append(dashboard)
        
        # 将响应返回为JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': True, 'message': 'Dashboard shared successfully'})
        
        # 非AJAX请求返回重定向
        flash('Dashboard shared successfully!')
        return redirect(url_for('dashboard'))

@app.route('/api/users', methods=['GET'])
def get_users():
    """API endpoint to get a list of users"""
    query = request.args.get('q', '').lower()
    
    filtered_users = []
    for email, user_data in users.items():
        if query in email.lower() or query in user_data['name'].lower():
            filtered_users.append({
                'id': user_data['id'],
                'name': user_data['name'],
                'email': email
            })
    
    return jsonify(filtered_users)

# Run the app
if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve(debug=True, port=5002)
