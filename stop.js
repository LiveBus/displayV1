var url_base = "https://api-v3.mbta.com/"; 
var api_key = "f1c9a9fe82734f6c947ec7caf7bde669";

// Constructor
function Stop(stopID) {
    this.stopID = stopID;
    this.requests = {};
    this.pending = {};
}

Stop.prototype.init = function() {
    this.update_static();
    this.update();
}

// update the static data (stop title, routes, etc)
Stop.prototype.update_static = function() {
    // Get route data
    this.send_json("routes", "?include=stop&filter[stop]=");

    // Get general stop data
    this.send_json("stops", "/");

    // Get schedules through stop
    //this.send_json("schedules");
}

// update the dynamic data (predictions, alerts, etc)
Stop.prototype.update_dynamic = function() {
    console.log("updating stop: " + this.stopID);

    // Get prediction data
    this.send_json("predictions", "?include=schedule&filter[stop]=");
}

// General JSON reqest send -- searches for stopID
// name must be the first string in the url (routes, predictions, etc)
// filter can be left blank, or "/", etc
// Adds "name: [json response]" as attribute to object
Stop.prototype.send_json = function(name, filter = "?filter[stop]=") {
    // Clone this for use within JSON request
    var cthis = this;

    // Add to pending list
    cthis.pending[name] = true;

    var url = url_base + name + filter + this.stopID;
    if(filter.indexOf("?") == -1) {
        url += "?api_key=" + api_key;
    }
    else {
        url += "&api_key=" + api_key;
    }

    console.log(url);
    // Send request and add to requests list
    cthis.requests[name] = $.getJSON(
            url,
            function(data) {
                cthis[name] = data.data;
                if('included' in data) {
                    cthis[name + "_inc"] = data.included;
                }
            }
            )
        .always(function() {
            cthis.pending[name] = false;
        });
}

// Checks if all of the requests are done
Stop.prototype.requests_done = function() {
    for(var req in this.pending) {
        if(this.pending[req]) {
            return false;
        }
    }
    console.log("updated stop " + this.stopID + " (" + (new Date()) + ")");
    return true;
}

// Get the title from the already pulled data
// Stop.prototype.get_title = function() {
//     return this["stops"].attributes.name;
// }

// null -> No Predictions
// 1- -> Boarding
// 0  -> Arriving
// 1  -> Approaching
// 2+ -> 2+ mins
function predf(val) {
    var disp = "";
    if(val == undefined) {
        return "No Predictions";
    }
    switch(val.time) {
        case 0:
            disp += "Arriving";
            break;
        case 1:
            disp += "Approaching";
            break;
        default:
            if(val.time > 1)
                disp += val.time + " mins";
            else
                disp += "Boarding";
            break; 
    }
    if(val.type == "schedule") {
        disp += "*";
    }
    return disp;
}

// Get the predictions in html list format from already pulled data
Stop.prototype.get_predictions = function(n=3) {
    var pred = {};

    // Get all of the routes
    for(var i = 0; i < this["routes"].length; i++) {
        pred[this["routes"][i].attributes.short_name] = [];
    }

    // Sort predictions into routes
    var now = new Date();
    for(var i = 0; i < this["predictions"].length; i++) {
        var p = this["predictions"][i];
        pred[p.relationships.route.data.id].push(
            {"time":Math.floor((new Date((p.attributes.departure_time == null ? p.attributes.arrival_time : p.attributes.departure_time)) - now)/60000),
             "type":"prediction"
            });
    }
    for(var i = 0; i < this["predictions_inc"].length; i++) {
        var p = this["predictions_inc"][i];
        pred[p.relationships.route.data.id].push(
            {"time":Math.floor((new Date((p.attributes.departure_time == null ? p.attributes.arrival_time : p.attributes.departure_time)) - now)/60000),
             "type":"schedule"
            });
    }

    // Sort each route's predictions
    for(var key in pred) {
        pred[key] = pred[key].sort(function(a, b){return a.time-b.time});
    }
    console.log(pred);

    // htmlify the predictions
    var html = "<h2 class=\"stoptitle\">" + this["stops"].attributes.name + "</h2><p>stop ID: " + this.stopID + "</p><ul>";
    for(key in pred) {
        html += "<div class=\"bus\"><li><h1 class=\"busnum\">" + key + "</h1><div class=\"busdest\">" + outbound[key] + " - " + inbound[key] + "</div></li><ul>";
        // up to n busses
        for(var i = 0; i == 0 || (i < n && i < pred[key].length); i++) {
            html += "<li class=\"buspred\">" + predf(pred[key][i]) + "</li>";
        }
        html += "</ul></div>";
    }
    html += "</ul>";

    return html;
}

// Update handler
Stop.prototype.update_handler = function() {
    console.log("unhandled update");
}

// Update and run function when done
Stop.prototype.update = function(t=10) {
    this.update_dynamic();
    clearInterval(this.interval);
    var cthis = this;
    this.interval = setInterval(function () {
        if(cthis.requests_done()) {
            clearInterval(cthis.interval);
            cthis.update_handler();
        }
    }, t);
}
