var jurisdictionList;
var map;
var ticketsMap;
var geocoder;
var marker = null;
var pin_marker = null;

var infowindow = null;

var markers = [];

var addrData = { lat: "", lon: "", addr: "", parcel: "", crossSt1: "", crossSt2: "", jurisdiction: "" };

// A function to create the marker and set up the event window function  
 function createMarker(latlng, name, html) {  
 var contentString = html; 
 var iconBase = '/Content/'; 
 var lv_marker = new google.maps.Marker({  
 position: latlng, 
// icon: {
//            path: google.maps.SymbolPath.FORWARD_OPEN_ARROW,
//            scale: 5
//          }, 
 icon: iconBase + 'orangearrow.png',
	
 map: map,  
 zIndex: Math.round(latlng.lat()*-100000)<<5  
 });  
  
 google.maps.event.addListener(lv_marker, 'click', function() {  
 infowindow.setContent(contentString);  
 infowindow.open(map,lv_marker);  
 });  
 google.maps.event.trigger(lv_marker, 'click');  
 return lv_marker;  
 }  

function initMap() {
		map = new google.maps.Map(document.getElementById('map-container'), {
			zoom: 16,
			center: {lat: 36.397, lng: -115.644}
		});
		
		infowindow = new google.maps.InfoWindow(
			{
				size: new google.maps.Size(150, 50)
			}
		);
		
		// Get the element with id="defaultOpen" and click on it
		document.getElementById("tabAddress").click();
		
		
		document.getElementById("AddressText").value = "7300 Patrick Lane, Las Vegas";
		var addressParam = document.getElementById("AddressText").value
		geocoder = new google.maps.Geocoder();   
		geocodeAddressToMap(geocoder, map, addressParam);
		jurisdictionList = ["CC Bunkerville", "CC Enterprise","CC Goodsprings","CC Indian Springs","CC Laughlin","CC Lone Mountain","CC Lower Kyle Canyon","CC Moapa","CC Moapa Valley","CC Mt. Charleston","CC Mtn. Springs","CC Nellis AFB","CC Paradise","CC Redrock","CC Sandy Valley","CC Searchlight","CC Spring Valley","CC Summerlin South","CC Sunrise Manor","CC Unincorporated","CC Whitney","CC Winchester"];

		google.maps.event.addListener(map, 'click', function() {  
		infowindow.close();  
		});  

		google.maps.event.addListener(map, 'click', function(event) {  
            var addrObj = { addr: "" };
            geocodeLatLngToAddress((event.latLng.lat()) + "", (event.latLng.lng()) + "", addrObj);

            /*
            var coords = { X: 0, Y: 0 };
			GetStatePlaneCoord(event.latLng.lat(), event.latLng.lng(), coords);
			//Check if within CC Jurisdiction
			var jurisObj = {juris: ""};
			GetJurisdication(coords.X, coords.Y, jurisObj);
			if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) {		
					//call function to create marker  
					//if (pin_marker) {  
					//pin_marker.setMap(null);  
					//pin_marker = null;  
					//}
					var parcelNoObj = {parcel: ""};
					PointToParcel(coords.X, coords.Y, parcelNoObj);
					//document.getElementById("Result2Text").value = "Lat: " + event.latLng.lat() + "\nLon: " + event.latLng.lng() + "\nParcel: " + parcelNoObj.parcel; 
					$('#ResultText').html("<b>" + "Latitude: " + "</b>" + event.latLng.lat() + "<br /><b>Longitude: </b>" + event.latLng.lng() + "<br /><b>Parcel: </b>" + parcelNoObj.parcel);
					
					var addrObj = {addr: ""};
					geocodeLatLngToAddress(event.latLng.lat(), event.latLng.lng(), addrObj);
					//pin_marker = createMarker(event.latLng, "name", "<b>Location</b><br>"+addrObj.addr); 
			}
			else
			{
				alert("This location is not within Clark County Jurisdiction");
			}
            */
        }); 


            $("#ParcelText").change(function (event) {
                //GetParcel();
                GetAddress();
            });
            $("#ParcelText").keydown(function (event) {
                if (event.keyCode == 13) {
                        GetAddress();
                    // To prevent default submission of form
                    event.preventDefault();
                    return false;
                }
            });

            $("#AddressText").change(function (event) {
                        GetParcel();
                    });
            $("#AddressText").keydown(function (event) {
                if (event.keyCode == 13) {
                        GetParcel();
                    // To prevent default submission of form
                    event.preventDefault();
                    return false;
                }
            });

            $("#CrossStreet2Text").change(function (event) {
                        GetAddressAndParcel();
                    });
            $("#CrossStreet2Text").keydown(function (event) {
                if (event.keyCode == 13) {
                        GetAddressAndParcel();
                    // To prevent default submission of form
                    event.preventDefault();
                    return false;
                }
            });	
            $("#BtnDone").click(function (event) {
                event.preventDefault(); // <------------------ stop default behaviour of button
                //alert("Btn Done clicked!"); 

                // process the input first
                $("#AddressText").change();
               
                setTicketData();

                // link to an action and send parameters 
                //var url = Url.Action("Tickets", "CreateTicket", filters);             
            });
           
            $("#BtnCancel").click(function (event) {
                event.preventDefault(); // <------------------ stop default behaviour of button
                //alert("Btn Cancel clicked!");           
                // On Cancel, just navigate to the main page                
                var url = "/Home/Index"; 
                window.location.href = url;                          

            });
 }
