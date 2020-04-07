/* eslint-disable strict */

'use strict';

// inject main into content script
const script = document.createElement('script');
script.setAttribute('type', 'module');
script.setAttribute('src', chrome.extension.getURL('main.js'));
const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
head.insertBefore(script, head.lastChild);

// route messages between modules and background script
window.addEventListener('message', (message) => {
  chrome.runtime.sendMessage(message);
}, false);

const injectHtml = () => {
  const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;
  if (!window.location.ancestorOrigins.contains(extensionOrigin)) {
    const iframe = document.createElement('iframe');
    iframe.id = 'rym__guide';
    iframe.src = chrome.runtime.getURL('guide.html');
    document.body.appendChild(iframe);
  }
};

const removeHtml = () => {
  const iframe = document.getElementById('rym__guide');
  iframe.parentNode.removeChild(iframe);
};

chrome.runtime.onMessage.addListener(
  (request) => {
    if (request.isActive) {
      injectHtml();
    } else {
      removeHtml();
    }

    window.postMessage(request);
  },
);
