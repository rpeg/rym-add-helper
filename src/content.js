const HOVER_CLASS = 'rym__hover';

const fields = [
  'title',
  'release type',
  'date',
  'issue',
  'disc size',
  'label',
  'catalog #',
  'countries issued',
  'tracks',
];

const events = [
  {
    type: 'mouseover',
    listener: (e) => {
      e.srcElement.classList.add(HOVER_CLASS);
    },
    options: false,
  },
  {
    type: 'mouseout',
    listener: (e) => {
      e.srcElement.classList.remove(HOVER_CLASS);
    },
    options: false,
  },
  {
    type: 'click',
    listener: (e) => {
      e.preventDefault();
      return false;
    },
    options: false,
  },
];

const onToggle = (active) => {
  events.forEach((ev) => (active
    ? document.addEventListener(ev.type, ev.listener, ev.options)
    : document.removeEventListener(ev.type, ev.listener, ev.options)));
};

chrome.runtime.onMessage.addListener(
  (request) => {
    onToggle(request.isActive);
  },
);
