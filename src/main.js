import finder from '@medv/finder';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

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

      const selector = finder(e.target, {
        className: (name) => !name.startsWith(BASE_CLASS),
      });

      console.log(selector);

      return false;
    },
    options: false,
  },
];

const onToggle = (active) => {
  console.log(`events turned ${active ? 'on' : 'off'}`);
  events.forEach((ev) => (active
    ? document.addEventListener(ev.type, ev.listener, ev.options)
    : document.removeEventListener(ev.type, ev.listener, ev.options)));
};

window.addEventListener('message', ({ data }) => {
  onToggle(data.isActive);
}, false);
