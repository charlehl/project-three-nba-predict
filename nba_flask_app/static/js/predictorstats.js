var teamDisplay = "ATL";
var teamEloData;

var modelDisplay;
var modelData;

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
	getModelData(modelDisplay);
}
initPage();
