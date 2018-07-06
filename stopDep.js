// DEPRICATED -- it works, but is not dynamic enough
function Stop(id, stopNum) {
  this.id = id;
  this.stopNum = stopNum;
  this.title = "untitled";
  this.predictions = {};
  this.stringified = "";
  this.loaded_stops = false;
  this.wait;
  this.postTitle  = function(title) {$("#stop" + this.stopNum + ".title").html(title);};
  this.postPredictions = function(pred) {$("#stop" + this.stopNum + ".predictions").html(stop.stringify_predictions());}
};

// Create update as a method of the stop object
Stop.prototype.update = function() {
  this.update_title(this);
  this.update_predictions(this);
}

// updates the title attribute
Stop.prototype.update_title = function(stop) {
  // Gets Title of Stop
  $.getJSON("https://api-v3.mbta.com/stops/" + stop.id, function(data) {
    stop.title = data.data.attributes.name;
  })
    .fail(function() {
    stop.title = "title lookup failed (stop DNE or exceeded request limit)";
    log("title lookup fail");
  })
    .always(function() {
    stop.postTitle(stop.title);
  });
}

// updates the predictions attribute
Stop.prototype.update_predictions = function(stop) {
  stop.loaded_stops = false;
  stop.predictions = {};
  // gets all of the routes through the stop
  $.getJSON("https://api-v3.mbta.com/routes?filter[stop]=" + stop.id, function(data) {
    $.each(data.data, function(index) {
      var key = this.attributes.short_name;
      if(!stop.predictions[key]) {
        stop.predictions[key]=[];
      }
    });
  })
    .always(function() {
    stop.loaded_stops = true;
  });
  $.getJSON("https://api-v3.mbta.com/predictions?filter[stop]=" + stop.id, function(data) {
    $.each(data.data, function(index) {
      stop.predictions[this.relationships.route.data.id].push(Math.round((new Date((this.attributes.departure_time == null ? this.attributes.arrival_time : this.attributes.departure_time)) - new Date())/60000));
    });
    $.each(stop.predictions, function() {
      this.sort(function(a,b) {return a > b});
    });
  })
    .fail(function() {
    stop.predictions = "error in prediction lookup";
  })
    .done(function() {
    stop.wait = setInterval(function () {
      log(stop.loaded_stops);
      if(stop.loaded_stops) {
        stop.postPredictions();
        log(inst.predictions);
        clearInterval(stop.wait);
      }
    },10);
  });
}

Stop.prototype.stringify_predictions = function() {
  var tmp = "<ul>";
  var pred = Object.assign({},this.predictions);
  $.each(pred, function(key, val) {
    tmp += "<li>" + key + ": " + (val[0] == undefined ? "no predictions" : val.shift() + " minute(s)") + "</li><ul>";
    while(val.length > 3) {val.pop();}
    $.each(val, function(index, mins) {
      tmp += "<li>" + mins + "</li>";
    })
    tmp += "</ul>"
  });
  tmp += "</ul>";
  return tmp;
}

