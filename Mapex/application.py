# Reference: https://www.pythonf.cn/read/116334
from flask import Flask, render_template, request, send_file, send_from_directory, safe_join, abort, make_response
from datetime import datetime, timedelta 
import pandas as pd
import numpy as np
import os
import plotly
import plotly.graph_objs as go
import plotly.express as px
import pika
import uuid
import json



class DemoRpcClient(object):
    def __init__(self):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
        self.channel = self.connection.channel()

        result = self.channel.queue_declare(queue='', exclusive=True)
        self.callback_queue = result.method.queue

        self.channel.basic_consume(
            queue=self.callback_queue,
            on_message_callback=self.on_response,
            auto_ack=True)

    def on_response(self, ch, method, props, body):
        if self.corr_id == props.correlation_id:
            self.response = json.loads(body.decode('utf-8'))

    def call(self, arg):
        self.response = None
        self.corr_id = str(uuid.uuid4())
        body = json.dumps(arg).encode('utf8')
        
        self.channel.basic_publish(
            exchange='',
            routing_key='rpc_queue',
            properties=pika.BasicProperties(reply_to=self.callback_queue, correlation_id=self.corr_id),
            body=body)
        while self.response is None:
            self.connection.process_data_events()
        return self.response





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
    df.sort_values(['Type', 'Rate'], ascending=[True, False], inplace=True)
    df.to_csv ('maptyData.csv', index = False)
    return ('', 204)


def makeDataFrame(reviewArr):
    df = pd.DataFrame(columns=['Type', 'Name', 'Rate', 'Price', 'Description'])
    for review in reviewArr:
        row = [review['type'], review['name'], review['rate'], review['price'], review['descript']]
        df.loc[len(df)] = row
    return df


@app.route("/report")
def show_report():
    pyplt = plotly.offline.plot
    types = ['food','hotel','beauty','leisure','activity','attraction','other']
    df = pd.read_csv('maptyData.csv', index_col=False)
    
    data = px.scatter(df, x="Price", y="Rate", color="Type",
                        title='Scatterplot of Price/Rate')
    fig = go.Figure(data=data)
    div = pyplt(fig, output_type='div', include_plotlyjs=False, auto_open=False, show_link=False)
    context = {}
    context['scatter'] = div


    data = px.pie(df,names='Type', 
                title='Piechart of Review')
    fig = go.Figure(data=data)
    div = pyplt(fig, output_type='div', include_plotlyjs=False, auto_open=False, show_link=False)
    context['piechart'] = div

    numReview = len(df)
    sumRate = sum(df.Rate)

    rpc = DemoRpcClient()
    response = rpc.call({'sumRate': sumRate, 'numRate': numReview})
    avgRate = round(response['avg'],2)

    return render_template('report.html', df = df, types=types, context=context, 
                    numReview=numReview, avgRate=avgRate)

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0') 


