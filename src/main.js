/* eslint-disable no-use-before-define */
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import { Observable } from 'rxjs';

import Transformers from './utils/transformers';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const GUIDE_HTML = `
  <div id="rym__guide-inner" style="top: 0; left: 0">
      <h1 id="rym__header">RYM Add Helper</h1>
      <p id="rym__desc">Select ${fields[0].name}</p>
      <ul id="rym__data></ul>
  </div>
`;

const fields = [
  {
    name: 'artist',
    displayLabel: 'artist',
    transformers: [
      Transformers.capitalizationTransformer,
    ],
  },
  {
    name: 'title',
    displayLabel: 'title',
    transformers: [
      Transformers.capitalizationTransformer,
    ],
  },
  {
    name: 'releaseType',
    displayLabel: 'release type',
  },
  {
    name: 'date',
    displayLabel: 'date',
    transformers: [
      Transformers.dateTransformer,
    ],
  },
  {
    name: 'label',
    displayLabel: 'label',
  },
  {
    name: 'catalogId',
    displayLabel: 'catalog #',
  },
  {
    name: 'country',
    displayLabel: 'country',
  },
  {
    name: 'tracks',
    displayLabel: 'tracklist',
    transformers: [
      Transformers.metaTransformer(Transformers.capitalizationTransformer),
    ],
  },
];

const formData = {};
const cssData = {};

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

// walk user step-by-step through each metadata field
const guideUser = (container) => {
  const desc = container.contents().find('#rym__desc');

  let i = 0;

  const subscription = selectedElmObservable.subscribe((elm) => {
    console.log(elm);

    const selector = finder(elm, {
      className: (name) => !name.startsWith(BASE_CLASS),
      idName: (name) => !name.startsWith(BASE_CLASS),
    });

    cssData[fields[i].name] = selector;
    formData[fields[i].name] = elm.innerText;

    console.log(elm.innerText);

    i += 1;

    if (i < fields.length) {
      desc.text(`Select ${fields[i]}`);
    } else {
      console.log(cssData);
      console.log(formData);

      subscription.unsubscribe();
      onGuideComplete();
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

const onGuideComplete = () => {
  window.postMessage({
    formData,
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
