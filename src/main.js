/* eslint-disable no-console */
/* eslint-disable no-multi-assign */
/* eslint-disable no-use-before-define */
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import { Observable } from 'rxjs';

import Transformers from './utils/transformers';
import Templates from './utils/templates';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const GUIDE_HTML = `
  <div id="rym__form" class="rym__" style="top: 0; right: 0">
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
    promptLabel: 'artist',
    formLabel: 'artist',
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'title',
    promptLabel: 'title',
    formLabel: 'title',
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'releaseType',
    promptLabel: 'release type',
    formLabel: 'type',
  },
  {
    name: 'date',
    promptLabel: 'release date',
    formLabel: 'date',
    transformer: Transformers.dateTransformer,
  },
  {
    name: 'label',
    promptLabel: 'label',
    formLabel: 'label',
  },
  {
    name: 'catalogId',
    promptLabel: 'catalog #',
    formLabel: 'catalog #',
  },
  {
    name: 'country',
    promptLabel: 'country',
    formLabel: 'country',
  },
  {
    name: 'trackNumber',
    promptLabel: 'a track number',
  },
  {
    name: 'trackTitle',
    promptLabel: 'a track title',
    transformer: Transformers.capitalizationTransformer,
  },
  {
    name: 'trackTime',
    promptLabel: 'a track time',
    transformer: Transformers.timeTransformer,
  },
];

const cssData = {};
const formData = {};
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
  prompt.text(`Select ${fields[0].promptLabel}`);

  let i = 0;

  const subscription = selectedElmObservable.subscribe((elm) => {
    console.log(elm);

    const { name, promptLabel, transformer } = fields[i];

    const selector = finder(elm, {
      className: (n) => !n.startsWith(BASE_CLASS),
      idName: (n) => !n.startsWith(BASE_CLASS),
    });

    console.log(elm.innerText);

    cssData[name] = selector;
    formData[name] = transformer
      ? transformer(elm.innerText)
      : elm.innerText;

    // $(`data-${name}`).append(data);

    i += 1;

    if (i < fields.length) {
      prompt.text(`Select ${promptLabel}`);
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

    // load in premade template if applicable
    const domainTemplate = Templates[document.location.hostname];
    if (domainTemplate) {
      console.log('template found');
      parseTemplate(domainTemplate);
    } else {
      guideUser(container);
    }
  });
};

const initForm = (container) => {
  const dataList = container.contents().find('#rym__data');

  fields.filter((f) => f.formLabel).forEach(({ promptLabel, name }) => {
    $(`<li id="data-${name}"><b>${promptLabel}</b>: </li>`).appendTo(dataList);

    // TODO click listeners?
  });
};

const parseTemplate = (template) => {
  Object.entries(template).forEach(([k, v]) => {
    cssData[k] = v;

    const match = $(v);
    console.log(match);
    if (match instanceof Array) {
      console.log(match.map((m) => m.text()));
    } else {
      console.log(match.text());
    }
  });

  onGuideComplete();
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
