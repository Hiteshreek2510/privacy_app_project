// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'IMAGE_SELECTED') {
    chrome.tabs.create({
      url: chrome.runtime.getURL('popup.html')
    });
  }
});
