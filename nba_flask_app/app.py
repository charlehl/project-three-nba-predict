import os

import pymongo
import pandas as pd
import numpy as np
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
import pickle
import dateutil.parser

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

@app.route("/api/model_params")
def getModelParams():
	# Get model params
	db = client.nba_data_db
	temp = db.model_data.find()
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	return jsonify(temp)

@app.route("/api/get_db_lastupdate")
def getDbLastUpdate():
	db = client.nba_data_db
	temp = db.testing_data.find().sort('GameDate',pymongo.DESCENDING).limit(1)
	date_index = temp[0]['GameDate']
	last_date = dateutil.parser.parse(date_index)
	last_date = last_date.strftime('%m/%d/%Y')
	return jsonify({'date': last_date})

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
	X_my = df.loc[:,['TS%', 'TOV%', 'OREB%', 'FTARate', 'DefRtg', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
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

def getHomeRoadMeans(teamRoad, teamHome):
	db = client.nba_data_db
	scoreScaler_filename = "./models/score_scaler.save"
	X_scaler = joblib.load(scoreScaler_filename)
	temp = db.score_pred_testing_data.find({'$or' : [{'HomeTeam': teamHome}, {'RoadTeam': teamRoad}]})
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	df_test = pd.DataFrame(temp)
	df_test = df_test.sort_values(['GameDate'], ascending=0).reset_index(drop=True)
	home_df = df_test[df_test['HomeTeam'] == teamHome].reset_index(drop=True)
	road_df = df_test[df_test['RoadTeam'] == teamRoad].reset_index(drop=True)
	homeMean = home_df[0:5].mean()
	roadMean = road_df[0:5].mean()
	test_series = pd.Series(data = [homeMean['DefRtg_h'], homeMean['PIE_h'], homeMean['FTARate_h'], homeMean['REB%_h'], homeMean['TOV%_h'], homeMean['TS%_h'], homeMean['PACE_h'], homeMean['ELO_h'],
									roadMean['DefRtg_r'], roadMean['PIE_r'], roadMean['FTARate_r'], roadMean['REB%_r'], roadMean['TOV%_r'], roadMean['TS%_r'], roadMean['PACE_r'], roadMean['ELO_r']
	])
	test_data = test_series.values.reshape(1,16)
	return X_scaler.transform(test_data)

def predictAllModels(testData):
	# Load models
	bayHome_filename = "./models/bay_rig_home_model.pkl"
	bayRoad_filename = "./models/bay_rig_road_model.pkl"
	ardHome_filename = "./models/ard_home_model.pkl"
	ardRoad_filename = "./models/ard_road_model.pkl"
	huberHome_filename = "./models/huber_home_model.pkl"
	huberRoad_filename = "./models/huber_road_model.pkl"
	sgdHome_filename = "./models/sgd_home_model.pkl"
	sgdRoad_filename = "./models/sgd_road_model.pkl"
	theilHome_filename = "./models/theil_sen_home_model.pkl"
	theilRoad_filename = "./models/theil_sen_road_model.pkl"
	ransacHome_filename = "./models/ransac_home_model.pkl"
	ransacRoad_filename = "./models/ransac_road_model.pkl"

	bayHome_model = pickle.load(open(bayHome_filename, 'rb'))
	bayRoad_model = pickle.load(open(bayRoad_filename, 'rb'))
	ardHome_model = pickle.load(open(ardHome_filename, 'rb'))
	ardRoad_model = pickle.load(open(ardRoad_filename, 'rb'))
	huberHome_model = pickle.load(open(huberHome_filename, 'rb'))
	huberRoad_model = pickle.load(open(huberRoad_filename, 'rb'))
	sgdHome_model = pickle.load(open(sgdHome_filename, 'rb'))
	sgdRoad_model = pickle.load(open(sgdRoad_filename, 'rb'))
	theilHome_model = pickle.load(open(theilHome_filename, 'rb'))
	theilRoad_model = pickle.load(open(theilRoad_filename, 'rb'))
	ransacHome_model = pickle.load(open(ransacHome_filename, 'rb'))
	ransacRoad_model = pickle.load(open(ransacRoad_filename, 'rb'))

	predVals = {}

	# Baysian Ridge Model
	temp = [bayRoad_model.predict(testData)[0], bayHome_model.predict(testData)[0]]
	mean = [temp[0], temp[1]]
	predVals['BayRidgeRegress'] = temp
	#ARD Regressor
	temp = [ardRoad_model.predict(testData)[0], ardHome_model.predict(testData)[0]]
	mean[0] += temp[0]
	mean[1] += temp[1]
	predVals['ArdRegress'] = temp
	# Huber Loss
	temp = [huberRoad_model.predict(testData)[0], huberHome_model.predict(testData)[0]]
	mean[0] += temp[0]
	mean[1] += temp[1]
	predVals['HuberRegress'] = temp
	# SGD with 
	temp = [sgdRoad_model.predict(testData)[0], sgdHome_model.predict(testData)[0]]
	mean[0] += temp[0]
	mean[1] += temp[1]
	predVals['SgdRegress'] = temp
	# Theil-Sen handles more robust than LSE, less sensitive to outliers
	temp = [theilRoad_model.predict(testData)[0], theilHome_model.predict(testData)[0]]
	mean[0] += temp[0]
	mean[1] += temp[1]
	predVals['TheilSenRegress'] = temp
	# Deals better with large outliers in y
	temp = [ransacRoad_model.predict(testData)[0], ransacHome_model.predict(testData)[0]]
	mean[0] += temp[0]
	mean[1] += temp[1]
	predVals['RansacRegress'] = temp    
		
	predVals['modelMean'] = [mean[0]/len(predVals), mean[1]/len(predVals)]
	return predVals

@app.route("/api/predict_team_vs_team", methods=["POST"])
def predictTeamVsTeam():
	if request.method == "POST":
		# Get teams to compare
		teamHome = request.form["team1"]
		teamRoad = request.form["team2"]
		# Pull current season data for both teams
		data = getHomeRoadMeans(teamRoad, teamHome)
		predict_results = predictAllModels(data)

		return jsonify(predict_results)
	return render_template("nbapredictor.html")

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

@app.route("/api/nbastats/histogram")
def getNbaStatsHistogram():
	db = client.nba_data_db
	temp = db.training_data.find()
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	df_train = pd.DataFrame(temp)
	temp = db.testing_data.find()
	temp = list(temp)
	for i in temp:
		i.pop('_id', None)
	df_test = pd.DataFrame(temp)
	df_train = df_train[['AST%', 'AST/TO', 'ASTRatio', 'DREB%', 'DefRtg', 'FTARate', 'OREB%', 'OffRtg', 'OppFTARate', 'OppOREB%',
                     'OppTOV%', 'OppeFG%', 'PACE', 'PIE', 'REB%', 'TOV%', 'TS%', 'eFG%', 'Team']]
	df_test = df_test[['AST%', 'AST/TO', 'ASTRatio', 'DREB%', 'DefRtg', 'FTARate', 'OREB%', 'OffRtg', 'OppFTARate', 'OppOREB%',
                     'OppTOV%', 'OppeFG%', 'PACE', 'PIE', 'REB%', 'TOV%', 'TS%', 'eFG%', 'Team']]
	df = pd.concat([df_train, df_test])
	return df.to_json(orient='records')

if __name__ == "__main__":
    app.run(debug=True)
