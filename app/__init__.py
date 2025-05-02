# filepath: /Users/rachel/Desktop/5505_Group/uwa-agile-project/app/__init__.py
from flask import Flask, render_template, request, redirect, url_for, jsonify, flash
from livereload import Server
import json

app = Flask(__name__)
app.debug = True
app.secret_key = 'your_secret_key'  # For flash messages

# Mock user database
users = {
    'john.doe@example.com': {'name': 'John Doe', 'id': 1},
    'jane.smith@example.com': {'name': 'Jane Smith', 'id': 2},
    'robert.johnson@example.com': {'name': 'Robert Johnson', 'id': 3},
    'emma.williams@example.com': {'name': 'Emma Williams', 'id': 4},
}

# Mock dashboard sharing data
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

@app.route('/SingleTeam')
def single_team():
    # This route supports the query parameter format: /SingleTeam?team=TeamName
    return render_template('SingleTeam.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/data')
def data():
    return render_template('data.html')

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
    """Handle dashboard sharing request"""
    if request.method == 'POST':
        dashboard_name = request.form.get('dashboardName')
        shared_with_json = request.form.get('sharedWith')
        permission_level = request.form.get('permissionLevel')
        note = request.form.get('note')
        
        # Parse the shared users list
        try:
            shared_with = json.loads(shared_with_json)
        except:
            shared_with = []
            
        # Validate recipient emails exist
        invalid_emails = [email for email in shared_with if email not in users]
        
        if invalid_emails:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False, 
                    'message': f"The following emails are not registered users: {', '.join(invalid_emails)}"
                })
            else:
                flash(f"The following emails are not registered users: {', '.join(invalid_emails)}")
                return redirect(url_for('dashboard'))
            
        # Create sharing record
        dashboard = {
            'id': len(shared_dashboards) + 1,
            'name': dashboard_name,
            'creator': 'current_user@example.com',  # In a real application, this should be the current logged-in user
            'shared_with': shared_with,
            'permission_level': permission_level,
            'note': note,
            'created_at': '2025-05-01'  # In a real application, this should use datetime.now()
        }
        
        shared_dashboards.append(dashboard)
        
        # Return response as JSON for AJAX requests
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': True, 'message': 'Dashboard shared successfully'})
        
        # Non-AJAX request returns redirect
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
