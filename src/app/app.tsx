/** @jsx h */
/** @jsxFrag Fragment */
/* #region Imports */
import {
  h, render, Component, Fragment,
} from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import update from 'immutability-helper';
import finder from '@medv/finder';
import _ from 'lodash';
import $ from 'jquery';

import '../style.scss';

import { useWindowEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';
import {
  Field, Template, ReleaseTypes, Formats, DiscSpeeds, RYMDate, FormData, RYMTrack,
} from './types';
/* #endregion */

/* #region Constants */
const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const VARIOUS_ARTISTS_ID = '5';

const artist : Field = {
  name: 'artist',
  selector: '',
  label: 'artist',
  data: '',
  transformers: [Transformers.textTransformer],
};

const title : Field = {
  name: 'title',
  selector: '',
  label: 'title',
  data: '',
  transformers: [Transformers.textTransformer],
};

const type : Field = {
  name: 'type',
  selector: '',
  label: 'type',
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
  label: 'format',
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
  label: 'disc size',
  data: '',
  dependency: [format, Formats.Vinyl],
  transformers: [Transformers.discSizeTransformer],
};

const discSpeed : Field = {
  name: 'discSpeed',
  selector: '',
  label: 'disc speed',
  data: '',
  dependency: [format, Formats.Vinyl],
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
  label: 'date',
  data: {},
  transformers: [Transformers.dateTransformer],
  format: (rymDate: RYMDate) => Object.values(rymDate).filter((v) => v).join('/'),
};

const label : Field = {
  name: 'label',
  selector: '',
  label: 'label',
  data: '',
};

const catalogId : Field = {
  name: 'catalogId',
  selector: '',
  label: 'catalog #',
  data: '',
  transformers: [Transformers.catalogIdTransformer],
};

const countries : Field = {
  name: 'countries',
  selector: '',
  label: 'countries',
  data: [],
};

const trackPositions : Field = {
  name: 'trackPositions',
  selector: '',
  label: 'a track position',
  data: [],
};

const trackTitles : Field = {
  name: 'trackTitles',
  selector: '',
  label: 'a track title',
  data: [],
  transformers: [Transformers.textTransformer],
};

const trackDurations : Field = {
  name: 'trackDurations',
  selector: '',
  label: 'a track duration',
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
  countries,
  trackPositions,
  trackTitles,
  trackDurations,
];
/* #endregion */

/* #region Helpers */
const isElmInForm = (e: MouseEvent) => e && (e.srcElement as HTMLTextAreaElement)
  && (e.srcElement as HTMLTextAreaElement).offsetParent
  && (e.srcElement as HTMLTextAreaElement).offsetParent.classList
  && [...(e.srcElement as HTMLTextAreaElement).offsetParent.classList].includes(BASE_CLASS);
/* #endregion */

/* #region FormInput  */
type FormInputProps = {
  field: Field,
  isSelectingField: boolean,
}

const FormInput = ({ field, isSelectingField }: FormInputProps) => {
  const data = field.data instanceof Array
    ? field.data[0]
    : field.data;

  const formattedData = field.format
    ? field.format(data)
    : data;

  return (
    <input
      type="text"
      disabled={!isSelectingField}
      value={formattedData}
    />
  );
};
/* #endregion */

/* #region TrackList */
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
        <li style={{ listStyleType: 'disc' }}>
          {`${positions[i]}|${titles[i]}|${durations[i]}`}
        </li>
      ))}
    </ul>
  );
};
/* #endregion TrackList */

