var leagueStats;
var teamStats;
var statDisplay = "AST%";
var teamDisplay = "ATL";
var leagueGameData;

//Function to read the data from the selection of user and call the API
async function getData(team){
	teamDisplay = team;	
	//console.log(team);
	var url = `/api/stats/${team}`;
	teamStats = await d3.json(url).then(function(data) {
	 	//console.log(data);
		// Build an array containing Customer records.
		return(data);
	});
	//console.log(teamStats);
	var teamImage = '/static/logos/' + team.toLowerCase() + '.gif';
	//console.log(teamImage);
	var logoImage = document.createElement("img");
	logoImage.setAttribute('src', teamImage);
	logoImage.setAttribute('alt', `${team}`);
	var logoPic = document.getElementById("teamlogo");
	logoPic.innerHTML = "";
	logoPic.appendChild(logoImage);

	//console.log(teamStats);
	getStatData(statDisplay);
}
function getStatData(stat){
	statDisplay = stat;

	var trace1 = {
		x: ['W', 'L'],
		y: [teamStats[1][statDisplay], teamStats[0][statDisplay]],
		name: `${teamDisplay}`,
		type: 'bar',
		marker: {color: 'purple'}
	};

	var trace2 = {
		x: ['W', 'L'],
		y: [leagueStats[1][statDisplay], leagueStats[0][statDisplay]],
		name: 'League',
		type: 'bar',
		marker: {color: 'gold'}
	};

	var data = [trace1, trace2];

	var layout = {
		barmode: 'group',
		title: `${stat}`,
		xaxis: {title: 'Mean Comparison Wins Vs. Losses'}
	};

	Plotly.newPlot('barchart', data, layout, {responsive: true});
	plotHistogram();
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

function plotHistogram(){
	//console.log(statDisplay);
	//console.log(teamDisplay);

	var leagueX = leagueGameData.map(function(value) {
		return value[statDisplay];
	});
	//console.log(leagueX);
	var teamX = leagueGameData.map(function(value) {
		if(value['Team'] === teamDisplay) {
			return value[statDisplay];
		}
		else {
			return -1;
		}
	});
	teamX.remove(-1);
	//console.log(teamX);
	
	var trace1 = {
	  x: teamX,
	  name: `${teamDisplay}`,
	  type: "histogram",
	  opacity: 0.9,
	  marker: {color: 'purple'}
	};
	var trace2 = {
	  x: leagueX,
	  name: 'League',
	  type: "histogram",
	  opacity: 0.3,
	  marker: {color: 'gold'}
	};
	var data = [trace1, trace2];
	var layout = {
		//barmode: "stack",
		barmode: "overlay",
		title: `Histogram Plot ${statDisplay}`,
	};
	Plotly.newPlot('historgram', data, layout, {responsive: true});
}

async function initPage() {
	var url = "/nba/teams";
	//var statsHeader = ['AST%', 'AST/TO', 'ASTRatio'];
	d3.json(url).then(function(data) {
		//console.log(data);
	 	var select = document.getElementById("teamDropDownSelect");
		select.innerHTML = "";
		//select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>"; 
	 	data.forEach(data => {
	 		//console.log(data)
	 		select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
		});
	});

	url = "/api/nbastats/histogram";
	leagueGameData = await d3.json(url).then(function(data) {
		return data;
	});

	url = "/api/nbastats";
	leagueStats = await d3.json(url).then(function(data) {
	 	//console.log(data);
		// Build an array containing Customer records.
		return (data);
	});
	//console.log(leagueStats[0]);
	var statsHeader = Object.keys(leagueStats[0]);
	statsHeader.remove('W/L')
	select = document.getElementById("statDropDownSelect");
	select.innerHTML = "";
	statsHeader.forEach(data => {
		select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
	});
	getData(teamDisplay);

	//console.log(leagueGameData);
	//plotHistogram();
}
initPage();
