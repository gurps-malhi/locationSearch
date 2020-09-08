/*
	Declare var
*/
var allUsers = new Array();
var withinlondon = 20 // change value to determine to radius of london.
var londonlat = 51.509865;
var londonlong = -0.118092;


/*
	Get Elements; 
*/
var mlselect = document.getElementById("no_mile");
var divSelect = document.getElementById('user-selection');
var dropdown = document.getElementById("no_mile");
var dropdown = document.getElementById("no_mile");
var search_btn = document.getElementById('search_miles');
var loadingTitle = document.getElementById('loading_title');
 /*
	This function retrieves all user data by calling the user API and then processes all user data
	and stores it in an Array for subsequent use
 */
 function GetData(url,callbackFunction) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url);
	xmlhttp.onerror = function() { // only triggers if the request couldn't be made at all
		alert('Sorry but there is an issue connecting to the API');
	};
	xmlhttp.onprogress = function(event) { // triggers periodically
	};
	xmlhttp.onload = function() {
		if(this.readyState === 4 && this.status === 200) {
			var userData = JSON.parse(xmlhttp.responseText);
			ProcessUsers(userData)		
		}
		else{
			alert('Sorry could not retrieve data successfully.')
		}
		PopulateDistanceDropDown();
		FindUsersWithinRange();
	};
	xmlhttp.send();	
}

/* I have added this part of URL https://cors-anywhere.herokuapp.com because of CORS as the API doesn't
 'Access-Control-Allow-Origin'  header that allows me to make cross domain requests */
 var userApiUrl = "https://cors-anywhere.herokuapp.com/https://dwp-techtest.herokuapp.com/users";
       
 GetData(userApiUrl, ProcessUsers);
/*
	this function processes user data returned from the API call in GetData function 
*/
function ProcessUsers(objResponse){		
	for(var userix in objResponse){
		var user = objResponse[userix];
		ProcessSingleUser(user);		
	}	
}

/*
	This function receives a user as JSON object and creates a new entity that get stored in 
	the allUsers array for subsequent use.
*/
function ProcessSingleUser(user){
	//add a property to user to record distance from London
	user.distance_from_london = getDistanceFromLatLonInMl(user.latitude, user.longitude,londonlat, londonlong);
	//finally store user in our allUser array for later use.
	allUsers.push(user);
}


function getDistanceFromLatLonInMl(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		return dist;
	}
}

/* function works out all users that are within given distance range from central london */
function GetAllUserWithinDistanceRange(distanceFromLondon){
	var resultArray = new Array();
	
	for(var i = 0; i < allUsers.length; i++){
		var miles_away = allUsers[i].distance_from_london;
		if(miles_away <= distanceFromLondon || miles_away <= withinlondon){
			var res = allUsers[i];
			resultArray.push(res);
			
		}
	}
	return resultArray;
	
}

/*
function to load our distance selection list.
*/
function PopulateDistanceDropDown(){
	var allDistances = new Array();
	var count = 1;
	//get ranges for all our distances
	for(var index in allUsers){
		//whole number to define the range
		var userDistance = Math.ceil(allUsers[index].distance_from_london / 10) * 10;
		if(!allDistances[userDistance]){
			allDistances[userDistance] = 1; 
			count++;
		}	
		else{
			allDistances[userDistance] += 1;//just for logging
		}		
	}
	for (var i in allDistances) {
		var option = document.createElement("option");
		option.text = i + " miles";
		option.value = i;
		dropdown.add(option);
	}
}

search_btn.addEventListener("click",function(){
	FindUsersWithinRange();
});

function FindUsersWithinRange(){	
	//clear div
	divSelect.innerText = "";
	var selection = mlselect.options[mlselect.selectedIndex].value; 
	var resultindex = GetAllUserWithinDistanceRange(selection);
	var h2 = document.createElement("h2");
	h2.innerText = resultindex.length + " " + "Within specified radius or within" + " " + withinlondon  + " " +  " Miles of London"
	divSelect.appendChild(h2);
	if(!resultindex.length < 1){
		for(var i = 0; i < resultindex.length; i++){
			var resName = createElements("Name: ", resultindex[i].first_name + " " + resultindex[i].last_name);
			divSelect.appendChild(resName);
			var resEmail = createElements("Email: ", resultindex[i].email);
			divSelect.appendChild(resEmail);
			var resDistance = createElements("Distance: ", resultindex[i].distance_from_london.toFixed(2));
			divSelect.appendChild(resDistance);
			var hr = document.createElement("hr");
			divSelect.appendChild(hr);
		}
	}else{
		loading_title.innerText = "No Results found";
	}
	
}
function createElements(title,result){
	    var p = document.createElement("p");
		var strong = document.createElement("strong");
		var span = document.createElement("span");
		strong.innerText = title ;
		p.appendChild(strong);
		span.innerText = result;
		p.appendChild(span);
		return p;
}