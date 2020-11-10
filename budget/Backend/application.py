from flask import Flask, render_template
from datetime import datetime
import pandas as pd
import matplotlib.pyplot as plt
import os
import time

app = Flask(__name__)

global loadtime
loadtime = 0

@app.route("/")
def index():
    month = getMonth()
    new_graph_name = drawChart()
    return render_template("index.html", month=month, graph=new_graph_name)



def getMonth():
    monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    today = datetime.today()
    month = monthsList[today.month-1]
    return month

def drawChart():
    # Reference : https://stackoverflow.com/a/53203545/12358813
    # Get help of clean image cache
    Tasks = [300,500,700]
    my_labels = 'Tasks Pending','Tasks Ongoing','Tasks Completed'
    plt.pie(Tasks,labels=my_labels,autopct='%1.1f%%')
    plt.title('My Tasks')
    plt.axis('equal')

    new_graph_name = "graph" + str(time.time()) + ".png"
    for filename in os.listdir('static/'):
        if filename.startswith('graph_'):  # not to remove other images
            os.remove('static/' + filename)

    plt.savefig('static/' + new_graph_name)
    return new_graph_name

if __name__ == "__main__":
    app.run('0.0.0.0', debug=True) 