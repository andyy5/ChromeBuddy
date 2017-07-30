$(document).ready(function () {
    init()
    showDateInfo();
    getData();
    communicateWithBackground();
    motivationLoad();
    openOptions();
});

function init() {
    $("#forecast-result").hide();
}

function showDateInfo() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var dt = new Date();
    var date = monthNames[dt.getMonth()] + " " + dt.getDate();
    var time = dt.toLocaleTimeString(); //dt.getHours() + ":" + dt.getMinutes();
    document.getElementById("date").innerHTML = date;
    document.getElementById("time").innerHTML = time;
    setInterval(showDateInfo, 1000); // update clock every second
}

function getData() {

    // http://openweathermap.org/api
    getCurrentWeather();
    getForecast();

}

function getCurrentWeather() {
    var params = {
        id: "6173331", // city ID for Vancouver BC Canada, from city.list.json
        units: "metric", // for celsius
        appid: "6c27a9a38314cb6b5884b0610c8005bd" // apikey
    };
    // http://api.openweathermap.org/data/2.5/weather?id=6173331&units=metric&appid=6c27a9a38314cb6b5884b0610c8005bd
    var url = "http://api.openweathermap.org/data/2.5/weather";
    $.getJSON(url, params, function (data) {
        showCurrentWeather(data);
    });
}

function showCurrentWeather(data) {
    var html = "";
    var temp = Math.round(data.main.temp * 10) / 10;
    var tempMax = Math.round(data.main.temp_max * 10) / 10;
    var tempMin = Math.round(data.main.temp_min * 10) / 10;
    var weather = data.weather[0].description;
    document.getElementById("current-weather-description").innerHTML = weather;
    document.getElementById("current-weather-temp").innerHTML = temp + " [" + tempMin + "," + tempMax + "]" + " (&degC)";
}

