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

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

interface Field {
  name: string,
  selector: string,
  promptLabel: string,
  formLabel: string,
  data: string | Array<string>,
  transformers?: Array<Function>,
}

/**
 * Fields
 */
const artist : Field = {
  name: 'artist',
  selector: '',
  formLabel: 'artist',
  promptLabel: 'artist',
  data: '',
  transformers: [Transformers.textTransformer],
};

const title : Field = {
  name: 'title',
  selector: '',
  formLabel: 'title',
  promptLabel: 'title',
  data: '',
  transformers: [Transformers.textTransformer],
};

const type : Field = {
  name: 'type',
  selector: '',
  promptLabel: 'type',
  formLabel: 'type',
  data: '',
  transformers: [Transformers.releaseTypeTransformer],
};

const format : Field = {
  name: 'format',
  selector: '',
  formLabel: 'format',
  promptLabel: 'format',
  data: '',
};

const discSize : Field = {
  name: 'discSize',
  selector: '',
  promptLabel: 'disc size',
  formLabel: 'disc size',
  data: '',
  transformers: [Transformers.discSizeTransformer],
};

const date : Field = {
  name: 'date',
  selector: '',
  promptLabel: 'date',
  formLabel: 'date',
  data: '',
  transformers: [Transformers.dateTransformer],
};

const label : Field = {
  name: 'label',
  selector: '',
  formLabel: 'label',
  promptLabel: 'label',
  data: '',
};

const catalogId : Field = {
  name: 'catalogId',
  selector: '',
  promptLabel: 'catalog #',
  formLabel: 'catalog #',
  data: '',
  transformers: [Transformers.catalogIdTransformer],
};

const country : Field = {
  name: 'country',
  selector: '',
  formLabel: 'country',
  promptLabel: 'country',
  data: '',
};

const trackPositions : Field = {
  name: 'trackPositions',
  selector: '',
  promptLabel: 'a track position',
  formLabel: 'a track position',
  data: [],
};

const trackTitles : Field = {
  name: 'trackTitles',
  selector: '',
  promptLabel: 'a track title',
  formLabel: 'a track title',
  data: [],
  transformers: [Transformers.textTransformer],
};

const trackDurations : Field = {
  name: 'trackDurations',
  selector: '',
  promptLabel: 'a track duration',
  formLabel: 'a track duration',
  data: [],
  transformers: [Transformers.timeTransformer],
};

const fields = [
  artist,
  title,
  type,
  format,
  discSize,
  date,
  label,
  catalogId,
  country,
  trackPositions,
  trackTitles,
  trackDurations,
];

const isElmInForm = (e: MouseEvent) => e && (e.srcElement as HTMLTextAreaElement)
  && (e.srcElement as HTMLTextAreaElement).offsetParent
  && (e.srcElement as HTMLTextAreaElement).offsetParent.classList
  && [...(e.srcElement as HTMLTextAreaElement).offsetParent.classList].includes(BASE_CLASS);

type TrackListProps = {
  positions: Array<string>,
  titles: Array<string>,
  durations: Array<string>,
}

const TrackList = ({ positions, titles, durations }: TrackListProps) => {
  const maxIndex = _.min([
    positions.length,
    titles.length,
    durations.length,
  ]);

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

const App = () => {
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isInvalidMessageDisplayed, setIsInvalidMessageDisplayed] = useState(false);
  const [selectedElm, setSelectedElm] = useState(null);
  const [dataIndex, setDataIndex] = useState(0);
  const [data, setData] = useState(fields);

  const artistInputRef = useRef<HTMLInputElement>(null);

  useWindowEvent('mouseover', _.throttle((e: MouseEvent) => {
    if (isSelecting && !isElmInForm(e)) {
      (e.srcElement as HTMLTextAreaElement).classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', (e: MouseEvent) => {
    (e.srcElement as HTMLTextAreaElement).classList.remove(HOVER_CLASS);
  }, isFormDisplayed);

  useWindowEvent('click', (e: MouseEvent) => {
    e.preventDefault();

    if ((e.srcElement as HTMLTextAreaElement).classList.contains(HOVER_CLASS)) {
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
        if (field) field.selector = v as string;
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
    const id = artistInputRef.current.value;

    if (id) {
      setIsInvalidMessageDisplayed(false);

      const formData = data
        .map((d) => ({
          name: d.name,
          data: d.data,
        }));

      window.postMessage({
        formData: {
          id,
          ...formData,
        },
      }, '*'); // TODO communicate with background
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
                <input type="text" value={field.data instanceof Array ? field.data[0] : field.data} />
              </li>
            ))}
            <hr />
            <li>
              <p><b>Tracks:</b></p>
              <TrackList
                positions={data.find((f) => f.name === trackPositions.name).data as Array<string>}
                titles={data.find((f) => f.name === trackTitles.name).data as Array<string>}
                durations={data.find((f) => f.name === trackDurations.name).data as Array<string>}
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
