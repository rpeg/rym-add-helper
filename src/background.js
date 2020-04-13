const getAddReleaseUrl = (id) => `https://rateyourmusic.com/releases/ac?artist_id=${id}`;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ hide: true });
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const { id: tabId, url } = tabs[0];

    chrome.storage.sync.get(tabId.toString(), (data) => {
      const result = data[tabId.toString()];

      const isActive = result && result.url === url && result.isActive;

      chrome.browserAction.setIcon({ path: `icons/${isActive ? 'off' : 'on'}_48.png`, tabId });

      chrome.storage.sync.set({
        [tabId.toString()]: {
          isActive: !isActive,
          url,
        },
      });

      chrome.tabs.sendMessage(tabId, {
        isActive: !isActive,
      });
    });
  });
});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    if (request.type === 'rym_submit' && request.formData) {
      chrome.tabs.create({ url: getAddReleaseUrl(request.formData.id) }, (tab) => {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, _tab) => {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            chrome.tabs.executeScript(tabId, {
              file: 'fill.ts',
            }, () => {
              chrome.tabs.sendMessage(tab.id, {
                formData: request.formData,
              });
            });
          }
        });
      });
    }
  },
);