function getForecast() {
    $(document).on('click', '#btn-forecast', function () {
        var msgHide = "Hide Forecast";
        var msgShow = "Show Forecast";
        var fb = document.getElementById("btn-forecast");
        var fr = document.getElementById("forecast-result");
        //if ($("#forecast-result").is(":visible")){
        if (fb.innerHTML == msgShow & fr.innerHTML == "") { // only do get request if we hadn't already
            var params = {
                id: "6173331",
                units: "metric",
                appid: "6c27a9a38314cb6b5884b0610c8005bd"
            };
            var url = "http://api.openweathermap.org/data/2.5/forecast";
            $.getJSON(url, params, function (data) {
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
function showForecast(data) {
    var html = "";
    var prevDate = "";
    var date = "";
    for (var i = 0; i < data.list.length; i++) { // alternative: $.each(){}
        var item = data.list[i];
        var dt = item.dt_txt;
        var currentDate = dtToDate(dt);

        var timeClass = dtToTimeClass(dt);
        // don't need to process items not morning/afternoon/evening
        if (timeClass != "") {
            var temp = Math.round(item.main.temp * 10) / 10; // temperature rounded to 1 decimal
            var weather = item.weather[0].description;

            // same date but different times- should be under the same date header
            if (prevDate == currentDate) {
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
function dtToDate(dt) {
    var day = dt.substr(8, 2);
    var month = convertNumericMonth(dt.substr(5, 2));
    var result = month + "-" + day;
    return result;
}

// only called by showForecast
// input(string): dt_txt from object (ex format: "2016-08-31 09:00:00")
// input time splits: 00, 03, 06, 09, 12, 15, 18, 21, 24
// output(string): either morning, afternoon, or evening
function dtToTimeClass(dt) {
    var time = dt.substr(10, 3);
    if (time == 12) {
        return "Morning";
    } else if (time == 15) {
        return "Afternoon";
    } else if (time == 18) {
        return "Evening";
    } else {
        return "";
    }
}

// convert numeric month into word version
// input(string)
// output(string)
function convertNumericMonth(input) {
    if (input == "01") {
        return "JAN";
    } else if (input == "02") {
        return "FEB";
    } else if (input == "03") {
        return "MAR";
    } else if (input == "04") {
        return "APR";
    } else if (input == "05") {
        return "JUN";
    } else if (input == "06") {
        return "JUL";
    } else if (input == "07") {
        return "MAY";
    } else if (input == "08") {
        return "AUG";
    } else if (input == "09") {
        return "SEP";
    } else if (input == "10") {
        return "OCT";
    } else if (input == "11") {
        return "NOV";
    } else if (input == "12") {
        return "DEC";
    } else {
        return "";
    }
}

// communicate with background.js
// refer: http://stackoverflow.com/questions/13546778/how-to-communicate-between-popup-js-and-background-js-in-chrome-extension
function communicateWithBackground() {
    // study mode
    var port = chrome.extension.connect({name: "Communicate StudyMode"});
    port.postMessage("popup-opened");
    $(document).on('click', '#checkbox-studymode', function () {
        if ($("#checkbox-studymode").is(':checked')) {
            port.postMessage("studymode-on");
        } else {
            port.postMessage("studymode-off");
        }
    });
    port.onMessage.addListener(function (msg) {
        if (typeof(msg) === "boolean") {
            $("#checkbox-studymode").prop("checked", msg);
        } else {
            // outline color
            var color = "";
            if (msg == "blue") {
                color = "#87CEFA";
            } else if (msg == "red") {
                color = "#ff5f5f";
            } else if (msg == "yellow") {
                color = "yellow";
            } else if (msg == "green") {
                color = "#9afb9a";
            }
            $(".pipe-color").css("color", color);
            $(".banner > h1").css("border-color", color);
            $("#forecast-container button").css("background-color", color);
            $("#forecast-result").css("border-color", color);
        }
    });
}

function motivationLoad() {
    // pick a random msg from array
    var msg = motivate[Math.floor(Math.random() * motivate.length)];
    $("#motivation-loader").html(msg);
}

function openOptions() {
    $(document).on('click', '#btn-options', function () {
        window.open(chrome.runtime.getURL("options.html"));
    });
}

var motivate = [
    '"Most of life is just showing up."',
    '"Negativity gets you nowhere in life."',
    '"Its not about game days, its about the days where youre tired and want to give up." - CP3',
    '"Hindsight is always 20/20."',
    '"Not everyone who works hard is rewarded, but all those who succeeded have worked hard."',
    '"You only see others highlight reel and not the behind-the-scenes."',
    '"Relying on other people for happiness; as soon as you give people that power, you will forever be chasing happiness and you will never fufill it."',
    '"Opportunities are everything you make of it."',
    '"Success is when preparation meets opportunity."',
    '"The difference between good and great is 5%."',
    '"The grass is always greener where you water it."',
    '"In a year from now, you will wish you started today."',
    '"Not everything in life is worth stressing over."',
    '"The way to get started is to quit talking and begin doing."',
    '"Dont let yesterday take up too much of today."',
    '"You learn more from failure than success. Dont let it stop you."',
    '"Its not whether you get knocked down, its whether you get up."',
    '"Work hard in silence-let success be your noise."',
    '"Discipline is unyielding. Force yourself to follow through."',
    '"Try to be the rainbow in someones cloud."',
    '"Life isnt about finding yourself. Life is about creating yourself."',
    '"If there is no wind, row."',
    '"Keep your eyes on the stars, and your feet on the ground."',
    '"What you do today can improve all your tomorrows."',
    '"The secret of getting ahead is getting started."',
    '"If opportunity doesnt knock, build a door."',
    '"Somewhere, something incredible is waiting to be known."',
    '"Dont judge each day by the harvest you reap but by the seeds you plant."',
    '"Out of difficulties grow miracles."',
    '"Life is really simple, but we insist on making it complicated."',
    '"We do not remember days, we remember moments."',
    '"A dream doesnt become reality through magic; it takes sweat, determination, and hard work."',
    '"Do not dwell on the past, do not dream of the future, concentrate the mind on the present moment."',
    '"Character is much easier kept than recovered."',
    '"Education is not prepation for life, it is life itself."',
    '"Success is simple. Do whats right, the right way, at the right time."',
    '"Success consists of going from failure to failure without losing enthusiam."',
    '"The trouble with most of us is that we rather be ruined by praise than saved by criticism."',
    '"It doesnt matter how slowly you go as long as you dont stop."',
    '"Listen, smile, agree, and then do whatever the fuck you were gonna do anyway."',
    '"Man cannot remake himself without suffering, for he is both the marble and the sculptor."',
    '"If you get tired, learn to rest, not to quit"',
    '"If you want something youve never had, then youve got to do something youve never done."',
    '"Life is like a photograph, you need negatives to develop."',
    '"The difference between a master and beginner is that the master has failed more times than the beginner has tried."',
    '"Everyone is creative. Everyone is talented. Few are disciplined."',
    '"Make sure your worst enemy doesnt live between your own two ears."',
    '"Only put off until tomorrow what you are willing to die having left undone."',
    '"Sometimes I feel like giving up, then I remember I have a lot of motherfuckers to prove wrong."',
    '"You may have to fight a battle more than once to win it."',
    '"Once youve accepted your flaws, no one can use them against you."',
    '"Perfection is not attainable, but if we chase perfection we can catch excellence."'
];
