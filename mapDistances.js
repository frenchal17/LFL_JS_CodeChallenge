//Store 7 predetermined locations
var locations = [
    "Times Square, Manhattan, NY 10036",
    "Mount Rushmore, 13000 S Dakota 244, Keystone, SD 57751",
    "White House, 1600 Pennsylvania Ave NW, Washington, DC 20500",
    "Golden Gate Bridge, San Francisco, CA 94129",
    "Stonehenge, A344, Amesbury, Wiltshire SP47DE, United Kingdom",
    "Great Wall of China",
    "Hollywood Sign, Los Angeles, CA"
];

//Globals to be used by initMap() and geocodeAddress()
var locDictionary = [];  //Package all information into 2-dimensional array w/ locations as keys
var infoWindow;
var statMarkWindow;
var markers = [];   //Keep track of predetermined locations' markers for infoWindow addition

//Function:       initMap()
//Parameters:     None
//Preconditions:  Window has been loaded (to ensure script src has been loaded)
//Postconditions: Google map ('map') and geocoder ('geocoder') initialized
//                Markers placed on all predetermined locations, saved in markers array
window.onload = function initMap() {
    
    var mapDiv = document.getElementById('map');
    //Instantiate map object zoomed out and centered over Algeria to show nearly complete world map
    var map = new google.maps.Map(mapDiv, {
        center: {lat: 28.00, lng: 2.000},
        zoom: 2
    });
    
    var marker;
    var geocoder = new google.maps.Geocoder();
    infoWindow = new google.maps.InfoWindow({
        content: "placeholder"
    });
    statMarkWindow = new google.maps.InfoWindow({
	content: "placeholder"
    });
    
    //Create and save markers for all addresses in locations[]
    for (var i in locations) {
	
        //Encase asynchronous geocode method within anonymous function to save 'i' counter
        (function (counter) {
            geocoder.geocode({'address': locations[counter]}, function(results, status) {
                marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    title: locations[counter],
                    animation: google.maps.Animation.DROP,
                    address: locations[counter]
                })
                markers[locations[counter]] = marker;
            })
        })(i);
    }

    document.getElementById('submit').addEventListener('click', function(){
        geocodeAddress(geocoder, map);
    });
}

//Function:       geocodeAddress()
//Parameters:     geocoder ('geocoder'), resultsMap ('map')
//Preconditions:  ElementById 'submit' clicked, geocoder and resultsMap were correctly
//                initialized
//                Supplied address must be valid
//Postconditions: Creates new marker at address' geocoded location, adds to markers array
//                Adds click event to all static markers; upon click, opens infoWindow above
//                static marker showing number in order of proximity to dynamic marker
//                Prints locations' order of proximity to input address below Google Map
function geocodeAddress(geocoder, resultsMap) {
    statMarkWindow.close();
    var address = document.getElementById('address').value;
    
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
	    if (!markers[7]){
	        //Initialize dynamic marker
	        marker = new google.maps.Marker({
                    map: resultsMap,
                    position: results[0].geometry.location,
                    animation: google.maps.Animation.DROP
                });
                markers[7] = marker;
            } else {
	        //Change marker position to reflect new input
                markers[7].setPosition(results[0].geometry.location);
            }
	    
	    //Display inputted address on dynamic marker
	    var html = "<div><h3>" + address + "</h3>";
	    infoWindow.setContent(html);
	    var newMark = markers[7];
	    infoWindow.open(resultsMap, markers[7]);

	    //Compute distance between dynamic marker and all established locations
	    for (var index in locations) {
	        var markerPosition = markers[locations[index]].getPosition();
	        var distance = (google.maps.geometry.spherical.computeDistanceBetween(
	            markers[7].getPosition(), markerPosition) / 1000).toFixed(2);
	        var temp = new Array(locations[index], distance);
	        locDictionary[index] = temp;
	    }

	    //Sort distances in ascending numerical order
	    locDictionary.sort(function(a, b) {
	        return parseFloat(a[1] - b[1]);
	    });

  	    var element = document.getElementById("panel-left");
	    //Reset info panel if panel has content
	    if (element.hasChildNodes()){
	        while (element.firstChild){ element.removeChild(element.firstChild); }
 	    }

	    var header = document.createElement("h4");
	    var headText = document.createTextNode("List of Given Addresses by Coordinate Proximity");
	    header.appendChild(headText);
	    element.appendChild(header);

	    //Add infoWindows to all static markers, attached to mouse click event
	    for (var i in locDictionary) {
	        orderProximity = parseInt(i) + 1;
	        var tempMarker = markers[locDictionary[i][0]];
	        tempMarker.html = "<div><h3>" + orderProximity + "</h3>";
	        google.maps.event.addListener(tempMarker, 'click', function (){

	            statMarkWindow.setContent(this.html);
	            statMarkWindow.open(resultsMap, this);
	        });

	        //Print sorted locations in left panel
	        var htmlBody = document.createElement("p");
	        var htmlBodyText = document.createTextNode(orderProximity + ": " + locDictionary[i][0]);
	        htmlBody.appendChild(htmlBodyText);
	        element.appendChild(htmlBody);
	    } 
	} else {
	    alert('Geocode was not successful for the following reason: ' + status);
	}
    });
}
