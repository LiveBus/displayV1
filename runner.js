var stops = [];
var init_all_stops = function() {
    stops = get_stops();
    for(i in stops) {
        // Initialize each stop
        add_stop(stops[i].stopID);
        set_post_stop_func(i);
        stops[i].init();
    }
}

setInterval(function() {
    for(i in stops) {
        stops[i].update();
    }
    console.log("updated" + new Date());
},10000);

var get_stops = function() {
    var stoplist = [];
    $("input").each(function(index) {
        if(this.value != "")
            stoplist.push(new Stop(this.value));
    });
    console.log(stoplist);
    return stoplist;
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


//window.onerror = function (msg, url, lineNo, columnNo, Error) {
//      // ... handle error ...
//    console.log(Error.prototype.stack);
//    console.log(stops);
//    return false;
//}
