var StatsData = {};
var PrevTab = null;

$(document).ready(() => {
    communicateWithStatsPage();
    handleTabsOnload();
    checkForSleep();
});

// stats-page.js is a content script
function communicateWithStatsPage() {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.refresh) {
                sendResponse(StatsData);
            } else if (request.clear) {
                resetData();
            }
        });
}

// get active tab & init the StatsData obj
function handleTabsOnload() {
    getActiveTab().then(activeTab => {
        storeActiveTab(activeTab, null);
        updateActiveTab();
    });
}

function getActiveTab() {
    return new Promise((resolve) => {
        let url;
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0] !== undefined) {
                url = tabs[0]['url'];
            } else {
                url = null;
            }
            resolve(url);
        });
    });
}

// store the active tab and log previous tab session time
function storeActiveTab(currUrl, prevUrl) {
    let currName = filterUrl(currUrl);
    let prevName = filterUrl(prevUrl);

    if (currName !== null && prevName === null) { // called from init or from out-of-focus
        if (!StatsData[currName]) {
            StatsData[currName] = constructMetaDataObj();
        } else {
            StatsData[currName]['visit_start_time'] = Date.now();
        }
        PrevTab = currName;
    } else if (currName !== null && prevName !== null) {
        StatsData[prevName]['time_total'] += Date.now() - StatsData[prevName]['visit_start_time'];
        StatsData[prevName]['visit_start_time'] = 0;
        if (!StatsData[currName]) {
            StatsData[currName] = constructMetaDataObj();
        } else {
            StatsData[currName]['visit_start_time'] = Date.now();
        }
        PrevTab = currName;
    }
}

function constructMetaDataObj() {
    let obj = {};
    obj['visit_start_time'] = Date.now();
    obj['time_total'] = 0;

    return obj;
}

function filterUrl(url) {
    if (url === null) {
        return null;
    }

    let hostname;

    try {
        if (url.indexOf("://") > -1) {
            hostname = url.split('/')[2];
        }
        else {
            hostname = url.split('/')[0];
        }
        hostname = hostname.split(':')[0];
        hostname = hostname.split('?')[0];
    } catch (e) {
        return null;
    }

    return hostname;
}

function updateActiveTab() {
    chrome.tabs.onActivated.addListener(() => {
        getActiveTab().then(activeTab => {
            storeActiveTab(activeTab, PrevTab);
        });
    });

    chrome.tabs.onUpdated.addListener(() => {
        getActiveTab().then(activeTab => {
            storeActiveTab(activeTab, PrevTab);
        });
    });

    chrome.windows.onFocusChanged.addListener((windowId) => {
        // -1 includes incognito
        if (windowId === -1) {
            stopRecording();
        } else {
            getActiveTab().then(activeTab => {
                storeActiveTab(activeTab, PrevTab);
            });
        }
    });
}

function stopRecording() {
    if (PrevTab !== null) {
        StatsData[PrevTab]['time_total'] += Date.now() - StatsData[PrevTab]['visit_start_time'];
        StatsData[PrevTab]['visit_start_time'] = 0;
        PrevTab = null;
    }
}

function resetData() {
    PrevTab = null;
    StatsData = {};
}

//https://stackoverflow.com/questions/4079115/can-any-desktop-browsers-detect-when-the-computer-resumes-from-sleep
function checkForSleep() {
    // var lastTime = (new Date()).getTime();
    //
    // setInterval(function () {
    //     var currentTime = (new Date()).getTime();
    //     if (currentTime > (lastTime + 4000)) {  // ignore small delays
    //         resetData();
    //     }
    //     lastTime = currentTime;
    // }, 2000);
}