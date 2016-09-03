'use strict'

var studyModeCheckState = false;

// handle blocking websites
chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg == "studymode-on"){
            blockSites(true);
            studyModeCheckState = true;
        } else if (msg == "studymode-off"){
            blockSites(false);
            studyModeCheckState = false;
        } else if (msg == "popup-opened"){
            port.postMessage(studyModeCheckState);
        }
  });
});

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