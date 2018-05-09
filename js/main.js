function ajax(param) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		if (!param.type) param.type = 'GET';
		if (param.type != "GET") {
			xhr.open(param.type, param.url, true);

			if (param.processData != undefined && param.processData == false && param.contentType != undefined && param.contentType == false) {	
			} else if (param.contentType != undefined || param.contentType == true) {
				xhr.setRequestHeader('Content-Type', param.contentType);
			} else {
				xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			}
		} else {
			xhr.open(param.type, param.url, true);
		}
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.onerror = function () {
			reject(xhr.responseText);
		};
		xhr.onload = function () {
			if (xhr.status === 200) {
				if (param.success) {
					if (xhr.getResponseHeader("Content-Type").includes('application/json')) {
						param.success(JSON.parse(xhr.responseText));
					} else {
						param.success(xhr.responseText);
					}
				}
				if (xhr.getResponseHeader("Content-Type").includes('application/json')) {
					resolve(JSON.parse(xhr.responseText));
				} else {
					resolve(xhr.responseText);
				}
			} else {
				reject(xhr.responseText);
			}
		};
		if (param.data != null || param.data != undefined) {
			xhr.send(param.data);
		} else {
			xhr.send();
		}
	});
}

// function that moves the progress bar
var move = function(seconds) {
	var elem = document.getElementById("bar");   
	var width = 1;
	var id = setInterval(frame, (seconds*10));
	function frame() {
		if (width >= 100) {
			clearInterval(id);
		} else {
			width++; 
			elem.style.width = width + '%'; 
		}
	}
}

// fetches an api for a csv and parses it
var loadData = function() {
	return ajax({
		url: 'https://raw.githubusercontent.com/mvhs-apps/student-id-scanner/master/example.csv?auth=' + encodeURIComponent(authentication),
		success: function(data) {
			if (data !== 'failedAuthentication') {

				var before = Date.now();

				temp = data;
				temp = temp.split('\n');

				// parse csv
				for (var i = 0; i < temp.length; i++) {
					// splits each line/person by all of the commas
					temp[i] = temp[i].split(',');

					// loops through all the data in arr and trims it
					for (var j = 0; j < temp[i].length; j++) temp[i][j] = temp[i][j].trim();

					// sets the email to lower case
					temp[i][4] = temp[i][4].toLowerCase();

					// grabs the key which is the stu id number
					// also swaps the 10-digit with the 5 digit stu id #'s
					var key = temp[i][1];
					temp[i][1] = temp[i][0];


					// adds to the gobal array var
					array[key] = temp[i].splice(1, temp[i].length);
					//array[key].push(temp[i][0]);
				}

				console.log('Took ' + (Date.now() - before) + 'ms to parse csv');

				document.getElementById('progress').style.display = 'none';
				mainDivElement.style.display = 'block';
				lastUpdatedNow();
				inputElement.focus();
				console.log('loaded new data');
			} else {
				window.alert('Authentication failed');
				window.location.reload();
			}
		}
	});
}

var clearScreen = function() {
	mainDetailsElement.innerHTML = '';
	responseElement.style.display = 'none';
	emailElement.innerHTML = '';
	firstNameElement.innerHTML = '';
	lastNameElement.innerHTML = '';
	thingsToDoElement.innerHTML = '';
}


var checkForHandler = function() {
	var val = inputElement.value;

	if (val.length === 5) {
		clearScreen();
		handleScan(val);
	} else if (val !== '\n' && val !== "") {
		clearScreen();
	}
}

var escapeHTML = function(unsafe) {
	var div = document.createElement('div');
	div.innerText = unsafe;
	return div.innerHTML;

}

