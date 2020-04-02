let isActive = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ hide: true }, () => {
    console.log('rym extension on');
  });
});

chrome.browserAction.onClicked.addListener(() => {
  console.log('clicked');

  isActive = !isActive;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { isActive }, (response) => {
      console.log('test res');
    });
  });
});

window.onload = () => {
  console.log('onload');
  chrome.storage.sync.get('hide', (data) => {
    // if (data.hide) addListeners()
    // else removeListeners();
  });
};
