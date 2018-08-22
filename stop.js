var url_base = "https://api-v3.mbta.com/"; 
var api_key = "f1c9a9fe82734f6c947ec7caf7bde669";
stopIDs = [];
var display = {};

for(var i = 0; getCookie("stop" + i); i++) {
    stopIDs.push(getCookie("stop" + i));
}

// Query ends in stopID, and adds api key
var send_json = function(query = "?filter[stop]=") {
    var ids = stopIDs[0];
    for(var i = 1; i < stopIDs.length; i++) {
        ids += "," + stopIDs[i];
    }
    var url = url_base + query + ids + "&api_key=" + api_key;
    console.log(url);
    // Send request and add to requests list
    $.getJSON(url, updateDOM);
}

// Deal with the response
var updateDOM = function(data) {
    console.log(data);

    var trip_dest = {};
    // Create display structure
    // pull stops
    for(var i = 0 ; i < data.included.length ; i++) {
        var inc = data.included[i];
        // create outer shell for stops
        if(inc.type == "stop") {
            display[inc.id] = 
                {
                    name: inc.attributes.name,
                    routes: []
                };
        }
        // map trip id's to headsigns
        else if(inc.type == "trip") {
            trip_dest[inc.id] = inc.attributes.headsign;
        }
        else { continue; }
        data.included.splice(i,1);
        i--;
    }
    var now = new Date();

    var all_arrivals = data.data.concat(data.included);

    // Process predictions
    for(var i = 0; i < all_arrivals.length; i++) {
        var pred = all_arrivals[i];
        // skip all of the schedules which alread 
        if("prediction" in pred.relationships &&  pred.relationships.prediction.data != null) {
            continue;
        }
        var stop = pred.relationships.stop.data.id;
        var dest = trip_dest[pred.relationships.trip.data.id];
        var route = pred.relationships.route.data.id;
        var type = pred.type;
        var time = (pred.attributes.stop_sequence == 1) ? pred.attributes.departure_time : pred.attributes.arrival_time;
        var d = new Date(time);
        // change time to a rounded number based on date d
        time = Math.floor((d - now) / 60 / 1000);

        var found = false;
        // iterate through display[stop].routes to find if the route exists
        for(var j = 0; j < display[stop].routes.length; j++) {
            var elem = display[stop].routes[j];
            if(elem.dest == dest && elem.route == route) {
                var k = 0;
                while(k < display[stop].routes[j].arrive.length && time > display[stop].routes[j].arrive[k][0]) k++;
                display[stop].routes[j].arrive.splice(k,0,[time,type]);
                found = true;
                break;
            }
        }
        if(!found) {
            display[stop].routes.push({
                "dest": dest,
                "route": route,
                "arrive": [[time,type]]});
        }
    }
    console.log(display);
    htmlify(display);
}

var htmlify = function(display) {
    var html = "";
    html += "<div id=\"MyClockDisplay\" class=\"clock\">" + $("#MyClockDisplay").html() + "</div>";
    for(var stopID in display) {
        html += "<div id=\"" + stopID + "\" class=\"stop\">\<h2 class=\"stoptitle\">" + display[stopID].name + "</h2><p>stop ID: " + stopID + "</p><ul>";
        for(var i = 0; i < display[stopID].routes.length ; i++) {
            var route = display[stopID].routes[i];
            html += "<ul><div class=\"bus\"><li><h1 class=\"busnum\">" + route.route + "</h1>" + "<div class=\"busdest\">" + route.dest + "</div></li><ul>";
            for(var j = 0; j < 3 && j < route.arrive.length; j++) {
                var time = route.arrive[j][0];
                var text = (time < 2) ? "Arriving" : time + " mins";
                text += (route.arrive[j][1] == "schedule") ? "*" : "";
                html += "<li class=\"buspred\">" + text + "</li>";
            }
            html += "</ul></div>";
        }
        html +="</div>";
    }
    html += "</ul><div id=\"SchedNote\">*Scheduled Arrivals</div></div>";

    // update the display
    $("#run").html(html);
    disp_current();
}

// Put together the request
var update_data = function() {
    var now = new Date();
    var h = now.getHours();
    var m = now.getMinutes();
    function pad(str) { return (str + "").padStart(2,'0');}
    if(h < 3) // new service day hasn't started
        h += 24;

    var min = pad(h) + ":" + pad(m);
    // Set number of predictions taken here
    var max = pad(h + 3) + ":" + pad(m);

    send_json("schedules?include=prediction,stop,trip&filter[min_time]=" + min + "&filter[max_time]=" + max + "&filter[stop]=");
}

update_data();
setInterval(update_data, 10000);

// Stop Rotation
var current = 0;
function disp_current() {
    $(".stop").hide();
    $(".stop:eq(" + current + ")").show();
}
setInterval(function() {current++; current %= stopIDs.length; disp_current()}, 7000);
