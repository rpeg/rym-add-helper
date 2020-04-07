import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const FIELDS = [
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

const guideHtml = `
<div>
    <h1 id="rym__header">RYM Add Helper</h1>
    <p id="rym__desc">Test</p>
</div>
`;

let lastSelectedElm = '';

const domEvents = [
  {
    type: 'mouseover',
    listener: _.throttle((e) => {
      if (!e.srcElement.className.contains(BASE_CLASS)
       && !e.srcElement.idName.contains(BASE_CLASS)) {
        e.srcElement.classList.add(HOVER_CLASS);
      }
    }, 200),
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

      lastSelectedElm = finder(e.target, {
        className: (name) => !name.startsWith(BASE_CLASS),
        idName: (name) => !name.startsWith(BASE_CLASS),
      });

      console.log(lastSelectedElm);

      return false;
    },
    options: false,
  },
];

const initGuide = () => {
  $(document).ready(() => {
    const container = $('<div />').appendTo('body');
    container.attr('id', 'rym__guide');
    container.html(guideHtml);

    const field = container.contents().find('#rym__desc');
    field.text(FIELDS[0]);
  });
};

const removeHtml = () => {
  const iframe = document.getElementById('rym__guide');
  if (iframe) iframe.parentNode.removeChild(iframe);
};

const onToggle = (active) => {
  domEvents.forEach((ev) => (active
    ? document.addEventListener(ev.type, ev.listener, ev.options)
    : document.removeEventListener(ev.type, ev.listener, ev.options)));

  if (active) {
    initGuide();
  } else {
    removeHtml();
  }
};

window.addEventListener('message', ({ data }) => {
  onToggle(data.isActive);
}, false);
