var n = 0;
var current = 0;
function startrot(speed = 7000) {
    n = $(".stop").length;

    // only show first stop
    $(".stop").eq(current).show();
    for(i = 1; i < n; i++) {
        $(".stop").eq(i).hide();
    }

    setInterval(function() {
        $(".stop").eq(current).hide();
        $(".stop").eq((current + 1) % n).show();
        current = (current + 1) % n;
    }, speed);
}

startrot();
