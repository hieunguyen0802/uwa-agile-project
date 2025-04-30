from flask import Flask, render_template
from livereload import Server

app = Flask(__name__)
app.debug = True

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/simple')
def simple():
    return render_template('simple.html')

@app.route('/squad')
def squad():
    return render_template('squad.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/data')
def data():
    return render_template('data.html')

@app.route('/test')
def test():
    return render_template('test.html')

@app.route('/login')
def login():
    return render_template('auth/login.html')


@app.route('/signup')
def signup():
    return render_template('auth/signup.html')



# Run the app
if __name__ == '__main__':
    server = Server(app.wsgi_app)
    server.serve(debug=True, port=5000)
