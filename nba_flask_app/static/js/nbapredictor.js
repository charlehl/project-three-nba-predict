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
		console.log(teamImage);
		var logoImage = document.createElement("img");
		logoImage.setAttribute('src', teamImage);
		logoImage.setAttribute('alt', `${team}`);
		var logoPic = document.getElementById("teamlogo");
		logoPic.innerHTML = "";
		logoPic.appendChild(logoImage);
	});
}

function initPage() {
	var url = "/nba/teams";
	d3.json(url).then(function(data) {
		//console.log(data);
	 	var select = document.getElementById("teamDropDownSelect");
	 	select.innerHTML = "";
	 	data.forEach(data => {
	 		//console.log(data)
	 		select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
	 	});
	// 	console.log("Hi");
	// 	//initData();
	// 	//buildLiveStatus(data.features[0].kioskId);
	});
	getData('ATL');
}
initPage();
