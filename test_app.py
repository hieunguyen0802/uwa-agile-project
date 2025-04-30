from flask import Flask, render_template
import os

template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'templates')
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'static')
app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

@app.route('/')
def home():
    return "Home Page is working!"

@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    print(f"Templates directory: {template_dir}")
    print(f"Static directory: {static_dir}")
    app.run(host='0.0.0.0', port=5002, debug=True)
