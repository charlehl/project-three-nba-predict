# Implementation Notes for Project
## Saving/Loading machine models
```python
# Saving
mymodel_filename = 'mymodel.pkl'
pickle.dump(newModel, open(mymodel_filename, 'wb'))
# Loading
my_model = pickle.load(open(mymodel_filename, 'rb'))
```
## Saving/Loading Scalar
```python
# Saving
myscaler_filename = "my_scaler.save"
joblib.dump(X_scaler, myscaler_filename)
# Loading
my_scaler = joblib.load(myscaler_filename)
```
## Team Predictor
```python
@app.route("/api/predict_team_vs_team", methods=["POST"])
def predictTeamVsTeam():
	if request.method == "POST":
		ffscaler_filename = "./models/fourfactor_scaler.save"
		myscaler_filename = "./models/my_scaler.save"
		ffmodel_filename = "./models/fourfactor.pkl"
		mymodel_filename = "./models/mymodel.pkl"
		ff_scaler = joblib.load(ffscaler_filename)
		my_scaler = joblib.load(myscaler_filename)
		ff_model = pickle.load(open(ffmodel_filename, 'rb'))
		my_model = pickle.load(open(mymodel_filename, 'rb'))
		# Get teams to compare
		team1 = request.form["team1"]
		team2 = request.form["team2"]
		db = client.nba_data_db
		temp = db.testing_data.find({'$or' : [{'Team': team1}, {'Team': team2}]})
		temp = list(temp)
		for i in temp:
			i.pop('_id', None)
		df = pd.DataFrame(temp)
		result = df.groupby(['Team'])['eFG%', 'FTARate', 'TOV%', 'OREB%', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%'].mean()
		temp = db.nba_stats_data.find({'W/L': 'W'})
		temp = list(temp)
		for i in temp:
			i.pop('_id', None)
		df_stat = pd.DataFrame(temp)
		result_2 = df.groupby(['Team'])['TS%', 'TOV%', 'OREB%', 'OffRtg', 'DefRtg', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%'].mean()
		# Calculate feature field
		result_2['OffEff'] = np.where(result_2['OffRtg']>=df_stat.loc[0,'OffRtg'], 1, 0)
		result_2['DefEff'] = np.where(result_2['DefRtg']<=df_stat.loc[0,'DefRtg'], 1, 0)
		result_2 = result_2.drop(['OffRtg', 'DefRtg'], axis=1)
		result_2 = result_2[['TS%', 'TOV%', 'OREB%', 'OffEff', 'DefEff', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
		# To compare team, replace Opp with team2
		result.loc[team1,'OppFTARate'] = result.loc[team2,'FTARate']
		result.loc[team1,'OppOREB%'] = result.loc[team2,'OREB%']
		result.loc[team1,'OppTOV%'] = result.loc[team2,'TOV%']
		result.loc[team1,'OppeFG%'] = result.loc[team2,'eFG%']
		result_2.loc[team1,'OppFTARate'] = result.loc[team2,'FTARate']
		result_2.loc[team1,'OppOREB%'] = result.loc[team2,'OREB%']
		result_2.loc[team1,'OppTOV%'] = result.loc[team2,'TOV%']
		result_2.loc[team1,'OppeFG%'] = result.loc[team2,'eFG%']
		# Get proper index for predicted result
		index = result.index[0]
		if index == team1:
			ff_index = 0
		else:
			ff_index = 1
		index = result.index[0]
		if index == team1:
			my_index = 0
		else:
			my_index = 1
		X_ff = result.loc[:,['eFG%', 'FTARate', 'TOV%', 'OREB%', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
		X_ff_scaled = ff_scaler.transform(X_ff)
		ff_predictions = ff_model.predict(X_ff_scaled)
		X_my = result_2.loc[:,['TS%', 'TOV%', 'OREB%', 'OffEff', 'DefEff', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
		X_my_scaled = my_scaler.transform(X_my)
		my_predictions = my_model.predict(X_my_scaled)
		predict_results = {'FourFactor': ff_predictions[ff_index],
						   'MyModel' : my_predictions[my_index] 
						  }
		return jsonify(predict_results)
	return render_template("nbapredictor.html")
```
## MongoDB
### Mongo save
    mongodump -h localhost:27017 -d nba_data_db -o db_backup
### Mongo restore
    mongorestore -h ds043991.mlab.com:43991 -d heroku_4rs73gg2 -u <user> -p <password> --authenticationDatabase heroku_4rs73gg2 db_backup/*
