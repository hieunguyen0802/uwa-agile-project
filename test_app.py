from flask import Flask, render_template, request
import os

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static')
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/squad')
def squad():
    return render_template('squad.html')

@app.route('/teams')
def teams():
    return render_template('squad.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/shared-dashboards')
def shared_dashboards():
    return render_template('shared-dashboards.html')

@app.route('/SingleTeam')
def single_team():
    team = request.args.get('team', '')
    return render_template('SingleTeam.html')

if __name__ == '__main__':
    print(f"Templates directory: {template_dir}")
    print(f"Static directory: {static_dir}")
    app.run(host='localhost', port=5000, debug=True)
