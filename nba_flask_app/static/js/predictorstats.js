var teamDisplay = "ATL";
var teamEloData;

var eloRanks;

var modelDisplay;
var modelData;
var modelRegressData;

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

function getModelData(model){
	modelDisplay = model;
	plotModelChart();
	createModelRegressTable();
}
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
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)'
	};
	Plotly.newPlot('elochart', data, layout, {responsive: true});
}
function plotEloRanks(){
	var data = [
		{
		  x: Object.values(eloRanks['Team']).map((value, index) => {
			  var rank = index+1;
			  return `${rank}: ${value}`;
		  }),
		  y: Object.values(eloRanks['ELO']),
		  type: 'bar',
		  marker: {'color': Object.values(eloRanks['ELO']),
                  'colorscale': 'Portland'}
		}
	];
	var layout = {
		title: `Current Season ELO Ranking`,
		xaxis: {
			title: 'Team Rank',
			tickangle: 45
		},
		yaxis: {
			title: 'Team ELO',
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)'
	};
	Plotly.newPlot('elorank', data, layout, {responsive: true});
}
function plotModelChart() {
	var last_feature = Object.keys(modelData[modelDisplay]['Home']['Coef']).length - 1;
	
	var data_road = [
		{
		  x: Object.values(modelData[modelDisplay]['Road']['Features']),
		  y: Object.values(modelData[modelDisplay]['Road']['Coef']),
		  type: 'bar'
		}
	];
	var layout_road = {
		title: `${modelDisplay} Coeffcient Plot (Road)`,
		xaxis: {
			title: 'Features',
			tickangle: 45
		},
		yaxis: {
			title: 'Coeffcient Values',
			range: [modelData[modelDisplay]['Road']['Coef'][0]-2, modelData[modelDisplay]['Road']['Coef'][last_feature]+1]
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)'
	};
	
	var data_home = [
		{
		  x: Object.values(modelData[modelDisplay]['Home']['Features']),
		  y: Object.values(modelData[modelDisplay]['Home']['Coef']),
		  type: 'bar'
		}
	];
	var layout_home = {
		title: `${modelDisplay} Coeffcient Plot (Home)`,
		xaxis: {
			title: 'Features',
			tickangle: 45
		},
		yaxis: {
			title: 'Coeffcient Values',
			range: [modelData[modelDisplay]['Home']['Coef'][0]-2, modelData[modelDisplay]['Home']['Coef'][last_feature]+1]
		},
		paper_bgcolor: 'rgba(0,0,0,0)',
		plot_bgcolor: 'rgba(0,0,0,0)'
	};
	Plotly.newPlot('modelchartroad', data_road, layout_road, {responsive: true});
	Plotly.newPlot('modelcharthome', data_home, layout_home, {responsive: true});
}

function round(value, decimals) {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function createModelRegressTable() {
	//console.log(modelRegressData);
	var stats = Object.keys(modelRegressData);
	//console.log(stats);
	//console.log(modelDisplay);
	var model_stats = new Array();
	var temp = [modelDisplay];
	model_stats.push(temp.concat(stats));
	var displayStats = Object.keys(modelRegressData).map(function(key) {
			return round(modelRegressData[key][modelDisplay],2);
	});
	temp = ['Home-Road Score Delta'];
	model_stats.push(temp.concat(displayStats));
	//console.log(model_stats);
	//Create a HTML Table element.
	var table = document.createElement("TABLE");
	table.border = "1";
	
	//Get the count of columns.
	var columnCount = model_stats[0].length;
	
	//Add the header row.
	var row = table.insertRow(-1);
	for (var i = 0; i < columnCount; i++) {
		var headerCell = document.createElement("TH");
		headerCell.innerHTML = model_stats[0][i];
		row.appendChild(headerCell);
	}
	
	//Add the data rows.
	for (var i = 1; i < model_stats.length; i++) {
		row = table.insertRow(-1);
		for (var j = 0; j < columnCount; j++) {
			var cell = row.insertCell(-1);
			cell.innerHTML = model_stats[i][j];
		}
	}
	 
	var dvTable = document.getElementById("modelregresstable");
	dvTable.innerHTML = "";
	dvTable.appendChild(table);
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
	
	url = "/api/predictorstats/model_coef";
	modelData = await d3.json(url).then(function(data) {
		//console.log(data);
		select = document.getElementById("modelDropDownSelect");
		select.innerHTML = "";
		//select.innerHTML += "<option value=\"" + All + "\">" + All + "</option>"; 
	 	data.forEach(data => {
	 		//console.log(data)
	 		select.innerHTML += "<option value=\"" + data['Model'] + "\">" + data['Model'] + "</option>";
		});
		modelDisplay = data[0]['Model'];
		temp = data.reduce(function(result, item, index, array) {
			result[item['Model']] = item['Params'];
			return result;
		}, {});
		return temp;
	});
	//console.log(modelData[modelDisplay]['Road']['Coef']);

	url = "/api/predictorstats/elo_rank"
	eloRanks = await d3.json(url).then(data => {
		//console.log(data);
		return data;
	});
	plotEloRanks();

	url = "/api/predictorstats/model_regress"
	modelRegressData = await d3.json(url).then(function(data){
		return data;
	});
	getModelData(modelDisplay);
	//console.log(modelRegressData);
}
initPage();
