/* eslint-disable no-multi-assign */
/* eslint-disable no-use-before-define */
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import { Observable } from 'rxjs';

import Transformers from './utils/transformers';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const GUIDE_HTML = `
  <div id="rym__form" style="top: 0; right: 0">
    <div id="rym__form-inner">
      <h1 id="rym__header">RYM Add Helper</h1>
      <h4>RYM Artist ID:</h4>
      <input type="text" id="rym__artistid" />
      <br />
      <h4>Data:</h4>
      <ul id="rym__data" />
      <button id="rym__submit" type="button">Submit</button>
    </div>
  </div>
  <div id="rym__prompt-contaner">
    <p id="rym__prompt" />
  </div>
`;

const fields = [
  {
    name: 'artist',
    displayLabel: 'artist',
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'title',
    displayLabel: 'title',
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'releaseType',
    displayLabel: 'release type',
  },
  {
    name: 'date',
    displayLabel: 'date',
    transformer: Transformers.dateTransformer,
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
    name: 'trackNumber',
    displayLabel: 'a track number',
    multiple: true,
  },
  {
    name: 'trackTitle',
    displayLabel: 'a track title',
    multiple: true,
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'trackTime',
    displayLabel: 'a track time',
    multiple: true,
    transformer: Transformers.timeTransformer,
  },
];

const formData = {};
const cssData = {};

const isSelecting = false;

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

      if (e.srcElement.classList.contains(HOVER_CLASS)) {
        updateSelectedElm(e.target);
      }

      return false;
    },
    options: false,
  },
];

const guideUser = (container) => {
  const prompt = container.contents().find('#rym__prompt');
  const dataList = container.contents().find('#rym__data');

  prompt.text(`Select ${fields[0].displayLabel}`);

  let i = 0;

  const subscription = selectedElmObservable.subscribe((elm) => {
    console.log(elm);

    const { name, displayLabel, transformer } = fields[i];

    const selector = finder(elm, {
      className: (n) => !n.startsWith(BASE_CLASS),
      idName: (n) => !n.startsWith(BASE_CLASS),
    });

    console.log(elm.innerText);

    cssData[name] = selector;
    const data = formData[name] = transformer
      ? transformer(elm.innerText)
      : elm.innerText;

    $(`data-${name}`).append(data);

    i += 1;

    if (i < fields.length) {
      prompt.text(`Select ${displayLabel}`);
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

    initForm(container);
    guideUser(container);
  });
};

const initForm = (container) => {
  const dataList = container.contents().find('#rym__data');

  fields.forEach(({ displayLabel, name }) => {
    $(`<li id="data-${name}"><b>${displayLabel}</b>: </li>`).appendTo(dataList);

    // TODO click listeners?
  });
};

const onGuideComplete = () => {
  window.postMessage({
    formData,
  });
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

const removeHtml = () => {
  const container = document.getElementById('rym__guide');
  if (container) container.parentNode.removeChild(container);
};

window.addEventListener('message', ({ data }) => {
  onToggle(data.isActive);
}, false);
