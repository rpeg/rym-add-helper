/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
import { h, render, Component } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

const App = () => {
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isInvalidMessageDisplayed, setIsInvalidMessageDisplayed] = useState(false);
  const [promptLabel, setPromptLabel] = useState('');
  const [selectedElm, setSelectedElm] = useState(null);
  const [data, setData] = useState({
    artist: {
      selector: '',
      promptLabel: 'artist',
      formLabel: 'artist',
      transformer: Transformers.capitalizationTransformer,
    },
    title: {
      selector: '',
      promptLabel: 'title',
      formLabel: 'title',
      transformer: Transformers.capitalizationTransformer,
    },
    releaseType: {
      selector: '',
      promptLabel: 'release type',
      formLabel: 'type',
    },
    date: {
      selector: '',
      promptLabel: 'release date',
      formLabel: 'date',
      transformer: Transformers.dateTransformer,
    },
    label: {
      selector: '',
      promptLabel: 'label',
      formLabel: 'label',
    },
    catalogId: {
      selector: '',
      promptLabel: 'catalog #',
      formLabel: 'catalog #',
    },
    country: {
      selector: '',
      promptLabel: 'country',
      formLabel: 'country',
    },
    trackPosition: {
      selector: '',
      promptLabel: 'a track position',
      formLabel: 'track position',
      mapTo: 'tracks',
    },
    trackTitle: {
      selector: '',
      promptLabel: 'a track title',
      formLabel: 'track title',
      transformer: Transformers.capitalizationTransformer,
      mapTo: 'tracks',
    },
    trackDuration: {
      selector: '',
      promptLabel: 'a track duration',
      formLabel: 'track duration',
      transformer: Transformers.timeTransformer,
      mapTo: 'tracks',
    },
  });

  const artistInputRef = useRef(null);

  useWindowEvent('mouseover', _.throttle((e) => {
    if (isSelecting && e.srcElement.classList && !e.srcElement.classList.contains(BASE_CLASS)) {
      e.srcElement.classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', _.throttle((e) => {
    e.srcElement.classList.remove(HOVER_CLASS);
  }, 200), isFormDisplayed);

  useWindowEvent('click', (e) => {
    e.preventDefault();

    if (e.srcElement.classList.contains(HOVER_CLASS)) {
      setSelectedElm(e.target);
    }

    return false;
  }, isFormDisplayed);

  const parseData = () => {
    const d = { ...data };

    Object.entries(data).forEach(([k, v]) => {
      if (v.selector) {
        const match = $(v.selector);
        const transformer = d[k].transformer || ((val) => val);

        console.log(match);

        if (match instanceof Array) {
          d[v.mapTo][k].data = match.map((m) => transformer(m.text()));
        } else {
          d[k].data = transformer(match.text());
        }
      }
    });

    setData({ ...d });
  };

  const guideUser = () => {
    Object.values(data).forEach((d) => {
      setPromptLabel(d.promptLabel);
    });
  };

  const submitForm = () => {
    if (artistInputRef.innerText) {
      setIsInvalidMessageDisplayed(false);

      window.postMessage({
        formData: data,
      });
    } else {
      setIsInvalidMessageDisplayed(true);
    }
  };

  const template = Templates[document.location.hostname];

  if (template) {
    const d = {};

    Object.entries(template).forEach(([k, v]) => {
      d[k].selector = v;
    });

    setData(d);
    parseData();
    setIsFormDisplayed(true);
  } else {
    setIsFormDisplayed(true);
    guideUser();
  }

  return (
    isFormDisplayed && (
    <>
      <div id="rym__form" className="rym__" style={{ top: 0, right: 0 }}>
        <div id="rym__form-inner">
          <h1 id="rym__header">RYM Add Helper</h1>
          <h4>RYM Artist ID:</h4>
          <input type="text" id="rym__artistid" ref={artistInputRef} />
          {isInvalidMessageDisplayed
           && <h4 style={{ color: 'red' }}>* Required</h4>}
          <br />
          <h4>Data:</h4>
          <ul id="rym__data">
            {Object.values(data).map((v) => (
              <li>
                <b>{`${v.formLabel}:`}</b>
                {' '}
                {v.data || ''}
              </li>
            ))}
          </ul>
          <button id="rym__submit" type="button" onClick={submitForm}>Submit</button>
        </div>
      </div>
      <div id="rym__prompt-contaner">
        <h3 id="rym__prompt">
          {`Select ${promptLabel}`}
        </h3>
      </div>
    </>
    )
  );
};

export default App;
