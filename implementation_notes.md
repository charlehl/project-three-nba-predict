# Implementation Notes for Project
## FourFactor Machine Model
```python
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
X = df.loc[:,['eFG%', 'FTARate', 'TOV%', 'OREB%', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
y = df['W/L']
fourfactor_model = LogisticRegression(verbose=1)
X_scaler = StandardScaler().fit(X)
X_train_scaled = X_scaler.transform(X)
fourfactor_model.fit(X_train_scaled, y)
fourfactor_model.coef_
```
## My Model Machine Model
```python
X = df.loc[:,['TS%', 'TOV%', 'OREB%', 'OffEff', 'DefEff', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%', 'PACE']]
y = df['W/L']
X_scaler = StandardScaler().fit(X)
X_train_scaled = X_scaler.transform(X)
my_model = LogisticRegression(C = .75, solver='liblinear', multi_class='ovr', penalty='l1', verbose=1)
my_model.fit(X_train_scaled, y_train)
my_model.coef_
```
## Trying to use SGD
```python
from sklearn.linear_model import SGDClassifier
X = df_train.loc[:,['TS%', 'TOV%', 'OREB%', 'DefRtg', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
y = df_train['W/L']
mySGD_model = SGDClassifier(class_weight='balanced', loss="log", max_iter=1000, tol=1e-3, penalty="elasticnet")
mySGD_model.fit(X, y)
mySGD_model.coef_
mySGD_model.score(X_train_scaled, y)
```
## Saving/Loading machine models
```python
import pickle
# Saving
mymodel_filename = 'mymodel.pkl'
pickle.dump(newModel, open(mymodel_filename, 'wb'))
# Loading
my_model = pickle.load(open(mymodel_filename, 'rb'))
```
## Saving/Loading Scalar
```python
from sklearn.externals import joblib
# Saving
myscaler_filename = "my_scaler.save"
joblib.dump(X_scaler, myscaler_filename)
# Loading
my_scaler = joblib.load(myscaler_filename)
```
## Scraping Training Data
```python
# create splinter browser
def init_browser():
    executable_path = {'executable_path': 'chromedriver.exe'}
    browser = Browser('chrome', **executable_path, headless=False)
    return browser
browser = init_browser()
nba_17_18_boxscores_url = "https://stats.nba.com/teams/boxscores-advanced/?Season=2017-18&SeasonType=Regular%20Season"
nba_17_18_fourfactor_url = "https://stats.nba.com/teams/boxscores-four-factors/?Season=2017-18&SeasonType=Regular%20Season"
# visit website
browser.visit(nba_17_18_boxscores_url)
time.sleep(3)
# get click path by xpath from browser inspector
sel_all_path = browser.find_by_xpath("/html/body/main/div[2]/div/div[2]/div/div/nba-stat-table/div[1]/div/div/select/option[1]")
# select to display all games
sel_all_path.click()
time.sleep(5)
# parse html in soup
html = browser.html
# Parse with soup
soup = bs(html, 'html.parser')
# Find all tables
table = soup.find_all('table')[0] 
df = pd.read_html(str(table))
# drop season column since unneeded
new_df = df[0].drop(columns=['Season'])
# Rename column names
new_df.rename(columns={"Game\xa0Date": "GameDate", "Match\xa0Up": "MatchUp"}, inplace=True)
# change gamedate to datetime
new_df['GameDate'] = new_df['GameDate'].apply(lambda x: dt.datetime.strptime(x, "%m/%d/%Y"))
###############################################################################################
# visit website
browser.visit(nba_17_18_fourfactor_url)
time.sleep(3)
# get click path by xpath from browser inspector
sel_all_path = browser.find_by_xpath("/html/body/main/div[2]/div/div[2]/div/div/nba-stat-table/div[1]/div/div/select/option[1]")
# select to display all games
sel_all_path.click()
time.sleep(5)
# parse html in soup
html = browser.html
# Parse with soup
soup = bs(html, 'html.parser')
# Find all tables
table = soup.find_all('table')[0] 
df = pd.read_html(str(table))
# drop season column since unneeded
df = df[0].drop(columns=['Season'])
# Rename columns
df.rename(columns={"Game\xa0Date": "GameDate", "Match\xa0Up": "MatchUp", "OppFTA\xa0Rate": "OppFTARate"}, inplace=True)
# Convert to float percent values
df['OREB%'] = df['OREB%'].str.rstrip('%').astype('float')
df['OppOREB%'] = df['OppOREB%'].str.rstrip('%').astype('float')
df['OppeFG%'] = df['OppeFG%'].str.rstrip('%').astype('float')
df['eFG%'] = df['eFG%'].str.rstrip('%').astype('float')
# change gamedate to datetime
df['GameDate'] = df['GameDate'].apply(lambda x: dt.datetime.strptime(x, "%m/%d/%Y"))
df = df.drop(['MIN', 'MatchUp', 'W/L', 'eFG%', 'OREB%', 'TOV%'], axis=1)
###############################################################################################
# Merge fourfactor and adv box stats
result = pd.merge(new_df, df, on=['Team', 'GameDate'])
# export to json
items = result.to_json(orient='records', date_format='iso')
# load json string to json
items_db = json.loads(items)
# insert data to collection
db.testing_data.insert_many(items_db)
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
		# Load models and scalers
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
		# Pull current season data for both teams
		db = client.nba_data_db
		temp = db.testing_data.find({'$or' : [{'Team': team1}, {'Team': team2}]})
		temp = list(temp)
		for i in temp:
			i.pop('_id', None)
		df = pd.DataFrame(temp)
		# Group by teams and calculate averages
		result = df.groupby(['Team'])['TS%', 'eFG%', 'FTARate', 'TOV%', 'OREB%', 'DefRtg', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%'].mean()
		# To compare team, replace Opp with team2
		result.loc[team1,'OppFTARate'] = result.loc[team2,'FTARate']
		result.loc[team1,'OppOREB%'] = result.loc[team2,'OREB%']
		result.loc[team1,'OppTOV%'] = result.loc[team2,'TOV%']
		result.loc[team1,'OppeFG%'] = result.loc[team2,'eFG%']
		# Get proper index for predicted result, i.e. team1
		index = result.index[0]
		if index == team1:
			team_index = 0
		else:
			team_index = 1
		# Predict result
		X_ff = result.loc[:,['eFG%', 'FTARate', 'TOV%', 'OREB%', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
		X_ff_scaled = ff_scaler.transform(X_ff)
		ff_predictions = ff_model.predict(X_ff_scaled)
		X_my = result.loc[:,['TS%', 'TOV%', 'OREB%', 'FTARate', 'DefRtg', 'OppFTARate', 'OppOREB%', 'OppTOV%', 'OppeFG%']]
		X_my_scaled = my_scaler.transform(X_my)
		my_predictions = my_model.predict(X_my_scaled)
		predict_results = {'FourFactor': ff_predictions[team_index],
						   'MyModel' : my_predictions[team_index] 
						  }
		return jsonify(predict_results)
	return render_template("nbapredictor.html")
```
## MongoDB
### Mongo save
    mongodump -h localhost:27017 -d nba_data_db -o db_backup
### Mongo restore
    mongorestore -h ds043991.mlab.com:43991 -d heroku_4rs73gg2 -u <user> -p <password> --authenticationDatabase heroku_4rs73gg2 db_backup/*
