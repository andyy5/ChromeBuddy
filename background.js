'use strict'

var studyModeCheckState = false;
var outlineColor = "blue";

$(document).ready(function() {
    restoreOptions();
    communicateWithPopup();
 });

// communicate to popup.js
function communicateWithPopup(){
    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            // handle blocking sites
            if (msg == "studymode-on"){
                blockSites(true);
                studyModeCheckState = true;
            } else if (msg == "studymode-off"){
                blockSites(false);
                studyModeCheckState = false;
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

// input val: boolean
function blockSites(val){
    if (val){
        // add listener to block sites
        chrome.webRequest.onBeforeRequest.addListener(
            blockingCallback, 
            { 
                urls: ["*://*.facebook.com/*", "*://*.imgur.com/*"]
            }, 
            ["blocking"]
        );
    } else if (chrome.webRequest.onBeforeRequest.hasListener(blockingCallback)){
        // remove the listener so sites no longer blocked
        chrome.webRequest.onBeforeRequest.removeListener(blockingCallback);
    }
}

// callback function for listener in blockSites()
// necessary to use named callback fn's (instead of anonymous fn's) in order to remove the listener
function blockingCallback(details){
    return {
        cancel: true
    };
}

// refer: https://developer.chrome.com/extensions/storage
chrome.storage.onChanged.addListener(function(changes, namespace){
    for(var key in changes){
        var storageChange = changes[key];
        if(key == "outlineColor"){
            outlineColor = storageChange.newValue;
        }
    }
});

function restoreOptions(){
    chrome.storage.sync.get({ //asynchronous
        // set default vals
        outlineColor: "blue"
    }, function(obj){
        outlineColor = obj.outlineColor;
    })
}