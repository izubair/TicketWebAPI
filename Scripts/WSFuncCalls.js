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

            if (json.parcel == null || json.parcel == "" || json.parcel == undefined) {
                addrObj.address = "";
            }
            else {
                addrObj.address = json.parcel;
            }
        })
        // Code to run if the request fails; the raw request and
        // status codes are passed to the function
        .fail(function (xhr, status, errorThrown) {
            addrObj.address = "";
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
    GetParcelAddress(addrData.parcel, addrObj);
    if (addrObj.address != "" && addrObj.address != "0")
    {
        var resultObj = { lat: 0, lon: 0 };
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

function ServiceRequestClick() {
    CheckAndNavigate("Location.html");
}

function AskQClick() {
    CheckAndNavigate("CreateTicket.html?Type=2");
}

function MapTicketsClick() {
    CheckAndNavigate("MapTickets.html?MapType=1");
}

function CheckAndNavigate(pageURL) {
    //>>>>>>>>>>>>>>>>>
    // Check if user is logged in before navigating to the page below. If not logged in show message to user 
    // that they need to login to access this feature
    var loggedInUser = "";
    if (localStorage) {
        loggedInUser = localStorage.getItem('loggedInUser');        
    }

    if (loggedInUser != null && loggedInUser != "") {
        window.location.replace(pageURL);
    }
    else {
        alert("You must be logged in to use this feature!");
    }

    /*

    FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
            // the user is logged in and has authenticated your
            // app, and response.authResponse supplies
            // the user's ID, a valid access token, a signed
            // request, and the time the access token 
            // and signed request each expire
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;
            // Allow user to navigate
            window.location.replace(pageURL);
        } else if (response.status === 'not_authorized') {
            // the user must go through the login flow
            // to authorize your app or renew authorization
            alert("You must be logged in to use this feature!");
        } else {
            // the user isn't logged in to Facebook.
            alert("You must be logged in to use this feature!");
        }
    });
    */

   
}

////////////// FACEBOOK LOGIN FUNCTIONS -- NEED TO MOVE IN SEPARATE SCRIPT FILE ////////////////////////////
// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        if ($("#labelUser")[0].innerHTML != null && $("#labelUser")[0].innerHTML != "") {
            btnLogoutClick();
            //window.location.replace("index.html" + "?loggedInUser=" + "");
            return;
        }
        testAPI();
    } else {
        // Log the person in
        FB.login(function (response) {
            if (response.status === 'connected') {
                // Logged into your app and Facebook.
                testAPI();
            }
        });
    }
}

function checkLoginState() {

    FB.getLoginStatus(function (response) {
        statusChangeCallback(response);
    });
}

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
    
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function (response) {
        console.log('Successful login for: ' + response.name);
        //document.getElementById('status').innerHTML =
        //    'Thanks for logging in, ' + response.name + '!';
        loggedInUser = response.name;
        if (localStorage) {
            localStorage.setItem('loggedInUser', loggedInUser);
            localStorage.setItem('SocialLogin', 'Facebook');
        }
        window.location.replace("index.html");
        
        $(".close").click();

    });
}

function btnLogoutClick() {    
    // Signing out from Twitter is not possible as Twitter holds the cookie but we can
    // direct user to Twitter Logout page if they want to logout of twitter as well
    var socialLogin = '';
    if (localStorage) {
        localStorage.setItem('loggedInUser', "");
        socialLogin = localStorage.getItem('SocialLogin');
    }


    if (socialLogin != null && socialLogin == 'Twitter') {
        localStorage.setItem('TwitterLogin', "");
        window.location.replace("http://twitter.com/logout"); 
    }
    else if (socialLogin != null && socialLogin == 'Facebook')
    {
        FB.getLoginStatus(function (response) {
            if (response.status === 'connected') {
                // the user is logged in and has authenticated your
                // app, and response.authResponse supplies
                // the user's ID, a valid access token, a signed
                // request, and the time the access token 
                // and signed request each expire
                var uid = response.authResponse.userID;
                var accessToken = response.authResponse.accessToken;
                FB.logout(function (response) {
                    // user is now logged out
                    if (localStorage) {
                        localStorage.setItem('loggedInUser', "");
                    }
                    window.location.replace("index.html");
                    //document.getElementById('status').innerHTML =
                    //    'Please login';
                });

            } else if (response.status === 'not_authorized') {
                if (localStorage) {
                    localStorage.setItem('loggedInUser', "");
                }
                window.location.replace("index.html");
                // the user must go through the login flow
                // to authorize your app or renew authorization
                //alert("You must be logged in to use this feature!");
            } else {
                if (localStorage) {
                    localStorage.setItem('loggedInUser', "");
                }
                window.location.replace("index.html");
                //window.location.replace("index.html" + "?loggedInUser=" + "");
                // the user isn't logged in to Facebook.
                //alert("You must be logged in to use this feature!");
            }
        });
    }
    else if (socialLogin != null && socialLogin == 'Google') {
        signOutFromGoogle();
        window.location.replace("index.html");
    }
    else if (socialLogin != null && socialLogin == 'LinkedIn') {
        IN.User.logout(logoutCallbackFunction);
       
    }
    else if (socialLogin != null && socialLogin == 'Auth0') {
        if (localStorage) {
            localStorage.setItem('loggedInUser', "");
            localStorage.setItem('SocialLogin', "");
            window.location.replace("index.html");
        }

    }
    
    
    
    
}


