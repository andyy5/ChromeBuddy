'use strict'

var studyModeCheckState = false;
var outlineColor = "blue";
var blockedUrls = [""];

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
            }
        }
    });
}

// for on load
function restoreOptions(){
    chrome.storage.sync.get({
        // set default vals
        outlineColor: "blue",
        blockedUrlArray: [""]
    }, function(obj){
        outlineColor = obj.outlineColor;
        blockedUrls = obj.blockedUrlArray;
    })
}