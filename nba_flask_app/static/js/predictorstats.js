var teamDisplay = "ATL";
var teamEloData;

//Function to read the data from the selection of user and call the API
async function getEloData(team){
	teamDisplay = team;	

	var teamImage = '/static/logos/' + team.toLowerCase() + '.gif';

	var logoImage = document.createElement("img");
	logoImage.setAttribute('src', teamImage);
	logoImage.setAttribute('alt', `${team}`);
	var logoPic = document.getElementById("teamlogo");
	logoPic.innerHTML = "";
	logoPic.appendChild(logoImage);

	plotEloChart();
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

function plotEloChart(){
	//console.log(statDisplay);
	//console.log(teamDisplay);

	var trace1 = {
		x: teamEloData[teamDisplay][0],
		y: teamEloData[teamDisplay][1],
		type: 'scatter',
		mode: 'markers+lines'
	};

	var data = [trace1];
	var layout = {
		title: `ELO Plot ${teamDisplay}`,
		xaxis: {
			title: 'Game & Opponent',
			tickangle: 45,
		},
		yaxis: {
			title: 'ELO Score',
		}
	};
	Plotly.newPlot('elochart', data, layout, {responsive: true});
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

	url = "/api/predictorstats/team_elo"
	
	teamEloData = await d3.json(url).then(function(data) {
		return data;
	});
	//console.log(teamEloData);
	getEloData(teamDisplay);
}
initPage();
