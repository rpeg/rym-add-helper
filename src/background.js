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
    chrome.browserAction.setIcon({ path: `icons/${isActive ? 'on' : 'off'}_48.png`, tabId: tabs[0].id });
    chrome.tabs.sendMessage(tabs[0].id, { isActive });
  });
});

window.onload = () => {
  console.log('onload');
  chrome.storage.sync.get('hide', (data) => {
    // if (data.hide) addListeners()
    // else removeListeners();
  });
};
