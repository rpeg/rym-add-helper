/** @jsx h */
/** @jsxFrag Fragment */
import {
  h, render, Component, Fragment,
} from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';

import '../style.scss';

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';
import {
  Field, Template, ReleaseTypes, Formats, DiscSpeeds,
} from './types';

const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;

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
  transformers: [Transformers.regexMapTransformerFactory(
    [
      {
        regex: 'album',
        mapTo: ReleaseTypes.Album,
      },
      {
        regex: 'comp',
        mapTo: ReleaseTypes.Comp,
      },
      {
        regex: 'ep',
        mapTo: ReleaseTypes.EP,
      },
      {
        regex: /(?:single)|(?:7")/,
        mapTo: ReleaseTypes.Single,
      },
      {
        regex: 'mixtape',
        mapTo: ReleaseTypes.Mixtape,
      },
      {
        regex: /mix(?!(?:tape))/,
        mapTo: ReleaseTypes.Mix,
      },
      {
        regex: /(?:bootleg)|(?:unauth)/,
        mapTo: ReleaseTypes.Bootleg,
      },
      {
        regex: /(video)|(vhs)|(dvd)|(blu-?ray)/,
        mapTo: ReleaseTypes.Video,
      },
    ],
    ReleaseTypes.Album,
  )],
};

const format : Field = {
  name: 'format',
  selector: '',
  formLabel: 'format',
  promptLabel: 'format',
  data: '',
  transformers: [Transformers.regexMapTransformerFactory(
    [
      {
        regex: /(vinyl)|(?:(?<!\w)LP(?!\w))|(album)|(gatefold)/,
        mapTo: Formats.Vinyl,
      },
      {
        regex: /(?<!\w)((?:CD)|(?:disc))(?!\w)/,
        mapTo: Formats.CD,
      },
      {
        regex: /(?<!\w)((?:mp3)|(?:digital)|(?:(?:f|a)lac)|(?:ogg))(?!\w)/,
        mapTo: Formats.DigitalFile,
      },
      {
        regex: /(blu-?ray)|((?<!\w)(BD)(?!\w))/,
        mapTo: Formats.BluRay,
      },
      {
        regex: /(?<!\w)(CD-?R)(?!\w)/,
        mapTo: Formats.CDR,
      },
      {
        regex: /dualdisc/,
        mapTo: Formats.DualDisc,
      },
      {
        regex: /(DVD)(?!\w)/,
        mapTo: Formats.DVD,
      },
      {
        regex: /dvd-?a/,
        mapTo: Formats.DVDA,
      },
      {
        regex: /dvd-?r/,
        mapTo: Formats.DVDR,
      },
      {
        regex: /HDAD/,
        mapTo: Formats.HDAD,
      },
      {
        regex: /HDCD/,
        mapTo: Formats.HDCD,
      },
      {
        regex: /laser/,
        mapTo: Formats.Laserdisc,
      },
      {
        regex: /minidisc/,
        mapTo: Formats.MiniDisc,
      },
      {
        regex: /SACD/,
        mapTo: Formats.SACD,
      },
      {
        regex: /UMD/,
        mapTo: Formats.UMD,
      },
      {
        regex: /VCD/,
        mapTo: Formats.VCD,
      },
      {
        regex: /shellac/,
        mapTo: Formats.Shellac,
      },
      {
        regex: /(8|(eight))\s?track/,
        mapTo: Formats.EightTrack,
      },
      {
        regex: /(4|(four))\s?track/,
        mapTo: Formats.FourTrack,
      },
      {
        regex: /acetate/,
        mapTo: Formats.Acetate,
      },
      {
        regex: /beta/,
        mapTo: Formats.Beta,
      },
      {
        regex: /(?<!(micro))cassette/,
        mapTo: Formats.Cassette,
      },
      {
        regex: /DAT/,
        mapTo: Formats.DAT,
      },
      {
        regex: /DCC/,
        mapTo: Formats.DCC,
      },
      {
        regex: /microcassette/,
        mapTo: Formats.Microcassette,
      },
      {
        regex: /playtape/,
        mapTo: Formats.PlayTape,
      },
      {
        regex: /reel-?to-?reel/,
        mapTo: Formats.ReelToReel,
      },
      {
        regex: /vhs/,
        mapTo: Formats.VHS,
      },
    ],
    Formats.Vinyl,
  )],
};

const discSize : Field = {
  name: 'discSize',
  selector: '',
  promptLabel: 'disc size',
  formLabel: 'disc size',
  data: '',
  dependsOnFieldValue: [format, Formats.Vinyl],
  transformers: [Transformers.discSizeTransformer],
};

const discSpeed : Field = {
  name: 'discSpeed',
  selector: '',
  promptLabel: 'disc speed',
  formLabel: 'disc speed',
  data: '',
  dependsOnFieldValue: [format, Formats.Vinyl],
  transformers: [Transformers.regexMapTransformerFactory(
    [
      {
        regex: /45/,
        mapTo: DiscSpeeds._45,
      },
      {
        regex: /16/,
        mapTo: DiscSpeeds._16,
      },
      {
        regex: /33/,
        mapTo: DiscSpeeds._33,
      },
      {
        regex: /78/,
        mapTo: DiscSpeeds._78,
      },
      {
        regex: /80/,
        mapTo: DiscSpeeds._80,
      },
    ],
    DiscSpeeds._45,
  )],
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
};

const fields = [
  artist,
  title,
  date,
  type,
  format,
  discSize,
  discSpeed,
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
        <li style={{ listStyleType: 'circle' }}>
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
    const template = Templates[document.location.hostname] as Template;

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
      // eslint-disable-next-line no-param-reassign
      field.data = parseField(field);
    });

    setData([...d]);
  };

  const parseField = (field: Field) => {
    const matches: Array<HTMLElement> = $(field.selector).toArray();

    const transformers = field.transformers || [function (val: any) { return val; }];

    const transformedData = matches.map((m) => transformers
      .reduce((acc, f) => f(acc), m.innerText.trim()));

    return field.data instanceof Array ? transformedData : transformedData.join(' ');
  };

  const submitForm = () => {
    const id = artistInputRef.current.value;

    if (id) {
      setIsInvalidMessageDisplayed(false);

      window.postMessage({
        formData: {
          url: window.location.href,
          id,
          ...data.map((d) => ({
            field: d.name,
            data: d.data,
          })),
        },
      }, '*'); // TODO communicate with background window
    } else {
      setIsInvalidMessageDisplayed(true);
    }
  };

  return (
    isFormDisplayed && (
      <Fragment>
        <div id="rym__form" className="rym__" style={{ top: 0, right: 0 }}>
          <div id="rym__form-inner">
            <p><b>RYM artist ID:</b></p>
            <input type="text" placeholder="e.g. Artist12345" ref={artistInputRef} />
            {isInvalidMessageDisplayed
           && <h4 style={{ color: 'red', fontWeight: 'bold' }}>* Required</h4>}
            <hr />
            <ul id="rym__data">
              {(data)
                .filter((d) => !d.dependsOnFieldValue
                               || data.find((f) => f === d.dependsOnFieldValue[0]).data === d.dependsOnFieldValue[1])
                .map((field, i) => (
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
      </Fragment>
    )
  );
};

export default App;
