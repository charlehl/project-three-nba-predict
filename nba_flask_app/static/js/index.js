// Function to setup index page tables
function initPage() {
	var url = "/api/model_params";
	d3.json(url).then(function(data) {
		//console.log(data[0]);
		// Create Coefficient table for fourfactor
		var model_params = new Array();
		model_params.push(["Coefficient", "Value"]);
		Object.keys(data[0]['Params']).forEach(function(key) {
			model_params.push([key, data[0]['Params'][key]]);
		});
		//Create a HTML Table element.
		var table = document.createElement("table");
		table.border = "1";
		//Get the count of columns.
		var columnCount = model_params[0].length;
		//Add the header row.
		var row = table.insertRow(-1);
		for (var i = 0; i < columnCount; i++) {
			var headerCell = document.createElement("th");
			headerCell.innerHTML = model_params[0][i];
			row.appendChild(headerCell);
		}
		//Add the data rows.
		for (var i = 1; i < model_params.length; i++) {
			row = table.insertRow(-1);
			for (var j = 0; j < columnCount; j++) {
				var cell = row.insertCell(-1);
				cell.innerHTML = model_params[i][j];
			}
		}
		var dvTable = document.getElementById("fourfactor_table");
		dvTable.innerHTML = "";
		dvTable.appendChild(table);
		
		// Create Coefficient table for mymodel
		//console.log(data[1]);
		var model_params = new Array();
		model_params.push(["Coefficient", "Value"]);
		Object.keys(data[1]['Params']).forEach(function(key) {
			model_params.push([key, data[1]['Params'][key]]);
		});
		//Create a HTML Table element.
		var table = document.createElement("table");
		table.border = "1";
		//Get the count of columns.
		var columnCount = model_params[0].length;
		//Add the header row.
		var row = table.insertRow(-1);
		for (var i = 0; i < columnCount; i++) {
			var headerCell = document.createElement("th");
			headerCell.innerHTML = model_params[0][i];
			row.appendChild(headerCell);
		}
		//Add the data rows.
		for (var i = 1; i < model_params.length; i++) {
			row = table.insertRow(-1);
			for (var j = 0; j < columnCount; j++) {
				var cell = row.insertCell(-1);
				cell.innerHTML = model_params[i][j];
			}
		}
		var dvTable = document.getElementById("mymodel_table");
		dvTable.innerHTML = "";
		dvTable.appendChild(table);
	});
}

initPage();