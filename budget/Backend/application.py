from flask import Flask, render_template, request
from datetime import datetime
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import plotly
import plotly.graph_objs as go
import json
import os
import time

app = Flask(__name__)


@app.route("/", methods=["POST","GET"] )
def index():
    month = getMonth()
    return render_template("index.html", month=month)


@app.route("/bar", methods=["POST","GET"])
def change_features():
    income = float(request.args['income'])
    expense = float(request.args['expense'])
    graphJSON= create_plot(income, expense)
    return graphJSON



def getMonth():
    monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    today = datetime.today()
    month = monthsList[today.month-1]
    return month

def create_plot(income, expense):
    langs = ['income', 'expense']
    students = [income,expense]
    data = [go.Pie(labels = langs, values = students)]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


if __name__ == "__main__":
    app.run('0.0.0.0') 