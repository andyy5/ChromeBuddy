$(document).ready(function() {
    init();
    showDateInfo();
    getData();
    communicateWithBackground();
 });

function init(){
    $("#forecast-result").hide();
    setInterval(showDateInfo, 1000); // for clock to update every second
}

function showDateInfo(){
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var dt = new Date();
    var date = monthNames[dt.getMonth()] + " " + dt.getDate();
    var time = dt.toLocaleTimeString(); //dt.getHours() + ":" + dt.getMinutes();
    document.getElementById("date").innerHTML = date;
    document.getElementById("time").innerHTML = time;
}

function getData(){

    // http://openweathermap.org/api
    getCurrentWeather();
    getForecast();
    
}

function getCurrentWeather(){
    var params = {
        id : "6173331", // city ID for Vancouver BC Canada, from city.list.json
        units: "metric", // for celsius
        appid: "6c27a9a38314cb6b5884b0610c8005bd" // apikey
    };
    // http://api.openweathermap.org/data/2.5/weather?id=6173331&units=metric&appid=6c27a9a38314cb6b5884b0610c8005bd
    var url = "http://api.openweathermap.org/data/2.5/weather";
    $.getJSON(url, params, function(data){
        showCurrentWeather(data);
    });
}

function showCurrentWeather(data){
    var html = "";
    var temp = Math.round(data.main.temp * 10) / 10;
    var tempMax = Math.round(data.main.temp_max * 10) / 10;
    var tempMin = Math.round(data.main.temp_min * 10) / 10;
    var weather = data.weather[0].description;
    document.getElementById("current-weather-description").innerHTML = weather;
    document.getElementById("current-weather-temp").innerHTML = temp + " [" + tempMin + "," + tempMax + "]" + " (&degC)";
}

function getForecast(){
    $(document).on('click', '#btn-forecast', function(){
        var msgHide = "Hide Forecast";
        var msgShow = "Show Forecast";
        var fb = document.getElementById("btn-forecast");
        var fr = document.getElementById("forecast-result");
        //if ($("#forecast-result").is(":visible")){
        if (fb.innerHTML == msgShow & fr.innerHTML == ""){ // only do get request if we hadn't already
            var params = {
                id : "6173331",
                units: "metric",
                appid: "6c27a9a38314cb6b5884b0610c8005bd"
            };
            var url = "http://api.openweathermap.org/data/2.5/forecast";
            $.getJSON(url, params, function(data){
                showForecast(data);
            });
            fb.innerHTML = msgHide;
            $("#forecast-result").show();
        } else if (fb.innerHTML == msgShow) {
            fb.innerHTML = msgHide;
            $("#forecast-result").show();
        } else if (fb.innerHTML == msgHide) {
            fb.innerHTML = msgShow;
            $("#forecast-result").hide();
        }
    });
}

// show and process api objs
function showForecast(data){
    var html = "";
    var prevDate = "";
    var date = "";
    for (var i = 0; i < data.list.length; i++) { // alternative: $.each(){}
        var item = data.list[i];
        var dt = item.dt_txt;
        var currentDate = dtToDate(dt);

        var timeClass = dtToTimeClass(dt);
        // don't need to process items not morning/afternoon/evening
        if (timeClass != ""){    
            var temp = Math.round(item.main.temp * 10) / 10; // temperature rounded to 1 decimal
            var weather = item.weather[0].description;

            // same date but different times- should be under the same date header
            if (prevDate == currentDate){
                date = "";
            } else {
                prevDate = currentDate;
                date = currentDate;
            }
            html += '<h1>' + date + '</h1>' + '<p>' + timeClass + ": " + weather + " " + temp + "&deg" + '</p>';
        }
    }
    document.getElementById("forecast-result").innerHTML = html;

}

// only called by showForecast
// input(string): dt_txt from object (ex format: "2016-08-31 09:00:00")
// output(string): date (ex format: "Aug-31")
function dtToDate(dt){
    var day = dt.substr(8,2);
    var month = convertNumericMonth(dt.substr(5,2));
    var result = month + "-" + day;
    return result;
}

// only called by showForecast
// input(string): dt_txt from object (ex format: "2016-08-31 09:00:00")
// input time splits: 00, 03, 06, 09, 12, 15, 18, 21, 24
// output(string): either morning, afternoon, or evening
function dtToTimeClass(dt){
    var time = dt.substr(10,3);
    if (time == 12){
        return "Morning";
    } else if(time == 15){
        return "Afternoon";
    } else if(time == 18){
        return "Evening";
    } else {
        return "";
    }
}

// convert numeric month into word version
// input(string)
// output(string)
function convertNumericMonth(input){
    if (input == "01"){
        return "JAN";
    } else if(input == "02"){
        return "FEB";
    } else if(input == "03"){
        return "MAR";
    } else if(input == "04"){
        return "APR";
    } else if(input == "05"){
        return "JUN";
    } else if(input == "06"){
        return "JUL";
    } else if(input == "07"){
        return "MAY";
    } else if(input == "08"){
        return "AUG";
    } else if(input == "09"){
        return "SEP";
    } else if(input == "10"){
        return "OCT";
    } else if(input == "11"){
        return "NOV";
    }else if(input == "12"){
        return "DEC";
    } else {
        return "";
    }
}

// communicate with background.js
// refer: http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension
function communicateWithBackground(){
    // study mode
    var port = chrome.extension.connect({name: "Communicate StudyMode"});
    port.postMessage("popup-opened");
    $(document).on('click', '#checkbox-studymode', function(){
        if ($("#checkbox-studymode").is(':checked')){
            port.postMessage("studymode-on");
        } else {
            port.postMessage("studymode-off");
        }
    });
    port.onMessage.addListener(function(msg) {
        if (typeof(msg) === "boolean"){
            $("#checkbox-studymode").prop("checked", msg);
        } else {
    // outline color
            var color = "";
            if (msg == "blue"){
                color = "#87CEFA";
            } else if (msg == "red"){
                color = "#ff5f5f";
            } else if (msg == "yellow"){
                color = "yellow";
            } else if (msg == "green"){
                color = "#9afb9a";
            }
            $(".pipe-color").css("color", color);
            $(".banner > h1").css("border-color", color);
            $("#forecast-container button").css("background-color", color);
            $("#forecast-result").css("border-color", color);
        }
    });
}