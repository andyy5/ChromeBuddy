'use strict'

var studyModeCheckState = false;
var outlineColor = "blue";
var blockedUrls = [""];
var reminderIntervalIds = [];

$(document).ready(function() {
    restoreOptions();
    communicateWithPopup();
    storageListener();
 });

// communicate to popup.js
function communicateWithPopup(){
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            // handle blocking sites
            if (msg == "studymode-on"){
                studyModeCheckState = true;
                blockSites(studyModeCheckState);
            } else if (msg == "studymode-off"){
                studyModeCheckState = false;
                blockSites(studyModeCheckState);
            // handle study mode check state & outline color
            } else if (msg == "popup-opened"){
                // send current study mode check state
                port.postMessage(studyModeCheckState);
                // send current outline color
                port.postMessage(outlineColor);
            }
        });
    });
}

function blockSites(input){
    console.log("blocked urls: " + blockedUrls);

    // remove the listener so we can replace it with an updated one
    if (chrome.webRequest.onBeforeRequest.hasListener(blockingCallback)){
        chrome.webRequest.onBeforeRequest.removeListener(blockingCallback);
    }
    // urls: [] will block all sites
    if (input & blockedUrls.length != 0){
        // add listener to block sites
        chrome.webRequest.onBeforeRequest.addListener(
            blockingCallback, 
            { 
                urls: blockedUrls
            }, 
            ["blocking"]
        );
    }
}

// callback function for listener in blockSites()
// necessary to use named callback fn's (instead of anonymous fn's) in order to remove the listener
function blockingCallback(details){
    return {
        cancel: true
    };
}

// listen for option changes
function storageListener(){
    // refer: https://developer.chrome.com/extensions/storage
    chrome.storage.onChanged.addListener(function(changes, namespace){
        for(var key in changes){
            var storageChange = changes[key];
            if(key == "outlineColor"){
                outlineColor = storageChange.newValue;
            } else if (key == "blockedUrlArray"){
                blockedUrls = storageChange.newValue;
                blockSites(studyModeCheckState);
            } else if (key == "reminderArray"){
                createReminders(storageChange.newValue);
            }
        }
    });
}

// for on load
function restoreOptions(){
    chrome.storage.sync.get({
        // set default vals
        outlineColor: "blue",
        blockedUrlArray: [""],
        reminderArray: []
    }, function(obj){
        outlineColor = obj.outlineColor;
        blockedUrls = obj.blockedUrlArray;
        createReminders(obj.reminderArray);
    })
}

// everytime this is called, we recreate all the reminders (and clear the old ones)
// input array: ["msg || interval"]
function createReminders(array){
    console.log("reminders create: " + array)

    // Remove all the previous setIntervals
    for (var k = 0; k < reminderIntervalIds.length; k++){
        clearInterval(reminderIntervalIds[k]);
    }
    reminderIntervalIds = [];

    for (var i = 0; i < array.length; i++){
        var item = array[i];
        var temp_array = [];
        item = item.trim();
        temp_array = item.split("|"); // split based on pipe delimitor
        var msg = temp_array[0];
        var interval = temp_array[1] * 60000; // mins -> seconds

        // create seperate instances of setInterval for each item
        createNotification(msg, interval);
    }
}

function createNotification(msg, interval){

    var intervalId = setInterval(function(){
        var options = {
            type: "basic",
            title: "Reminder",
            message: msg,
            iconUrl: "assets/chromelogo_128.png",
            requireInteraction: true
        };
        // refer: https://developer.chrome.com/apps/richNotifications
        chrome.notifications.create(options);
    }, interval);

    reminderIntervalIds.push(intervalId);
}