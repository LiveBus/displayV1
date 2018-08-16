function showTime(){
    var date = new Date();
    var hour = date.getHours(); // 0 - 23
    var min = date.getMinutes(); // 0 - 59
    var day = date.getDate(); // 0 - 31
    var month = date.getMonth() + 1; // 1 - 12
    var session = "AM";
    
    if(hour == 0){
        hour = 12;
    }
    
    if(hour > 12){
        hour = hour - 12;
        session = "PM";
    }

    min = (min < 10) ? "0" + min : min;

    var time = hour + ":" + min + " " + session + " " + month + "/" + day;
    document.getElementById("MyClockDisplay").innerText = time;
    document.getElementById("MyClockDisplay").textContent = time;
    
    setTimeout(showTime, 1000);
}

showTime();
