/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
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

/** @jsx h */

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
      transformer: Transformers.textTransformer,
    },
    {
      name: 'title',
      selector: '',
      promptLabel: 'title',
      formLabel: 'title',
      transformer: Transformers.textTransformer,
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
      name: 'label',
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
      multiple: true,
    },
    {
      name: 'trackTitle',
      selector: '',
      promptLabel: 'a track title',
      formLabel: 'track title',
      multiple: true,
      transformer: Transformers.textTransformer,
    },
    {
      name: 'trackDuration',
      selector: '',
      promptLabel: 'a track duration',
      formLabel: 'track duration',
      multiple: true,
      transformer: Transformers.timeTransformer,
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

  /**
   * Update data with clicked-on element's css selector; iterate data index
   */
  useEffect(() => {
    if (!selectedElm) return;

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
  }, [selectedElm]);

  useEffect(() => {
    if (dataIndex >= data.length) {
      setIsSelecting(false);
    }
  }, [dataIndex]);

  const parseData = () => {
    const d = [...data];

    d.filter((field) => field.selector).forEach((field) => {
      const matches = $(field.selector).toArray();

      const transformer = field.transformer || function (val) { return val; };

      const transformedData = matches.map((m) => transformer(m.innerText.trim()));

      field.data = field.multiple ? transformedData : transformedData.join(' ');
    });

    setData([...d]);
  };

  const initGuide = () => {
    setPromptLabel(data[0].promptLabel);
    setIsSelecting(true);

    console.log('guide init');
  };

  const submitForm = () => {
    const id = artistInputRef.value;

    if (id) {
      setIsInvalidMessageDisplayed(false);

      const formData = data
        .filter((d) => !d.mapTo)
        .map((d) => ({
          name: d.name,
          data: d.data,
        }));

      window.postMessage({
        formData: {
          id,
          ...formData,
        },
      });
    } else {
      setIsInvalidMessageDisplayed(true);
    }
  };

  const template = Templates[document.location.hostname];

  if (template) {
    const d = [...data];

    Object.entries(template).forEach(([k, v]) => {
      const field = d.find((f) => f.name === k);
      if (field) field.selector = v;
    });

    setData(d);
    parseData();
    setDataIndex(data.length);
    setIsFormDisplayed(true);

    console.log(data);
  } else {
    initGuide();
    setIsFormDisplayed(true);
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
            {(data).map((field, i) => (
              <li style={{
                display: 'inline',
              }}
              >
                <img
                  src="../assets/edit.png"
                  alt="edit"
                  onClick={() => {
                    setDataIndex(i);
                    setIsSelecting(true);
                  }}
                />
                <p><b>{`${field.formLabel}:`}</b></p>
                {' '}
                {field.data || ''}
              </li>
            ))}
          </ul>
          <button id="rym__submit" type="button" onClick={submitForm}>Submit</button>
        </div>
      </div>
      {isSelecting && promptLabel && (
      <div id="rym__prompt-container">
        <h3 id="rym__prompt">
          {`Select ${promptLabel}`}
        </h3>
      </div>
      )}
    </>
    )
  );
};

export default App;
