/* eslint-disable strict */

'use strict';

const injectScript = (filename) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'module');
  script.setAttribute('src', chrome.extension.getURL(filename));
  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.lastChild);
};

const injectData = (data, name) => {
  const div = document.createElement('div');
  div.setAttribute(`data-${name}`, JSON.stringify(data));
};

chrome.runtime.onMessage.addListener(
  (request, sender) => {
    window.postMessage(request);
  },
);

window.addEventListener('message', (message) => {
  if (message.source !== window) return;
  chrome.runtime.sendMessage(message.data);
}, false);

injectScript('fill.js');
