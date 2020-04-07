const getAddReleaseUrl = (id) => `https://rateyourmusic.com/releases/ac?artist_id=${id}`;

let isActive = false;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ hide: true });
});

chrome.browserAction.onClicked.addListener(() => {
  isActive = !isActive;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.browserAction.setIcon({ path: `icons/${isActive ? 'on' : 'off'}_48.png`, tabId: tabs[0].id });
    chrome.tabs.sendMessage(tabs[0].id, { isActive });
  });
});

// after user completes selection, open rym tab and fill out form with passed data
chrome.runtime.onMessage.addListener(
  ({ formData }) => {
    chrome.tabs.create({ url: getAddReleaseUrl(formData.id) }, (tab) => {
      chrome.tabs.sendMessage(tab.id, { formData });
    });
  },
);
