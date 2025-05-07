from flask import render_template
from app import create_app

app = create_app()

@app.route('/data')
def data():
    return render_template('data.html')

if __name__ == '__main__':
    app.run(debug=True, port=5002)
