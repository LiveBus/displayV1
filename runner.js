// TODO: Get stops based on long and lat
var get_stops = function(longitude=42.39, latitude=71.12) {
    return [new Stop(110), new Stop(2316), new Stop(2451)];
}

// Sends and waits for requests before updating #run
//setInterval(function() {
//    for(i in stops) {
//        stops[i].update(post);
//    }
//}, 20000);

// Post data
//var post_all = function() {
//    var run_html = "";
//    for(i in stops) {
//        console.log("posting " + i);
//        run_html += "<div class=\"stop\" id=\"" + stops[i].stopID + "\">" + stops[i].get_predictions() + "</div>";
//    }
//    $("#run").html(run_html);
//};

var set_post_stop_func = function(index) {
    stops[index].update_handler = function() {
        $("#" + stops[index].stopID).html(stops[index].get_predictions());
        console.log("posting " + index);
    }
}

var add_stop = function(id) {
    var run_html = $("#run").html();
    run_html += "<div class=\"stop\" id=\"" + id + "\"></div>";
    $("#run").html(run_html);
}

var stops = get_stops();
for(i in stops) {
    // Initialize each stop
    add_stop(stops[i].stopID);
    set_post_stop_func(i);
    stops[i].init();
}

window.onerror = function (msg, url, lineNo, columnNo, error) {
      // ... handle error ...
    console.log(Error.prototype.stack);
    console.log(stops);
    return false;
}
