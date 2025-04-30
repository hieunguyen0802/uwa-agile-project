from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return "Home Page is working!"

@app.route('/data')
def data():
    return render_template('data.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)
