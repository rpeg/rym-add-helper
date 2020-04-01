/* eslint-disable no-unused-expressions */
const getState = (tabId) => new Promise((resolve) => {
  chrome.tabs.executeScript(
    tabId,
    {
      code: 'window.__rym && window.__rym.state',
    },
    (result) => resolve(result && result[0]),
  );
});

const updateIcon = (isPressed) => chrome.browserAction.setIcon({
  path: `icon_128${isPressed ? '_pressed' : ''}.png`,
});

!(() => {
  let selectedTabId = null;

  const toggle = async () => {
    const state = await getState(selectedTabId);
    // updateIcon(state);
  };

  chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.executeScript(
      tab.id,
      {
        file: 'index.js',
      },
      async () => {
        selectedTabId = tab.id;
        toggle();
      },
    );
  });

  chrome.tabs.onActivated.addListener(async (tab) => {
    selectedTabId = tab.id;
    toggle();
  });

  chrome.tabs.onUpdated.addListener(async (tab) => {
    selectedTabId = tab.id;
    toggle();
  });
})();
