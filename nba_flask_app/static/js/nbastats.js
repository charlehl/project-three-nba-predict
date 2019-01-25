var leagueStats;
var teamStats;
var statDisplay = "eFG%";
var teamDisplay = "ATL";

//Function to read the data from the selection of user and call the API
async function getData(team){
	teamDisplay = team;	
	//console.log(team);
	var url = `/api/stats/${team}`;
	teamStats = await d3.json(url).then(function(data) {
	 	console.log(data);
		// Build an array containing Customer records.
		return(data);
	});
	
	var teamImage = '/static/logos/' + team.toLowerCase() + '.gif';
	console.log(teamImage);
	var logoImage = document.createElement("img");
	logoImage.setAttribute('src', teamImage);
	logoImage.setAttribute('alt', `${team}`);
	var logoPic = document.getElementById("teamlogo");
	logoPic.innerHTML = "";
	logoPic.appendChild(logoImage);

	//console.log(teamStats);
	getStatData(statDisplay);
}
async function getStatData(stat){
	statDisplay = stat;

	var trace1 = {
		x: ['W', 'L'],
		y: [teamStats[1][statDisplay], teamStats[0][statDisplay]],
		name: `${teamDisplay}`,
		type: 'bar'
	};

	var trace2 = {
		x: ['W', 'L'],
		y: [leagueStats[1][statDisplay], leagueStats[0][statDisplay]],
		name: 'League',
		type: 'bar'
	};

	var data = [trace1, trace2];

	var layout = {
		barmode: 'group',
		title: `${stat}`,
		xaxis: {title: 'Wins Vs. Losses'}
	};

	Plotly.newPlot('barchart', data, layout);
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

	var url = "/api/nbastats";
	leagueStats = await d3.json(url).then(function(data) {
	 	//console.log(data);
		// Build an array containing Customer records.
		return (data);
	});
	console.log(leagueStats[0]);
	var statsHeader = Object.keys(leagueStats[0]);
	statsHeader.remove('W/L')
	select = document.getElementById("statDropDownSelect");
	select.innerHTML = "";
	statsHeader.forEach(data => {
		select.innerHTML += "<option value=\"" + data + "\">" + data + "</option>";
	});
	getData(teamDisplay);
	getStatData(statDisplay);
}
initPage();