const App = () => {
  /* #region State */
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGuiding, setIsGuiding] = useState(false);
  const [isInvalidMessageDisplayed, setIsInvalidMessageDisplayed] = useState(false);
  const [isVariousArtists, setIsVariousArtists] = useState(false);
  const [selectedElm, setSelectedElm] = useState(null);
  const [dataIndex, setDataIndex] = useState(0);
  const [data, setData] = useState(fields);

  const artistInputRef = useRef<HTMLInputElement>(null);
  /* #endregion */

  /* #region Hooks */
  useWindowEvent('mouseover', _.throttle((e: MouseEvent) => {
    if (isSelecting && !isElmInForm(e)) {
      (e.srcElement as HTMLTextAreaElement).classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', (e: MouseEvent) => {
    (e.srcElement as HTMLTextAreaElement).classList.remove(HOVER_CLASS);
  }, isFormDisplayed);

  useWindowEvent('click', (e: MouseEvent) => {
    if ((e.srcElement as HTMLTextAreaElement).classList.contains(HOVER_CLASS)) {
      e.preventDefault();
      setSelectedElm(e.target);
      return false;
    }

    return true;
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

    const fieldData = parseField(selector, data[dataIndex]);

    const _data = update(data,
      {
        [dataIndex]:
          {
            selector: { $set: selector },
            data: { $set: fieldData },
          },
      });

    setData(_data);
    setDataIndex(dataIndex + 1);
  }, [selectedElm]);

  useEffect(() => {
    if (dataIndex >= data.length) {
      setIsSelecting(false);
      setIsGuiding(false);
    }
  }, [dataIndex]);

  useEffect(() => {
    const index = data.findIndex((f) => f.name === artist.name) ?? 0;

    const _data = update(data,
      {
        [index]:
          {
            disabled: { $set: isVariousArtists },
          },
      });

    setData(_data);
  }, [isVariousArtists]);

  useEffect(() => {
    const template = Templates[document.location.hostname] as Template;

    if (template) {
      processTemplate(template);
    } else {
      setIsSelecting(true);
    }
  }, []);
  /* #endregion */

  /* #region Methods */
  const processTemplate = (template: Template) => {
    const d = [...data];

    Object.entries(template).forEach(([k, v]) => {
      const field = d.find((f) => f.name === k);
      if (field) field.selector = v as string;
    });

    setData(d);
    parseData();
    setDataIndex(data.length);
    setIsFormDisplayed(true);
  };

  const parseData = () => {
    const d = [...data];

    d.filter((field) => field.selector).forEach((field) => {
      // eslint-disable-next-line no-param-reassign
      field.data = parseField(field.selector, field);
    });

    setData([...d]);
  };

  const parseField = (selector: string, field: Field) => {
    const matches: Array<HTMLElement> = $(selector).toArray();

    const transformers = field.transformers || [function (val: any) { return val; }];

    const transformedData = matches.map((m) => transformers
      .reduce((acc, f) => f(acc), m.innerText.trim()));

    if (typeof field.data === 'string') return transformedData.join(' ');
    if (field.data instanceof Array) return transformedData;
    if (field.data instanceof Object) return _.first(transformedData);

    return transformedData;
  };

  const submitForm = () => {
    const id = isVariousArtists
      ? VARIOUS_ARTISTS_ID
      : artistInputRef.current.value;

    if (id) {
      setIsInvalidMessageDisplayed(false);

      const positions = (getFieldData(trackPositions.name) as Array<string>);
      const titles = (getFieldData(trackTitles.name) as Array<string>);
      const durations = (getFieldData(trackDurations.name) as Array<string>);

      const numTracks = _.min([positions.length, titles.length, durations.length]);

      const tracks: Array<RYMTrack> = [];

      _.range(0, numTracks).forEach((i) => tracks.push({
        position: positions[i],
        title: titles[i],
        duration: durations[i],
      }));

      const formData: FormData = {
        url: window.location.href,
        artist: getFieldData(artist.name) as string,
        title: getFieldData(title.name) as string,
        type: getFieldData(type.name)as string,
        format: getFieldData(format.name) as string,
        discSize: getFieldData(discSize.name) as string,
        discSpeed: getFieldData(discSpeed.name) as string,
        date: getFieldData(date.name) as RYMDate,
        label: getFieldData(label.name) as string,
        catalogId: getFieldData(catalogId.name) as string,
        countries: getFieldData(countries.name) as Array<string>,
        tracks,
      };

      window.postMessage(
        {
          type: 'rym_submit',
          formData,
        }, '*',
      );
    } else {
      setIsInvalidMessageDisplayed(true);
    }
  };

  const getFieldData = (name: string) => data.find((d) => d.name === name)?.data;
  /* #endregion */

  /* #region Render */
  return (
    isFormDisplayed && (
      <Fragment>
        {isGuiding && (
          <div
            id="rym__prompt"
            style={{
              position: 'fixed',
              zIndex: '10000',
              bottom: 25,
              width: '100%',
            }}
          >
            <div
              className="rym__floating_container"
              style={{
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto',
                width: 'fit-content',
                padding: 10,
              }}
            >
              <p><b>{`Select ${data[dataIndex]?.label}`}</b></p>
              <button
                id="rym__skip"
                type="button"
                style={{ marginLeft: 10 }}
                onClick={() => setDataIndex(dataIndex + 1)}
              >
                Skip
              </button>
            </div>
          </div>
        )}
        <div id="rym__form" className="rym__ rym__floating_container" style={{ top: 0, right: 0 }}>
          <div id="rym__form-inner">
            <p><b>RYM artist ID:</b></p>
            <input type="text" placeholder="e.g. Artist12345" ref={artistInputRef} />
            <div style={{ marginTop: 4 }}>
              <input
                type="checkbox"
                checked={isVariousArtists}
                onClick={() => setIsVariousArtists(!isVariousArtists)}
              />
              <label htmlFor="rym__va_box" style={{ paddingLeft: 4 }}>various artists</label>
            </div>
            {isInvalidMessageDisplayed
              && <h4 style={{ color: 'red', fontWeight: 'bold' }}>* Required</h4>}
            <hr />
            <ul id="rym__data">
              <button
                id="rym__guideme"
                className="rym__button-primary"
                type="button"
                onClick={() => setIsGuiding(true)}
              >
                Guide Me
              </button>
              {(data).map((field, i) => (!field.dependency
                || data.find((f) => f === (field.dependency as [Field, string])[0])
                      ?.data === (field.dependency as [Field, string])[1])
                    && (
                    <li>
                      <p>
                        <b style={i === dataIndex ? { backgroundColor: '#FFFF00' } : {}}>
                          {`${field.label}:`}
                        </b>
                      </p>
                      <div style={{ display: 'flex' }}>
                        <FormInput
                          field={field}
                          isSelectingField={isSelecting && dataIndex === i}
                        />
                        <button
                          type="button"
                          disabled={field.disabled || isGuiding}
                          onClick={() => {
                            setIsSelecting(true);
                            setDataIndex(i);
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                    ))}
              <hr />
              <li>
                <p><b>Tracks:</b></p>
                <TrackList
                  positions={getFieldData(trackPositions.name) as Array<string>}
                  titles={getFieldData(trackTitles.name) as Array<string>}
                  durations={getFieldData(trackDurations.name)as Array<string>}
                />
              </li>
            </ul>
            <button
              id="rym__submit"
              className="rym__button-primary"
              type="button"
              onClick={submitForm}
            >
              Submit
            </button>
          </div>
        </div>
      </Fragment>
    )
  );
  /* #endregion */
};

export default App;
