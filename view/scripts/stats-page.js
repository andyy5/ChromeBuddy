$(document).ready(() => {
    $("#btn-clear-stats").click(function () {
        chrome.runtime.sendMessage({clear: true}, function (response) {
            clearTable();
        });
    });

    $("#btn-refresh-stats").click(function () {
        chrome.runtime.sendMessage({refresh: true}, function (response) {
            updateTable(response);
        });
    });
});

function clearTable() {
    $("#stats-table tr").remove();
    $("#stats-table").append("<tr><th>Domain</th><th>Time</th></tr>");
}

function updateTable(obj) {
    clearTable();
    let data = serialize(obj);
    for (let obj of data) {
        let domain = obj["domain"];
        let time = obj["time"];
        $("#stats-table").append("<tr><td>" + domain + "</td><td>" + time + "</td></tr>");
    }
}

// result: [{'domain':google.ca, 'time': 10000}, ...] in descending time
function serialize(obj) {
    let result = [];
    for (let domain in obj) {
        if (domain !== "" && domain.length <= 30) {
            let temp = {};
            temp["domain"] = domain;
            temp["time"] = msToTime(obj[domain]['time_total']);
            result.push(temp);
        }
    }
    result.sort(compare);
    return result;
}

function compare(a, b) {
    if (a.time < b.time)
        return 1;
    if (a.time > b.time)
        return -1;
    return 0;
}

// https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript
function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100)
        , seconds = parseInt((duration / 1000) % 60)
        , minutes = parseInt((duration / (1000 * 60)) % 60)
        , hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}