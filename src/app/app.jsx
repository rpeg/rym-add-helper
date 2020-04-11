/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/** @jsx h */
/** @jsxFrag Fragment */
import {
  h, render, Component, Fragment,
} from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';
import PropTypes from 'prop-types';

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

const isElmInForm = (e) => e && e.srcElement
  && e.srcElement.offsetParent
  && e.srcElement.offsetParent.classList
  && [...e.srcElement.offsetParent.classList].includes(BASE_CLASS);

const TrackList = ({ positions, titles, durations }) => {
  const maxIndex = _.min(
    positions.length,
    titles.length,
    durations.length,
  );

  return (
    <ul>
      {_.range(0, maxIndex).map((i) => (
        <li>
          {`${positions[i]}|${titles[i]}|${durations[i]}`}
        </li>
      ))}
    </ul>
  );
};

TrackList.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.string),
  titles: PropTypes.arrayOf(PropTypes.string),
  durations: PropTypes.arrayOf(PropTypes.string),
};

TrackList.defaultProps = {
  positions: [],
  titles: [],
  durations: [],
};

const App = () => {
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isInvalidMessageDisplayed, setIsInvalidMessageDisplayed] = useState(false);
  const [selectedElm, setSelectedElm] = useState(null);
  const [dataIndex, setDataIndex] = useState(0);
  const [data, setData] = useState([
    {
      name: 'artist',
      selector: '',
      formLabel: 'artist',
      data: '',
      transformer: Transformers.textTransformer,
    },
    {
      name: 'title',
      selector: '',
      formLabel: 'title',
      data: '',
      transformer: Transformers.textTransformer,
    },
    {
      name: 'type',
      selector: '',
      promptLabel: 'type',
      formLabel: 'type',
      data: '',
      transformer: Transformers.releaseTypeTransformer,
    },
    {
      name: 'format',
      selector: '',
      promptLabel: 'format',
      formLabel: 'format',
      data: '',
    },
    {
      name: 'discSize',
      selector: '',
      promptLabel: 'disc size',
      formLabel: 'disc size',
      data: '',
      transformer: Transformers.discSizeTransformer,
    },
    {
      name: 'date',
      selector: '',
      promptLabel: 'release date',
      formLabel: 'date',
      data: null,
      transformer: Transformers.dateTransformer,
    },
    {
      name: 'label',
      label: 'label',
      selector: '',
      promptLabel: 'label',
      formLabel: 'label',
      data: '',
    },
    {
      name: 'catalogId',
      selector: '',
      promptLabel: 'catalog #',
      formLabel: 'catalog #',
      data: '',
      transformer: Transformers.catalogIdTransformer,
    },
    {
      name: 'country',
      selector: '',
      promptLabel: 'country',
      formLabel: 'country',
      data: '',
    },
    {
      name: 'trackPositions',
      selector: '',
      promptLabel: 'a track position',
      formLabel: 'a track position',
      data: [],
      multiple: true,
    },
    {
      name: 'trackTitles',
      selector: '',
      promptLabel: 'a track title',
      formLabel: 'a track title',
      data: [],
      multiple: true,
      transformer: Transformers.textTransformer,
    },
    {
      name: 'trackDurations',
      selector: '',
      promptLabel: 'a track duration',
      formLabel: 'a track duration',
      data: [],
      multiple: true,
      transformer: Transformers.timeTransformer,
    },
  ]);

  const artistInputRef = useRef(null);

  useWindowEvent('mouseover', _.throttle((e) => {
    if (isSelecting && !isElmInForm(e)) {
      e.srcElement.classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', (e) => {
    e.srcElement.classList.remove(HOVER_CLASS);
  }, isFormDisplayed);

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

  /**
   * Load template if available for host
   */
  useEffect(() => {
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
      setIsSelecting(true);
    }
  }, []);

  const parseData = () => {
    const d = [...data];

    d.filter((field) => field.selector).forEach((field) => {
      field.data = parseField(field);
    });

    setData([...d]);
  };

  const parseField = (field) => {
    const matches = $(field.selector).toArray();

    const transformer = field.transformer || function (val) { return val; };

    const transformedData = matches.map((m) => transformer(m.innerText.trim()));

    return field.multiple ? transformedData : transformedData.join(' ');
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

  return (
    isFormDisplayed && (
    <>
      <div id="rym__form" className="rym__" style={{ top: 0, right: 0 }}>
        <div id="rym__form-inner" className="rym__">
          <p><b>RYM artist ID:</b></p>
          <input type="text" placeholder="e.g. Artist12345" ref={artistInputRef} />
          {isInvalidMessageDisplayed
           && <h4 style={{ color: 'red', fontWeight: 'bold' }}>* Required</h4>}
          <hr />
          <ul id="rym__data">
            {(data).map((field, i) => (
              <li>
                {/* <img
                  src="../assets/edit.png"
                  alt="edit"
                  onClick={() => {
                    setDataIndex(i);
                    setIsSelecting(true);
                  }}
                /> */}
                <p><b>{`${field.formLabel}:`}</b></p>
                <input type="text" value={field.multiple ? field.data[0] : field.data} />
              </li>
            ))}
            <hr />
            <li>
              <p><b>Tracks:</b></p>
              <TrackList
                positions={data.find((f) => f.name === 'trackPositions').data}
                titles={data.find((f) => f.name === 'trackTitles').data}
                durations={data.find((f) => f.name === 'durations').data}
              />
            </li>
          </ul>
          <button id="rym__submit" type="button" onClick={submitForm}>Submit</button>
        </div>
      </div>
    </>
    )
  );
};

export default App;
