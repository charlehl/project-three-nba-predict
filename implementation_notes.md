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
### HTML Code
```html
            <div class = "row">
                <div class="col-md-2">
                        <h3>Select Team first team:</h3>
                        <form action="" method="post">
                        <select name="teamOneDropDownSelect" id="teamOneDropDownSelect" onchange="team2Data(this.value)"> 
                        </select>
                        <h3>Select Team second team:</h3>
                        <select name="teamTwoDropDownSelect" id="teamTwoDropDownSelect"> 
                        </select>
                        <br><br>
                        <input id="team-versus-submit" type="submit" value="Submit">
                        </form>
                </div>
                <div class="col-md-8">
                        <div id="teamlogoOne"></div>
                        <div id="resultsVersus"></div>
                        <div id="teamlogoTwo"></div>
                </div>
            </div>
```
### Javascript
```javascript
$('#team-versus-submit').on('click', function(e){
	e.preventDefault();
	var team1 = $('select#teamOneDropDownSelect').val(),
		team2 = $('select#teamTwoDropDownSelect').val();

	//console.log(team1);
	//console.log(team2);
	var teamImage1 = '/static/logos/' + team1.toLowerCase() + '.gif';
	var teamImage2 = '/static/logos/' + team2.toLowerCase() + '.gif';
	
	var logoImage = document.createElement("img");
	logoImage.style.float = 'left';
	logoImage.style.padding = '5px';
	logoImage.setAttribute('src', teamImage1);
	logoImage.setAttribute('alt', `${team1}`);
	var logoImage2 = document.createElement("img");
	logoImage2.style.padding = '5px';
	//logoImage2.style.float = 'left';
	logoImage2.setAttribute('src', teamImage2);
	logoImage2.setAttribute('alt', `${team2}`);
	var logoPic = document.getElementById("teamlogoOne");
	logoPic.innerHTML = "";
	logoPic.appendChild(logoImage);
	logoPic = document.getElementById("teamlogoTwo");
	logoPic.innerHTML = "";
	logoPic.appendChild(logoImage2);

	//console.log(start);
	//     comments = $('textarea#comments').val(),
	var formData = 'team1=' + team1 + '&team2=' + team2;
  
	 $.ajax({
	   type: 'post',
	   url: '/api/predict_team_vs_team',
	   data: formData,
	   success: function(results) {
		 //console.log(results);
		 var ff_result = `${team1} will lose to ${team2}`;
		 var my_result = `${team1} will lose to ${team2}`;
		 if(results['FourFactor'] == 'W') {
			ff_result = `${team1} will win against ${team2}`;
		 }
		 if(results['MyModel'] == 'W') {
			my_result = `${team1} will win against ${team2}`;
		 }
		  
		 var model_results = new Array();
		 model_results.push(["Model", "Predicted Result"]);
		 model_results.push(["FourFactor", ff_result]);
		 model_results.push(["MyModel", my_result]);
		 //console.log(model_results);
		 //Create a HTML Table element.
		 var table = document.createElement("TABLE");
		 table.style.float = 'left';
		 table.border = "1";

		 //Get the count of columns.
		 var columnCount = model_results[0].length;
	 
		 //Add the header row.
		 var row = table.insertRow(-1);
		 for (var i = 0; i < columnCount; i++) {
			var headerCell = document.createElement("TH");
			headerCell.innerHTML = model_results[0][i];
			row.appendChild(headerCell);
		 }
	 
		 //Add the data rows.
		 for (var i = 1; i < model_results.length; i++) {
			row = table.insertRow(-1);
			for (var j = 0; j < columnCount; j++) {
				var cell = row.insertCell(-1);
				cell.innerHTML = model_results[i][j];
			}
		 }
	 
		 var dvTable = document.getElementById("resultsVersus");
		 dvTable.innerHTML = "";
		 dvTable.appendChild(table);
	   }
	 });
  });
```
### Python Code
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
