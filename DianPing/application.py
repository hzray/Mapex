from flask import Flask, render_template, request, send_file, send_from_directory, safe_join, abort, make_response
from datetime import datetime, timedelta 
from datetime import datetime
import pandas as pd
import numpy as np
import json
import os
import time

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = timedelta(seconds=1)



@app.route("/")
def hello():
     return render_template('index.html')


@app.route("/download-csv")
def download_csv():
    path = 'maptyData.csv'
    res = make_response(send_file(path, as_attachment=True, cache_timeout=0))
    res.headers["Cache-Control"] = "no_store"
    res.headers["max-age"] = 1
    return res


@app.route("/update-csv", methods=['POST'])
def update_csv():
    print('new arr received!')
    reviewArr = request.get_json()
    df = makeDataFrame(reviewArr)
    df.sort_values(['Type', 'Rate'], ascending=[True, True], inplace=True)
    df.to_csv ('maptyData.csv', index = False)
    return ('', 204)


def makeDataFrame(reviewArr):
    df = pd.DataFrame(columns=['Type', 'Name', 'Rate', 'Price'])
    for review in reviewArr:
        row = [review['type'], review['name'], review['rate'], review['price']]
        df.loc[len(df)] = row
    return df


if __name__ == "__main__":
    app.debug = True
    app.run('0.0.0.0') 