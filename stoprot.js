var n = 0;
var current = 0;
function startrot(speed = 7000) {
    n = $(".stop").length;

    // only show first stop
    $(".stop").eq(current).show("slow");
    for(i = 1; i < n; i++) {
        $(".stop").eq(i).hide("slow");
    }

    setInterval(function() {
        $(".stop").eq(current).slideToggle("slow");
        $(".stop").eq((current + 1) % n).slideToggle("slow");
        current = (current + 1) % n;
    }, speed);
}

startrot();
