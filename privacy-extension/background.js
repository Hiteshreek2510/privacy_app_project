chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'IMAGE_SELECTED') {
    chrome.storage.local.set({
      selectedImage: {
        filename: message.filename,
        data: message.data
      }
    }, () => {
      chrome.tabs.create({
        url: chrome.runtime.getURL('popup.html')
      });
    });
  }
});