function bodyOnLoad() {
    //var urlParams = new URLSearchParams(window.location.search);
    var loggedInUser = "";
    var socialLogin = "";
    if (localStorage) {
        loggedInUser = localStorage.getItem('loggedInUser');
        socialLogin  = localStorage.getItem('SocialLogin');
    }
    if (loggedInUser == null || loggedInUser == "") {
        if (socialLogin === "Auth0") {            
            OnAuth0Success();
        }
        else
        {
            $("#linkLogIn").css("display", "block");
            $("#labelUser")[0].innerHTML = loggedInUser;
            $("#linkLogOut").css("display", "none");
        }         
    }
    else {
        $("#linkLogIn").css("display", "none");
        $("#labelUser")[0].innerHTML = loggedInUser;
        $("#linkLogOut").css("display", "block");
    }
}
// Google Sign-In
var googleUser = {};
var startApp = function () {
    gapi.load('auth2', function () {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
            client_id: '566474426971-mht09gi6ev2hjsmnkmpe12feutf17ne7.apps.googleusercontent.com',
            cookiepolicy: 'single_host_origin',
            // Request scopes in addition to 'profile' and 'email'
            //scope: 'additional_scope'
        });
        attachSignin(document.getElementById('customBtn'));
    });
};

function attachSignin(element) {
    console.log(element.id);
    
    auth2.attachClickHandler(element, {prompt: 'select_account'}, // this param option shows user login screen
        function (googleUser) {            
            loggedInUser = googleUser.getBasicProfile().getName();
            if (localStorage) {
                localStorage.setItem('loggedInUser', loggedInUser);                
                localStorage.setItem('SocialLogin', 'Google');                
            }
            window.location.replace("index.html");
        }, function (error) {
            alert(JSON.stringify(error, undefined, 2));
        });
}

function signOutFromGoogle() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
        if (localStorage) {
            localStorage.setItem('loggedInUser', "");
        }
    });
}

