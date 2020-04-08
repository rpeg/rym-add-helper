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
  const [dataIndex, setDataIndex] = useState(0);
  const [data, setData] = useState([
    {
      name: 'artist',
      selector: '',
      promptLabel: 'artist',
      formLabel: 'artist',
      transformer: Transformers.capitalizationTransformer,
    },
    {
      name: 'title',
      selector: '',
      promptLabel: 'title',
      formLabel: 'title',
      transformer: Transformers.capitalizationTransformer,
    },
    {
      name: 'releaseType',
      selector: '',
      promptLabel: 'release type',
      formLabel: 'type',
    },
    {
      name: 'date',
      selector: '',
      promptLabel: 'release date',
      formLabel: 'date',
      transformer: Transformers.dateTransformer,
    },
    {
      label: 'label',
      selector: '',
      promptLabel: 'label',
      formLabel: 'label',
    },
    {
      name: 'catalogId',
      selector: '',
      promptLabel: 'catalog #',
      formLabel: 'catalog #',
    },
    {
      name: 'country',
      selector: '',
      promptLabel: 'country',
      formLabel: 'country',
    },
    {
      name: 'trackPosition',
      selector: '',
      promptLabel: 'a track position',
      formLabel: 'track position',
      mapTo: 'tracks',
    },
    {
      name: 'trackTitle',
      selector: '',
      promptLabel: 'a track title',
      formLabel: 'track title',
      transformer: Transformers.capitalizationTransformer,
      mapTo: 'tracks',
    },
    {
      name: 'trackDuration',
      selector: '',
      promptLabel: 'a track duration',
      formLabel: 'track duration',
      transformer: Transformers.timeTransformer,
      mapTo: 'tracks',
    },
  ]);

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

  useEffect(() => {
    const selector = finder(selectedElm, {
      className: (n) => !n.startsWith(BASE_CLASS),
      idName: (n) => !n.startsWith(BASE_CLASS),
    });

    setData([
      ...data.slice(0, dataIndex),
      {
        ...data[dataIndex],
        selector,
      },
      ...data.slice(dataIndex),
    ]);

    setDataIndex(dataIndex + 1);
  }, selectedElm);

  const parseData = () => {
    const d = [...data];

    (d).forEach((field) => {
      if (field.selector) {
        const match = $(field.selector);
        const transformer = field.transformer || ((val) => val);

        console.log(match);

        if (match instanceof Array) {
          d.find((f) => f.name === field.mapTo).data = match.map((m) => transformer(m.text()));
        } else {
          // eslint-disable-next-line no-param-reassign
          field.data = transformer(match.text());
        }
      }
    });

    setData([...d]);
  };

  const guideUser = () => {
    (data).forEach((d) => {
      setPromptLabel(d.promptLabel);
    });
  };

  const submitForm = () => {
    if (artistInputRef.innerText) {
      setIsInvalidMessageDisplayed(false);

      window.postMessage({
        formData: { ...data },
      });
    } else {
      setIsInvalidMessageDisplayed(true);
    }
  };

  const template = Templates[document.location.hostname];

  if (template) {
    const d = [...data];

    Object.entries(template).forEach(([k, v]) => {
      d.find((f) => f.name === k).selector = v;
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
           && <h4 style={{ color: 'red', fontWeight: 'bold' }}>* Required</h4>}
          <br />
          <h4>Data:</h4>
          <ul id="rym__data">
            {Object.values(data).map((v) => (
              <li>
                <p><b>{`${v.formLabel}:`}</b></p>
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
