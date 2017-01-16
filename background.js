chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.executeScript(null,{file:"source.js"});
});

chrome.webNavigation.onUpdated.addListener(function(details) {
    chrome.tabs.executeScript(null,{file:"source.js"});
});
