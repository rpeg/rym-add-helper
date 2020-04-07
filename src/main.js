import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import { Observable } from 'rxjs';

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
const GUIDE_HTML = `
<div id="rym__guide-inner>
    <h1 id="rym__header">RYM Add Helper</h1>
    <p id="rym__desc">Select ${FIELDS[0]}</p>
</div>
`;

const parseMap = {};
const domainElmMap = {};

const isSelecting = true;

let updateSelectedElm;
const selectedElmObservable = Observable.create((observer) => {
  updateSelectedElm = (value) => {
    observer.next(value);
  };
});

const domEvents = [
  {
    type: 'mouseover',
    listener: _.throttle((e) => {
      if (isSelecting
        && e.srcElement
        && e.srcElement.classList
        && !e.srcElement.classList.contains(BASE_CLASS)) {
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

      updateSelectedElm(e.target);

      return false;
    },
    options: false,
  },
];

/**
 * Walk user step-by-step through each metadata field.
 */
const guideUser = (container) => {
  const desc = container.contents().find('#rym__desc');

  let fieldIndex = 0;

  const subscription = selectedElmObservable.subscribe((elm) => {
    console.log(elm);

    const selector = finder(elm, {
      className: (name) => !name.startsWith(BASE_CLASS),
      idName: (name) => !name.startsWith(BASE_CLASS),
    });

    domainElmMap[FIELDS[fieldIndex]] = selector;
    parseMap[FIELDS[fieldIndex]] = elm.innerText;

    console.log(elm.innerText);

    fieldIndex += 1;

    if (fieldIndex < FIELDS.length) {
      desc.text(`Select ${FIELDS[fieldIndex]}`);
    } else {
      console.log(domainElmMap);
      console.log(parseMap);
      subscription.unsubscribe();
    }
  });
};

const initGuide = () => {
  $(document).ready(() => {
    const container = $('<div />').appendTo('body');
    container.attr('id', 'rym__guide');
    container.html(GUIDE_HTML);

    guideUser(container);
  });
};

const removeHtml = () => {
  const container = document.getElementById('rym__guide');
  if (container) container.parentNode.removeChild(container);
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

// receive messages from content script
window.addEventListener('message', ({ data }) => {
  onToggle(data.isActive);
}, false);
