/* eslint-disable strict */

'use strict';

const injectScript = (filename) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'module');
  script.setAttribute('src', chrome.extension.getURL(filename));
  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.lastChild);
};

// route messages between modules and background script
chrome.runtime.onMessage.addListener(
  (request, sender) => {
    if (request.isActive) {
      injectScript('main.js');
    }

    window.postMessage(request);
  },
);

window.addEventListener('message', (message) => {
  if (message.source !== window) return;
  chrome.runtime.sendMessage(message.data);
}, false);
