var url_base = "https://api-v3.mbta.com/"; 
var api_key = "f1c9a9fe82734f6c947ec7caf7bde669";

// Constructor
function Stop(stopID) {
    this.stopID = stopID;
    this.requests = {};
    this.pending = {};
    this.affix = "<div id=\"SchedNote\">*Scheduled Arrivals</div>"
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

    var now = new Date();
    // Get prediction data
    this.send_json("schedules", "?include=prediction&page[limit]=100&filter[stop]=");
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

// null -> No Predictions
// 1+   -> [1+] mins
// 0-   -> Arriving
// Adds * for scheduled times
function predf(val) {
    var disp = "";
    if(val == undefined) {
        return "No Predictions";
    }
    if(val.time > 1)
        disp += val.time + " mins";
    else
        disp += "Arriving";
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

    // Sort predictions/schedules into routes
    var now = new Date();
    for(var i = 0; i < this["schedules"].length; i++) {
        var p = this["schedules"][i];
        var type = "schedule";
        for(var j = 0; "schedules_inc" in this && j < this["schedules_inc"].length; j++) {
            q = this["schedules_inc"][j];
            if(p.relationships.trip.data.id == q.relationships.trip.data.id) {
                p=q;
                type = "prediction";
            }
        }
        pred[p.relationships.route.data.id].push(
            {"time":Math.floor((new Date((p.attributes.departure_time == null ? p.attributes.arrival_time : p.attributes.departure_time)) - now)/60000),
             "type":type
            });
    }

    // Sort each route's predictions
    for(var key in pred) {
        pred[key] = pred[key].filter(function(val, i, arr) {return val.time > 0;});
        pred[key] = pred[key].sort(function(a, b){return a.time-b.time;});
    }
    console.log(pred);

    // htmlify the predictions
    var html = "<h2 class=\"stoptitle\">" + this["stops"].attributes.name + "</h2><p>stop ID: " + this.stopID + "</p><ul>";
    for(key in pred) {
        var dest = outbound[key] + " <--> " + inbound[key];
	    if(this.stopID in hard_ids) {
            dest = (hard_ids[this.stopID][key] == 0) ? outbound[key] : inbound[key];
        }
        html += "<div class=\"bus\"><li><h1 class=\"busnum\">" + key + "</h1><div class=\"busdest\">" + dest + "</div></li><ul>";
        // add n predictions/scheduled arrivals
        for(var i = 0; i == 0 || (i < n && i < pred[key].length); i++) {
            html += "<li class=\"buspred\">" + predf(pred[key][i]) + "</li>";
        }
        html += "</ul></div>";
    }
    html += "</ul>";

    html += this.affix;

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
