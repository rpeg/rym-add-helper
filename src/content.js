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

chrome.runtime.onMessage.addListener(
  (request) => {
    window.postMessage(request);
  },
);
