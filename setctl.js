var state = "set";

cookieInit();
add_input_listner();

function add_input_listner() {
    $("input").on("input", function() {
        $("input").each(function(index) {
            setCookie("stop" + index, this.value, 1000); // 1000 days
            console.log(getCookie("stop" + index));
        });
    });
}

$("#add_stop").on("click", function() {
    $("form").append("<input type=number></input>");
    add_input_listner();
});

function cookieInit() {
    for(var i = 0; getCookie("stop" + i); i++) {
        $("form").append("<input type=number value=" + getCookie("stop" + i) + "></input>");
    }
}