var handleScan = function(studentId) {
	inputElement.value = '';
	inputElement.focus();
	if (array[studentId]) {
		var info = array[studentId];
		//console.log(info);
		var html = `<span style="font-weight:bold;">${info[locationOf.firstName]} has the following issues:</span><br>`;
		var prePoint = '<br>-'

		if (info[locationOf.college_and_career_center] !== '') {
			html += prePoint + 'has one or more items missing from the <span style="font-weight:bold;">College & Career Center</span>';
		}

		if (info[locationOf.library] !== '') {
			html += prePoint + 'has one or more items missing from the <span style="font-weight:bold;">Library</span>';
		}

		if (info[locationOf.textbook_center] !== '') {
			html += prePoint + 'has one or more items missing from the <span style="font-weight:bold;">Textbook Center</span>';
		}

		if (info[locationOf.finance_office] !== '') {
			html += prePoint + 'has one or more items missing from the <span style="font-weight:bold;">Finance Office</span>';
		}

		if (info[locationOf.in_danger] !== '' && info[7] !== '\r') {
			html += prePoint + 'is <span style="font-weight:bold;">in danger of failing</span> one or more classes';
		}

		if (html === `<span style="font-weight:bold;">${info[locationOf.firstName]} has the following issues:</span><br>`) {
			thingsToDoElement.style.color = 'green';
			thingsToDoElement.innerHTML = `<span style="color: green; font-weight: bold; font-size: 30px;">${info[locationOf.firstName]} has completed all requirements!</span>`;
		} else {
			thingsToDoElement.innerHTML = html;
			thingsToDoElement.style.color = 'red';
		}

		emailElement.innerHTML = info[locationOf.email];
		firstNameElement.innerHTML = info[locationOf.firstName];
		lastNameElement.innerHTML = info[locationOf.lastName];
		gradeElement.innerHTML = info[locationOf.grade];
		permStudentIdNumber.innerHTML = info[locationOf.stuPermId];
		if (info[locationOf.notes] !== "") studentNotes.innerHTML = `"${info[locationOf.notes]}"`;
		studentIdNumberElement.innerHTML = studentId;
		responseElement.style.display = 'block';
		var cardElements = document.getElementsByClassName('card');

		for (var i = 0; i < cardElements.length; i++) {
			var t = cardElements[i].classList;
			t.remove('come-in');
			t.add('come-in');
		}

	} else {
		clearScreen();
		mainDetailsElement.style.color = 'red';
		mainDetailsElement.innerHTML = 'Invalid Student ID Number';
	}
}

var array = {};
var authentication;
var inputElement = document.getElementById('input-elem');
var mainDetailsElement = document.getElementById('main-details');
var responseElement = document.getElementById('response');
var thingsToDoElement = document.getElementById('things-to-do');
var firstNameElement = document.getElementById('first-name');
var lastNameElement = document.getElementById('last-name');
var emailElement = document.getElementById('email');
var mainDivElement = document.getElementById('main-div');
var studentIdNumberElement = document.getElementById('student-id-number');
var gradeElement = document.getElementById('grade');
var permStudentIdNumber = document.getElementById('perm-student-id-number');
var studentNotes = document.getElementById('student-notes');

var locationOf = {
	stuPermId: 0,
	lastName: 1,
	firstName: 2,
	email: 3,
	college_and_career_center: 4,
	library: 5,
	textbook_center: 6,
	finance_office: 7,
	in_danger: 8,
	grade: 9,
	notes: 10
}

var milToStan = function(time) {
	if (time[0] > 12) {
		time[0] -= 12;
		var extn = 'pm';
	} else {
		var extn = 'am';
	}
	return time[0] + ':' + time[1] + extn;
}
var lastUpdatedNow = function() {
	var d = new Date();
	var min = d.getMinutes();
	if (min === 0) min = '00';
	if (min < 10) min = '0' + min;
	var time = milToStan([d.getHours(), min]);
	document.getElementById('last-updated').innerText = `Last updated at ${time}.`;
}

var init = function(elem) {
	elem.style.display = 'none';
	authentication = window.prompt("Please enter the password:");
	loadData();
	document.getElementById('main-scanning-area').style.display = 'block';
	move(5);
	var mainInterval = setInterval(function() {
		document.getElementById('last-updated').innerText = 'Updating...';
		loadData();
	}, /*18e4*/ 6e4);
}