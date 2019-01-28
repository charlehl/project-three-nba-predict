var teamNames;
var team1Select;
var team2Select;
//Function to read the data from the selection of user and call the API
function getData(team){
	//console.log(team);
	var url = `/api/predict/${team}`;
	d3.json(url).then(function(data) {
		//console.log(data);
		//Build an array containing Customer records.
		var model_results = new Array();
		model_results.push(["Model", "Wins", "Losses", "Model Score(R2)"]);
		model_results.push(["FourFactor", data['FourFactor'][0], data['FourFactor'][1], data['FourFactor'][2]]);
		model_results.push(["MyModel", data['MyModel'][0], data['MyModel'][1], data['MyModel'][2]]);
		model_results.push(["Actual", data['Actual'][0], data['Actual'][1], "N/A"]);

		//Create a HTML Table element.
		var table = document.createElement("TABLE");
		table.border = "1";

		var headercap = document.createElement("caption");
		headercap.innerHTML = team;
		headercap.innerHTML += " 2018-2019 Season";
		table.appendChild(headercap);
	 
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
	 
		var dvTable = document.getElementById("results");
		dvTable.innerHTML = "";
		dvTable.appendChild(table);

		var teamImage = '/static/logos/' + team.toLowerCase() + '.gif';
		//console.log(teamImage);
		var logoImage = document.createElement("img");
		logoImage.setAttribute('src', teamImage);
		logoImage.setAttribute('alt', `${team}`);
		var logoPic = document.getElementById("teamlogo");
		logoPic.innerHTML = "";
		logoPic.appendChild(logoImage);
	});
}

// Taken from stack overflow
Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};
function team1Data(team){
	//var copy = teamNames;
	var copy = Object.assign({}, teamNames);
	//console.log(copy);
	var result = Object.keys(copy).map(function(key) {
		return copy[key];
	});
	result.remove(team);
	//console.log(result);
	var select = document.getElementById("teamOneDropDownSelect");
	select.innerHTML = "";
	result.forEach(data=> {
		select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
	});
}
function team2Data(team){
	//var copy = teamNames;
	var copy = Object.assign({}, teamNames);
	//console.log(copy);
	var result = Object.keys(copy).map(function(key) {
		return copy[key];
	});
	result.remove(team);
	if(team2Select == team) {
		team2Select = result[0];
		console.log(team2Select);
	}
	//console.log(result);
	var select = document.getElementById("teamTwoDropDownSelect");
	select.innerHTML = "";
	result.forEach(data=> {
		if(team2Select == data) {
			select.innerHTML += "<option select=`selected` value=\"" + data + "\">" + data + "</option>";
		}
		else {
			select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
		}
	});
}
async function initPage() {
	var url = "/nba/teams";
	teamNames = await d3.json(url).then(function(data) {
		//console.log(data);
		var select = document.getElementById("teamDropDownSelect");
		var select2 = document.getElementById("teamOneDropDownSelect");
		select.innerHTML = "";
		select2.innerHTML = "";
	 	data.forEach(data => {
	 		//console.log(data)
			select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
			select2.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
		});
	// 	console.log("Hi");
	// 	//initData();
	// 	//buildLiveStatus(data.features[0].kioskId);
		return (data);
	});
	//console.log(teamNames);
	team1Select = 'ATL';
	team2Select = 'BKN';
	getData('ATL');
	team2Data('ATL');
}

// Monitor submit button
$('#team-versus-submit').on('click', function(e){
	e.preventDefault();
	//console.log("Why");
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

  initPage();