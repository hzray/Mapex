from flask import Flask, render_template
from datetime import datetime

app = Flask(__name__)


@app.route("/")
def index():
    month = getMonth()
    return render_template("index.html", month=month)



def getMonth():
    monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    today = datetime.today()
    month = monthsList[today.month-1]
    return month

if __name__ == "__main__":
    app.run('0.0.0.0', debug=True) 