var state = "set";

cookieInit();
add_input_listner();

function add_input_listner() {
    $("input").on("input", function() {
        $("input").each(function(index) {
            setCookie("stop" + index, this.value, 1);
            console.log(getCookie("stop" + index));
        });
    });
}

$("#add_stop").on("click", function() {
    $("form").append("<input type=number></input>");
    add_input_listner();
});

//$("body").on("click", function() {
//    if(state == "set") {
//        state = "run";
//        $("#set").hide("slow");
//        $("#run").show("slow");
//        init_all_stops();
//    }
//    else if (state == "run") {
//        state = "set";
//        $("#run").hide("slow");
//        $("#set").show("slow");
//    }
//});

//$("#start_run").on("click", function() {
//    state = "run";
//    $("#set").hide("slow");
//    $("#run").show("slow");
//    init_all_stops();
//});

//$("#stop_run").on("click", function() {
//    state = "set";
//    $("#run").hide("slow");
//    $("#set").show("slow");
//    console.log("stop run clicked");
//});

//function run_to_set() {
//    state = "set";
//    $("#run").hide("slow");
//    $("#set").show("slow");
//}

function cookieInit() {
    for(var i = 0; getCookie("stop" + i); i++) {
        $("form").append("<input type=number value=" + getCookie("stop" + i) + "></input>");
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
