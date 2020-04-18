/* eslint-disable strict */

'use strict';

const TLD_RE = /^(com|edu|gov|net|mil|org|nom|co|name|info|biz)$/i;

const injectScript = (filename) => {
  const script = document.createElement('script');
  script.setAttribute('type', 'module');
  script.setAttribute('src', chrome.extension.getURL(filename));
  const head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.lastChild);
};

/**
 * Won't work for every possible second-level domain, but should be good enough
 * for the purpose of skipping subdomains with common SLDs.
 *
 * e.g. "band.bandcamp.com" -> "bandcamp"
 */
const getDomainName = (host) => {
  const parts = host.split('.').reverse();

  if (parts.length >= 3) { // has subdomain
    if (parts[0].match(TLD_RE)) {
      return parts[1];
    }

    if (parts[1].match(TLD_RE)) {
      return parts[0];
    }
  }

  return parts[1];
};

// route messages between modules and background script
chrome.runtime.onMessage.addListener(
  (request, sender) => {
    switch (request.type) {
      case 'toggle': {
        const domain = getDomainName(window.location.host);

        chrome.storage.sync.get([domain], (result) => {
          result[domain] && console.info(`${domain} templated loaded`);

          window.postMessage({
            storedTemplate: result[domain],
            ...request,
          });
        });

        break;
      }
      default:
        window.postMessage(request);
    }
  },
);

window.addEventListener('message', (message) => {
  if (message.source !== window) return;

  switch (message.data.type) {
    case 'setStorage': {
      console.info(message.data);

      chrome.storage.sync.set({ [message.data.key]: message.data.value }, () => {
        console.info(`${message.data.key} template saved`);
      });
      break;
    }
    case 'rym_submit':
      chrome.runtime.sendMessage(message.data);
      break;
    default:
      chrome.runtime.sendMessage(message.data);
      break;
  }
}, false);

window.addEventListener('load', () => {
  injectScript('main.js');
}, false);
