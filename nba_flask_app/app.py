import os

import pymongo
import pandas as pd 
from pymongo import MongoClient
# from flask_pymongo import PyMongo
# import pprint
from datetime import datetime
import time
import calendar
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    redirect)
from flask_cors import CORS, cross_origin
import json
import requests
from sklearn.externals import joblib
#from sklearn.model_selection import train_test_split
#from sklearn.preprocessing import StandardScaler
import pickle

app = Flask(__name__)

# uri="mongodb://localhost:27017/bike_data_db"
# mongo = PyMongo(app, uri)
conn = os.environ.get('MONGODB_URI', '') or 'mongodb://localhost:27017/'
#conn = 'mongodb://localhost:27017'
client = pymongo.MongoClient(conn)

headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'}

@app.route("/")
def index():
	return render_template("index.html")

@app.route("/nbapredictor.html")
def nbapredictor():
	return render_template("nbapredictor.html")

@app.route("/nbastats.html")
def nbastats():
	return render_template("nbastats.html")

@app.route("/nba/teams")
def nba_teams():
	#print(station_name)
	db = client.nba_data_db
	temp = db.nba_teams_data.find()
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	#print(temp[0]['Teams'])
	return jsonify(temp[0]['Teams'])

@app.route("/api/predict/<team>")
def predictTeamRecord(team):
	ffscaler_filename = "./models/fourfactor_scaler.save"
	myscaler_filename = "./models/my_scaler.save"
	ffmodel_filename = "./models/fourfactor.pkl"
	mymodel_filename = "./models/mymodel.pkl"
	ff_scaler = joblib.load(ffscaler_filename)
	my_scaler = joblib.load(myscaler_filename)
	ff_model = pickle.load(open(ffmodel_filename, 'rb'))
	my_model = pickle.load(open(mymodel_filename, 'rb'))
	#print(f"Get info for {team}")
	db = client.nba_data_db
	temp = db.testing_data.find({'Team': team})
	temp = list(temp)
	#print(len(temp))
	for i in temp:
		i.pop('_id', None)
	df = pd.DataFrame(temp)
	# predict for fourfactor
	X_ff = df.loc[:,['eFG%', 'FTARate', 'TOV%', 'OREB%', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
	X_ff_scaled = ff_scaler.transform(X_ff)
	y = df['W/L']
	ff_score = ff_model.score(X_ff_scaled, y)
	ff_predictions = ff_model.predict(X_ff_scaled)
	X_my = df.loc[:,['TS%', 'TOV%', 'OREB%', 'OffEff', 'DefEff', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
	X_my_scaled = my_scaler.transform(X_my)
	my_score = my_model.score(X_my_scaled, y)
	my_predictions = my_model.predict(X_my_scaled)

	predict_ff_wincount = 0
	predict_my_wincount = 0
	actualwincount = 0
	for x in range (len(my_predictions)):
		if(ff_predictions[x] == 'W'):
			predict_ff_wincount += 1
		if(my_predictions[x] == 'W'):
			predict_my_wincount += 1
		if(y[x] == 'W'):
			actualwincount += 1
	results = {'FourFactor': [predict_ff_wincount, len(ff_predictions)-predict_ff_wincount, ff_score],
			'MyModel' : [predict_my_wincount, len(my_predictions)-predict_my_wincount, my_score],
			'Actual' : [actualwincount, len(y)-actualwincount, 0]
			}
	return jsonify(results)

@app.route("/api/stats/<team>")
def getTeamStats(team):
	db = client.nba_data_db
	temp = db.testing_data.find({'Team': team})
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	df = pd.DataFrame(temp)
	df = df.groupby(['W/L'])['AST%', 'AST/TO', 'ASTRatio', 'DREB%', 
		'DefRtg','OREB%', 'OffRtg', 'PACE', 
		'PIE', 'REB%', 'TOV%','TS%',
		'eFG%', 'FTARate', 'OppFTARate', 'OppOREB%',
		'OppTOV%', 'OppeFG%'].mean()
	df = df.reset_index()
	df = df.sort_values(['W/L'])
	return df.to_json(orient='records')

@app.route("/api/nbastats")
def getNbaStats():
	db = client.nba_data_db
	temp = db.nba_stats_data.find()
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	df = pd.DataFrame(temp)
	df = df.sort_values(['W/L'])
	return df.to_json(orient='records')

if __name__ == "__main__":
    app.run(debug=True)
