chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ hide: true }, () => {
    console.log('rym extension on');
  });
});

chrome.runtime.onMessage.addListener((message, callback) => {
  if (message == 'runContentScript') {
    chrome.tabs.executeScript({
      file: 'content.js',
    });
  }
});

window.onload = () => {
  console.log('onload');
  chrome.storage.sync.get('hide', (data) => {
    // if (data.hide) addListeners()
    // else removeListeners();
  });
};
