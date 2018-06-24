// TODO: Get stops based on long and lat
var get_stops = function(longitude=42.39, latitude=71.12) {
    return [new Stop(110), new Stop(2316), new Stop(2451)];
}

var stops = get_stops();
for(i in stops) {
    // Initialize each stop
    stops[i].init();
}

// Sends and waits for requests before updating #run
var intervals = [];
setInterval(function() {
    for(i in stops) {
        stops[i].update(post);
    }
}, 5000);

// Post data
var post = function() {
    var run_html = "";
    for(i in stops) {
        run_html += "<div class=\"stop\" id=\"" + stops[i].stopID + "\">" + stops[i].get_predictions() + "</div>";
    }
    $("#run").html(run_html);
};

