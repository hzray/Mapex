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
    date = getDate()
    return render_template("index.html", date=date)


@app.route("/total_plot", methods=["POST","GET"])
def change_features():
    income = float(request.args['income'])
    expense = float(request.args['expense'])
    graphJSON= create_plot(income, expense)
    return graphJSON


@app.route("/income_plot", methods=["POST"])
def plot_income_chart():
    incomeRecords = request.get_json()
    graphJSON= create_income_plot(incomeRecords)
    return graphJSON

@app.route("/expense_plot", methods=["POST"])
def plot_expense_chart():
    expenseRecords = request.get_json()
    graphJSON= create_expense_plot(expenseRecords)
    return graphJSON



def getDate():
    monthsList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    today = datetime.today()
    month = monthsList[today.month-1]
    year = today.year
    return month + ' ' + str(year)

def create_plot(income, expense):
    langs = ['income', 'expense']
    students = [income,expense]
    data = [go.Pie(labels = langs, values = students)]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


def create_income_plot(incomeRecords):
    category = ['Salary', 'Saving', 'Investment', 'Pension', 'Other']
    amount = [0, 0, 0, 0, 0]
    for item in incomeRecords:
        print(item['category'])
        if item['category'] == 'salary':
            amount[0] += item['amount']
        elif item['category'] == 'saving':  
            amount[1] += item['amount']
        elif item['category'] == 'investment':  
            amount[2] += item['amount']
        elif item['category'] == 'pension':  
            amount[3] += item['amount']
        else :
            amount[4] += item['amount']
    data = [go.Pie(labels = category, values = amount)]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON

def create_expense_plot(expenseRecords):
    category = ['Housing', 'Transportation', 'Food', 'Clothing', 'Education', 'Leisure', 'Loan', 'Other']
    amount = [0, 0, 0, 0, 0, 0, 0, 0]
    for item in expenseRecords:
        print(item['category'])
        if item['category'] == 'housing':
            amount[0] += item['amount']
        elif item['category'] == 'transport': 
            amount[1] += item['amount']
        elif item['category'] == 'food':  
            amount[2] += item['amount']
        elif item['category'] == 'cloth':  
            amount[3] += item['amount']
        elif item['category'] == 'education':  
            amount[4] += item['amount']
        elif item['category'] == 'leisure':  
            amount[5] += item['amount']
        elif item['loan'] == 'loan':  
            amount[6] += item['amount']
        else :
            print('it is other')
            amount[7] += item['amount'] 
    data = [go.Pie(labels = category, values = amount)]
    graphJSON = json.dumps(data, cls=plotly.utils.PlotlyJSONEncoder)
    return graphJSON


if __name__ == "__main__":
    app.run('0.0.0.0') 