function setTicketData()
{ 
    var ticketData = {
        Latitude: addrData.lat,
        Longitude: addrData.lon,
        Address: addrData.addr,
        ParcelNo: addrData.parcel,
        CrossSt1: addrData.crossSt1,
        CrossSt2: addrData.crossSt2,
        Jurisdiction: addrData.jurisdiction
    };
    $.ajax({
        url: 'api/Tickets/SetTicketData',
        type: 'POST',
        data: JSON.stringify(ticketData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");
            if (data === "OK")
            {
                var url = "CreateTicket.html?Type=1"; //?" + queryStr;
                window.location.href = url;
            }
            else {
                alert("Something went wrong in call to set ticket data");
            }
            
            //}
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}
			
function geocodeAddressToMap(geocoder, resultsMap, addr) {
        //var address = document.getElementById('address').value;
				
				//var address = document.getElementById("InputAddressText").value
				
        geocoder.geocode({'address': addr}, function(results, status) {
          if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
						if(marker == null)
						{
							marker = new google.maps.Marker({
								map: resultsMap,
								position: results[0].geometry.location
							});
						}
						else{
							marker.setPosition(results[0].geometry.location); 
						}
          } else {
            alert('Geocode was not successful for the following reason: ' + status);
          }
        });
      }
			
function openTab(evt, tabName) {




    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
		if(tabName === "Parcel")
		{
			document.getElementById("ParcelText").focus();
		}
		else if(tabName === "Address")
		{
			document.getElementById("AddressText").focus();
		}
		else 
		{
			document.getElementById("CrossStreet1Text").focus();
		}
}

function GetStatePlaneCoord(lat, lon, coords){
	var dataStr = 'inSR=4326&outSR=3421&geometries=' + lon + '%2C' + lat + '&transformation=&transformForward=false&f=pjson';			
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/arcgis/rest/services/Utilities/Geometry/GeometryServer/project",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {		   
		//alert( "The request is complete! x: " + json.geometries[0].x + "y: " + json.geometries[0].y);														
		coords.X = json.geometries[0].x;
		coords.Y = json.geometries[0].y;
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};
function ParcelToPoint(parcelNo, coords)
{
	var dataStr = 'outputSpatialReferenceWkid=3421&parcel=' + parcelNo; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/ParcelToPoint",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.xCoordinate == null)
		{
			coords.X = '0';
		  coords.Y = '0';
		}
		else
		{	
			coords.X = json.xCoordinate;
		  coords.Y = json.yCoordinate;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function PointToParcel(x, y, parcelNoObj)
{
	var dataStr = 'xCoordinate=' + x + '&yCoordinate=' + y;
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/PointToParcel",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.parcel == null)
		{
			parcelNoObj.parcel = "";
		}
		else
		{	
			parcelNoObj.parcel = json.parcel;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function GetParcelAddress(parcelNo, addrObj)
{
    var dataStr = parcelNo;
    $.ajax({
        type: "GET",
        // The URL for the request
        url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/GetParcelAddress",
        async: false,
        // The data to send 
        data: dataStr,
        // The type of data we expect back
        dataType: "json",
    })
        // Code to run if the request succeeds (is done);
        // The response is passed to the function
        .done(function (json) {
            //alert( "The request is complete!" + json.jurisdiction);	

            if (json == null) {
                addrObj.address = "";
            }
            else {
                addrObj.address = json.parcel;
            }
        })
        // Code to run if the request fails; the raw request and
        // status codes are passed to the function
        .fail(function (xhr, status, errorThrown) {
            alert("Sorry, there was a problem!");
            console.log("Error: " + errorThrown);
            console.log("Status: " + status);
            console.dir(xhr);
        })
        // Code to run regardless of success or failure;
        .always(function (xhr, status) {
            //alert( "The request is complete!" );
        });		
}

function CoordsFromCrossStreets(crossStreet1, crossStreet2, coords, locObj)
{
	var dataStr = 'street1=' + crossStreet1 + '&street2=' + crossStreet2;  
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/GetCrossStreets",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.length == 0 || json[0].X == null)
		{
			coords.X = '0';
		  coords.Y = '0';
			locObj.loc = '';
		}
		else
		{	
			coords.X = json[0].X;
		  coords.Y = json[0].Y;
			locObj.loc = json[0].fullstreetName1 + "and" + json[0].fullstreetName2;
			
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function LatLonFromCoords(x, y, LatLonObj)
{
	var dataStr = 'InputWkid=3421&outWkid=4326&xCoordinate=' + x + '&yCoordinate=' + y;
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/ProjectPoint",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.xCoordinate == null)
		{
			LatLonObj.lat = "";
			LatLonObj.lon = "";
		}
		else
		{	
			LatLonObj.lat = json.yCoordinate;
			LatLonObj.lon = json.xCoordinate;
		}
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
}

function GetJurisdication(x, y, jurObj)
{
	var dataStr = 'xCoordinate=' + x + '&yCoordinate=' + y + '&inputWKID= '; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/gismo/webservice/GISDataWCF/GISDataService.svc/jsonep/GetJurisdication",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.jurisdiction == null)
			jurObj.juris = "Unknown";
		else
			jurObj.juris = json.jurisdiction;																
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};
	
function GetStatePlaneCoordAndJurisd(lat, lon){
	var dataStr = 'inSR=4326&outSR=3421&geometries=' + lon + '%2C' + lat + '&transformation=&transformForward=false&f=pjson';			
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "http://gisgate.co.clark.nv.us/arcgis/rest/services/Utilities/Geometry/GeometryServer/project",
		async: false,
		// The data to send 
		data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {		   
		//alert( "The request is complete! x: " + json.geometries[0].x + "y: " + json.geometries[0].y);							
		GetJurisdicationFromCoords(json.geometries[0].x, json.geometries[0].y, lat, lon);					 
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};

function GetAddressFromGoogle(lat, lon, addressObj)
{
	var dataStr = "latlng=" + lat + "," + lon + "&key=" + APIKey; 
	var APIKey = "AIzaSyAxd-A5zjspi0czQ9JcBTN8W2xye2Zj6xI"; 
	$.ajax({
		type: "GET",
		// The URL for the request
		url: "https://maps.googleapis.com/maps/api/geocode/json" + dataStr,
		async: false,
		// The data to send 
		//data: dataStr,			
		// The type of data we expect back
		dataType : "json",
	})
	// Code to run if the request succeeds (is done);
	// The response is passed to the function
	.done(function( json ) {
		//alert( "The request is complete!" + json.jurisdiction);	
		
		if(json.jurisdiction == null)
			addressObj.addr = "Unknown";
		else
			addressObj.addr = formatted_address;																
	})
	// Code to run if the request fails; the raw request and
	// status codes are passed to the function
	.fail(function( xhr, status, errorThrown ) {
		alert( "Sorry, there was a problem!" );
		console.log( "Error: " + errorThrown );
		console.log( "Status: " + status );
		console.dir( xhr );
	})
	// Code to run regardless of success or failure;
	.always(function( xhr, status ) {
		//alert( "The request is complete!" );
	});		
};
// The following function is called when user clicks on the map
function geocodeLatLngToAddress(lat, lon, addressObj) {
	var geocoder = new google.maps.Geocoder;  
    var latlng = { lat: parseFloat(lat), lng: parseFloat(lon) };
     //Get address from the lat/lng where user clicked. The address returned is normally the closest to the point
     // so it is not exactly at the clicked point and we need to get the parcel no for the returned address
    geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {
        
          addressObj.addr = results[0].formatted_address;
          // Now use this address to check jurisdiction and get parcel no
          var resultObj = { lat: 0, lon: 0 };
          geocodeAddress(addressObj.addr, resultObj, 1);
				
				document.getElementById("AddressText").value = addressObj.addr;					
				
				if (pin_marker) {  
					pin_marker.setMap(null);  
					pin_marker = null;  
					}
				pin_marker = createMarker(results[0].geometry.location, "name", "<b>Location</b><br>"+addressObj.addr); 
          
          // Force to show tab AddressToParcel, which shows the parcel for the clicked location
				document.getElementById("tabAddress").click();
				//geocodeAddressToMap(geocoder, map, addressObj.addr);
				//map.setZoom(16);
        
      } else {
        addressObj.addr = 'No results found';
				
      }
    } else {
      addressObj.addr = 'Geocoder failed due to: ' + status;
			
    }
  });
}

function geocodeLatLng(lat, lon, addressObj) {
	var geocoder = new google.maps.Geocoder;  
  var latlng = {lat: parseFloat(lat), lng: parseFloat(lon)};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === 'OK') {
      if (results[0]) {       
        addressObj.addr = results[0].formatted_address;
				
				//document.getElementById("ResultText").value = document.getElementById("ResultText").value + "\nAddress: " + addressObj.addr;
				$('#Result2Text').html($('#Result2Text').html() + "<br /><b>Address: </b>" + addressObj.addr);
				
				geocodeAddressToMap(geocoder, map, addressObj.addr);
				map.setZoom(16);
        
      } else {
        addressObj.addr = 'No results found';
				$('#Result2Text').html($('#Result2Text').html() + "<br /><b>Address: </b>" + addressObj.addr);
      }
    } else {
      addressObj.addr = 'Geocoder failed due to: ' + status;
			//document.getElementById("ResultText").value = document.getElementById("ResultText").value + "\nAddress: " + addressObj.addr;
			$('#Result2Text').html($('#Result2Text').html() + "<br /><b>Address: </b>" + addressObj.addr);
    }
  });
}

function geocodeAddress(address, resultObj, mapClick) {
    var geocoder = new google.maps.Geocoder;  
    var googleAddress = address;
    if (address.includes("Nevada") == false) {
        googleAddress = address + ", Nevada";
    }
    
	
    geocoder.geocode({ 'address': googleAddress}, function(results, status) {
		if (status === 'OK') {
			// Get the lat/lon for the provided address
			resultObj.lat = results[0].geometry.location.lat();
			resultObj.lon = results[0].geometry.location.lng();	
			
			var coords = {X:0,Y:0};
			GetStatePlaneCoord(resultObj.lat, resultObj.lon, coords);
			//Check if within CC Jurisdiction
			var jurisObj = {juris: ""};
			GetJurisdication(coords.X, coords.Y, jurisObj);
			if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) { 
				var parcelNoObj = {parcel: ""};
				PointToParcel(coords.X, coords.Y, parcelNoObj);
				//document.getElementById("Result2Text").value = "<b>" + "Latitude: " + "</b>" + resultObj.lat + "\nLongitude: " + resultObj.lon + "\nParcel: " + parcelNoObj.parcel; 
                $('#ResultText').html("<b>" + "Latitude: " + "</b>" + resultObj.lat + "<br /><b>Longitude: </b>" + resultObj.lon + "<br /><b>Parcel: </b>" + parcelNoObj.parcel + "<br /><b>Jurisdiction: </b>" + jurisObj.juris);

                addrData.parcel = parcelNoObj.parcel;
                addrData.lat = resultObj.lat;
                addrData.lon = resultObj.lon;               
                addrData.addr = address;
                addrData.crossSt1 = "";
                addrData.crossSt2 = "";
                addrData.jurisdiction = jurisObj.juris; 

                if (mapClick == 0) {
                    geocodeAddressToMap(geocoder, map, googleAddress);
                    map.setZoom(16);
                }
				
			}
			else{
				$('#ResultText').html("<b>Latitude: </b>" + resultObj.lat + "<br /><b>Longitude: </b>" + resultObj.lon + "<br /><b>Address: </b>" + address + " is within <i><u>" + jurisObj.juris + "</u></i>");
			}
		} 
		else {
			alert('Geocode was not successful for the following reason: ' + status);
		}
	});
}

function GetAddress()
{
    addrData.parcel = document.getElementById("ParcelText").value;
	var coords = {X:0,Y:0};
	var latlonObj = {lat:0,lon:0};
    var jurisObj = { juris: "" };
    var addrObj = { address: "" };
    // First try to get address direcly from GetParcelAddress web service
    GetParcelAddress(parcelNo, addrObj);
    if (addrObj.address != "" && addrObj.address != "0")
    {
        geocodeAddress(addrObj.address, resultObj, 0);
        return;
    }

    // If not valid address obtained from GetParcelAddress then try to get parcel point and use that
	//Get point from parcel
    ParcelToPoint(addrData.parcel, coords);
	//Check if within CC Jurisdiction
	GetJurisdication(coords.X, coords.Y, jurisObj);
	if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) { 

		// Convert state plane coordinates to lat, lon	
		LatLonFromCoords(coords.X, coords.Y, latlonObj);
		// Get address
		var addrObj = {addr: ""};
        geocodeLatLng(latlonObj.lat, latlonObj.lon, addrObj);

        addrData.lat = latlonObj.lat;
        addrData.lon = latlonObj.lon;
        addrData.addr = addrObj.addr;
        addrData.crossSt1 = "";
        addrData.crossSt2 = "";
        addrData.jurisdiction = jurisObj.juris; 
        // Assign to global 
		//GetAddressFromGoogle(latlonObj.lat, latlonObj.lon, addrObj);
		// display result
		//document.getElementById("ResultText").value = "X: " + coords.X + "\nY: " + coords.Y + "\nLatitude: " + latlonObj.lat + "\nLongitude: " + latlonObj.lon; 
        $('#Result2Text').html("<b>X: </b>" + coords.X + "<br /><b>Y: </b>" + coords.Y + "<br /><b>Latitude: </b>" + latlonObj.lat + "<br /><b>Longitude: </b>" + latlonObj.lon + "<br /><b>Jurisdiction: </b>" + jurisObj.juris);
	}
	else{
			$('#Result2Text').html("<b>ParcelNo: </b>" + parcelno + " is within <i><u>" + jurisObj.juris + "</i></u>");		
	}
}

function GetParcel()
{
    var address = document.getElementById("AddressText").value;		
    
	var resultObj = {lat:0,lon:0};
	geocodeAddress(address, resultObj, 0);
	
}

function GetAddressAndParcel()
{
	var coords = {X:0,Y:0};
	var jurisObj = {juris: ""};
	var latlonObj = {lat:0,lon:0};
	var locationObj = {loc: ""};
	
	var crossStreet1 = document.getElementById("CrossStreet1Text").value;
	var crossStreet2 = document.getElementById("CrossStreet2Text").value;
	CoordsFromCrossStreets(crossStreet1, crossStreet2, coords, locationObj);
	//Check if within CC Jurisdiction
	GetJurisdication(coords.X, coords.Y, jurisObj);
	if( jurisdictionList.indexOf(jurisObj.juris) > -1 ) { 

		// Convert state plane coordinates to lat, lon	
		LatLonFromCoords(coords.X, coords.Y, latlonObj);
		// Get address
		var addrObj = {addr: ""};
        geocodeLatLng(latlonObj.lat, latlonObj.lon, addrObj);
        var parcelNoObj = { parcel: "" };
        PointToParcel(coords.X, coords.Y, parcelNoObj);
		//GetAddressFromGoogle(latlonObj.lat, latlonObj.lon, addrObj);
		// display result
        //document.getElementById("ResultText").value = "X: " + coords.X + "\nY: " + coords.Y + "\nLatitude: " + latlonObj.lat + "\nLongitude: " + latlonObj.lon; 
        addrData.parcel = parcelNoObj.parcel;
        addrData.lat = latlonObj.lat;
        addrData.lon = latlonObj.lon;
        addrData.addr = addrObj.addr;
        addrData.crossSt1 = crossStreet1;
        addrData.crossSt2 = crossStreet2;
        addrData.jurisdiction = jurisObj.juris; 

        $('#Result1Text').html("<b>X: </b>" + coords.X + "<br /><b>Y: </b>" + coords.Y + "<br /><b>Latitude: </b>" + latlonObj.lat + "<br /><b>Longitude: </b>" + latlonObj.lon + "<br /><b>Location: </b>" + locationObj.loc + "<br /><b>Parcel No: </b>" + parcelNoObj.parcel + "<br /><b>Jurisdiction: </b>" + jurisObj.juris);
    }   
	else {
			$('#Result1Text').html("<b>Cross Streets: </b>" + crossStreet1 + " and " + crossStreet2 + " is within <i><u>" + jurisObj.juris + "</i></u>" + "<br /><b>Parcel No: </b>" + parcelNoObj.parcel);
	}
	
}

function getLocAddress()
{
    return document.getElementById("AddressText").value;
}

// FOR MapTickets.cshtml
/////////////////////////////////////
function initMapForTickets() {
    ticketsMap = new google.maps.Map(document.getElementById('ticketsmap-container'), {
        zoom: 11,
        center: { lat: 36.176546, lng: -115.151649 }
    });

    infowindow = new google.maps.InfoWindow(
        {
            size: new google.maps.Size(150, 50)
        }
    );

    document.getElementById("tabMap").click();
}
/////////////////////////////////////////
function openTab_MapTickets(evt, tabName) {
    
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";  
    
}
/////////////////////////////////////////
function removeMarkers() {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}
/////////////////////////////////////////
function addTicketMarkers(data) {    
    for (i = 0; i < data.length; i++) {
        var latLng = new google.maps.LatLng(data[i].Latitude, data[i].Longitude);
        // Creating a marker and putting it on the map        
        var marker = new google.maps.Marker({
            position: latLng,
            map: ticketsMap,
            title: data[i].Location
        });
        markers.push(marker);
    }
}
/////////////////////////////////////////
function formatItem(item) {
    //var markup = "<tr><td class='body-item mbr-fonts - style display-7'>" + item.TicketId + "</td><td class='body- item mbr- fonts - style display-7'>" + item.Subject + "</td><td class='body-item mbr-fonts - style display-7'>" + item.DateReported + "</td><td class='body-item mbr-fonts - style display-7'>" + item.IssueId + "</td></tr>";
    var markup = "<tr><td class='body-item mbr-fonts - style display-7'>" +
        "<label style='color:blue'>" + "TICKET ID: " + "</label>" +
        "<label class='lbl'>" + item.TicketId + "</label>" +
        "</br>" +
        "<label>" + "SUBJECT: " + "</label>" +
        "<label>" + item.Subject + "</label>" +
        "</br>" +
        "<label>" + "DATE REPORTED: " + "</label>" +
        "<label>" + item.DateReported + "</label>" +
        "</br>" +
        "<label>" + "ISSUE: " + "</label>" +
        "<label>" + item.IssueId + "</label>" +
        "</td></tr>";
    $("table tbody").append(markup);
}
/////////////////////////////////////////
function addTicketsToList(data)
{
    $("#tblTickets > tbody").html("");
    for (i = 0; i < data.length; i++) {
        
        formatItem(data[i]);
    }
}
/////////////////////////////////////
function getTicketData() {
    //alert("Change triggered!");  

    //data = getTicLatLng();
    //addTicketMarkers(data);
    
   
    $.ajax({
        url: 'api/Tickets/GetTicketsWithLoc',
        type: 'GET',
        //data: { id: IssueId },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");              
            addTicketMarkers(data);
            addTicketsToList(data);
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}
/////////////////////////////////////
function getLast5TicketsData() {
    //alert("Change triggered!");  

    $.ajax({
        url: 'api/Tickets/GetLast5TicketsWithLoc',
        type: 'GET',
        //data: { id: IssueId },
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");              
            addTicketMarkers(data);
            addTicketsToList(data);
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}
/////////////////////////////////////
function getIssues() {
    
    $.ajax({
        url: 'api/Tickets/GetIssues',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");
            //subItems = "<option value='" + 0 + "'>" + "Select Item" + "</option>";
            var subItems;
            for (i = 0; i < data.length; i++) {
                //$.each(data, function (index, item) {
                subItems += "<option value='" + data[i].IssueId + "'>" + data[i].Description + "</option>";
                //});
            }
            $("#selectIssue").html(subItems);
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}
/////////////////////////////////////////////////////
function openSearchFilter(evt, tabName)
{
    //$(".toggler").click();  
    openTab_MapTickets(evt, tabName);
}



				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				