function TwitterLoginFunc() {
    $.ajax({
        url: 'api/SocialLogin/TwitterAuth',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");

            window.location.replace(data);
            //subItems = "<option value='" + 0 + "'>" + "Select Item" + "</option>";
           
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}

function TwitterAuthenticate(oauthData) {
    $.ajax({
        url: 'api/SocialLogin/TwitterCallbackFunc',
        type: 'POST',
        data: JSON.stringify(oauthData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (data != null && data != "") {
                //alert(data.ScreenName);
                loggedInUser = data.ScreenName;
                if (localStorage) {
                    localStorage.setItem('loggedInUser', loggedInUser);
                    localStorage.setItem('SocialLogin', 'Twitter');
                }
                window.location.replace("index.html");
                //var url = "Index.html"; //?" + queryStr;
                //window.location.href = url;
            }
            else {
                alert("Something went wrong in call to set ticket data");
            }
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}

// LinkedIn Login functions
function liAuth() {
    IN.User.authorize(function () {
    });
}

// Setup an event listener to make an API call once auth is complete
function onLinkedInLoad() {
    IN.Event.on(IN, "auth", getProfileData);
}

// Handle the successful return from the API call
function onSuccess(data) {
    console.log(data);
    // Set local data
    if (localStorage) {
        localStorage.setItem('loggedInUser', data.firstName + " " + data.lastName);
        localStorage.setItem('SocialLogin', 'LinkedIn');
    }
    // Have to use the code below as I can't redirect to index.html here as it will go into circular loading of this page
    if (localStorage) {
        loggedInUser = localStorage.getItem('loggedInUser');
    }
    if (loggedInUser == null || loggedInUser === "") {
        $("#linkLogIn").css("display", "block");
        $("#labelUser")[0].innerHTML = loggedInUser;
        $("#linkLogOut").css("display", "none");
    }
    else {
        $("#linkLogIn").css("display", "none");
        $("#labelUser")[0].innerHTML = loggedInUser;
        $("#linkLogOut").css("display", "block");  
        $('#login-modal').modal('hide');
    }
    
}

// Handle an error response from the API call
function onError(error) {
    console.log(error);
}

// Use the API call wrapper to request the member's basic profile data
function getProfileData() {
    IN.API.Raw("/people/~").result(onSuccess).error(onError);
}

function logoutCallbackFunction() {
    console.log("Logging out of LinkedIn!")
    if (localStorage) {
        localStorage.setItem('loggedInUser', "");
    }
    window.location.replace("index.html");
}

// Auth0 login
function Auth0LoginCall() {
    var RetURLData = {
        returnUrl: 'http://localhost:50728/index.html',
        dummy: ' '
    };
    
    $.ajax({
        url: 'api/Account/Login',
        type: 'POST',
        data: JSON.stringify(RetURLData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (data.UriStr != null) {

                if (localStorage) {
                    localStorage.setItem('loggedInUser', "");
                    localStorage.setItem('SocialLogin', 'Auth0');
                }
                
                window.location.replace(data.UriStr);

                //OnAuth0Success();
                //var url = "Index.html"; //?" + queryStr;
                //window.location.href = url;
            }
            else {
                alert("Something went wrong in call to Account/Login");
            }
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));

        }
    });
}

function OnAuth0Success() {
    $.ajax({
        url: 'api/Account/GetAuth0User',
        type: 'GET',
        //data: JSON.stringify(RetURLData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            if (data != null && data != "") {
                console.log(data);
                // Set local data
                if (localStorage) {
                    localStorage.setItem('loggedInUser', data);
                    localStorage.setItem('SocialLogin', 'Auth0');
                }
                // Have to use the code below as I can't redirect to index.html here as it will go into circular loading of this page
                if (localStorage) {
                    loggedInUser = localStorage.getItem('loggedInUser');
                }
                if (loggedInUser == null || loggedInUser === "") {
                    $("#linkLogIn").css("display", "block");
                    $("#labelUser")[0].innerHTML = loggedInUser;
                    $("#linkLogOut").css("display", "none");
                }
                else {
                    $("#linkLogIn").css("display", "none");
                    $("#labelUser")[0].innerHTML = loggedInUser;
                    $("#linkLogOut").css("display", "block");
                    $('#login-modal').modal('hide');
                }
                //window.location.replace(data);
                //var url = "Index.html"; //?" + queryStr;
                //window.location.href = url;
            }
            else {
                alert("Something went wrong in call to Account/Login");
                if (loggedInUser == null || loggedInUser === "") {
                    $("#linkLogIn").css("display", "block");
                    $("#labelUser")[0].innerHTML = loggedInUser;
                    $("#linkLogOut").css("display", "none");

                    if (localStorage) {
                        localStorage.setItem('SocialLogin', '');
                    }
                }
            }
        },
        error: function (xhr) {

            alert("Something went wrong, please try again" + JSON.stringify(xhr));
            if (loggedInUser == null || loggedInUser === "") {
                $("#linkLogIn").css("display", "block");
                $("#labelUser")[0].innerHTML = loggedInUser;
                $("#linkLogOut").css("display", "none");

                if (localStorage) {
                    
                    localStorage.setItem('SocialLogin', '');
                }
            }

        }
    });
}



function RemoveFileClick(evt) {
    var fileData = {
        ticID: "",
        fileName: evt.value,
        filePath: ""        
    };
    $.ajax({
        url: 'api/FileUpload/RemoveTicFile',
        type: 'POST',
        data: JSON.stringify(fileData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");
            if (data === "OK") {
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

function SubmitReplyClick() {
    url = "TicketsList.html?Mode=1";
    if (localStorage) {
        selTicketID = localStorage.getItem('TicketsList_TicID');
    }
    var repText = $('#reply').val();
    var replyData = {
        TicketId: selTicketID,
        ReplyText: repText
    };

    $.ajax({
        url: 'api/Tickets/SaveTicReply',
        type: 'POST',
        data: JSON.stringify(replyData),
        dataType: 'json',
        contentType: 'application/json',
        success: function (data) {
            //alert("AJAX success!");
            if (data === "OK") {
                window.location.href = url;
            }
            else {
                alert("Something went wrong in call to api/FileUpload/SaveTicReply");
            }

            //}
        },
        error: function (xhr) {

            alert("Something went wrong in call to api/FileUpload/SaveTicReply, please try again" + JSON.stringify(xhr));

        }
    });
}












				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				