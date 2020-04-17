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

import { useWindowEvent, useDocumentEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';
import {
  Field, Template, FormData, ReleaseTypes, Formats, DiscSpeeds, RYMDate, RYMTrack,
} from './types';
/* #endregion */

/* #region Constants */
const BASE_CLASS = 'rym__';
const HOVER_CLASS = `${BASE_CLASS}hover`;
const IFRAME_ID = 'rym__frame';
const VARIOUS_ARTISTS_ID = '5';

const artist : Field = {
  name: 'artist',
  selector: '',
  label: 'artist',
  default: '',
  transformers: [Transformers.textTransformer],
};

const title : Field = {
  name: 'title',
  selector: '',
  label: 'title',
  default: '',
  transformers: [Transformers.textTransformer],
};

const type : Field = {
  name: 'type',
  selector: '',
  label: 'type',
  default: '',
  placeholder: 'e.g. Album',
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
  placeholder: 'e.g. Vinyl',
  default: '',
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
  default: '',
  placeholder: 'e.g. 12"',
  dependency: [format, Formats.Vinyl],
  transformers: [Transformers.discSizeTransformer],
};

const discSpeed : Field = {
  name: 'discSpeed',
  selector: '',
  label: 'disc speed',
  default: '',
  placeholder: 'e.g. 45 rpm',
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
  label: 'release date',
  default: {},
  transformers: [Transformers.dateTransformer],
  format: (rymDate: RYMDate) => rymDate && Object.values(rymDate).filter((v) => v !== '00').join('/'),
};

const label : Field = {
  name: 'label',
  selector: '',
  label: 'label',
  default: '',
};

const catalogId : Field = {
  name: 'catalogId',
  selector: '',
  label: 'catalog #',
  default: '',
  transformers: [Transformers.catalogIdTransformer],
};

const countries : Field = {
  name: 'countries',
  selector: '',
  label: 'countries',
  default: [],
  transformers: [Transformers.countriesTransformer],
  format: (cs: Array<string>) => cs && cs.length && cs.join(', '),
};

const trackPositions : Field = {
  name: 'trackPositions',
  selector: '',
  label: 'a track position',
  placeholder: 'e.g. A1',
  default: [],
};

const trackArtists : Field = {
  name: 'trackArtists',
  selector: '',
  label: 'a track artist',
  default: [],
  disabled: true, // enabled when VA
};

const trackTitles : Field = {
  name: 'trackTitles',
  selector: '',
  label: 'a track title',
  default: [],
  transformers: [Transformers.textTransformer],
};

const trackDurations : Field = {
  name: 'trackDurations',
  selector: '',
  label: 'a track duration',
  default: [],
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
  trackArtists,
  trackTitles,
  trackDurations,
];
/* #endregion */

/* #region Components  */
type FormInputProps = {
  field: Field,
  disabled: boolean,
}

const FormInput = ({ field, disabled }: FormInputProps) => {
  const data = field.data instanceof Array && field.data.length
    ? field.data[0]
    : field.data;

  const formattedData = !_.isEmpty(data) && field.format
    ? field.format(data)
    : data;

  return (
    <input
      type="text"
      style={inputStyle}
      disabled={disabled}
      placeholder={field.placeholder ? field.placeholder : ''}
      value={!_.isEmpty(formattedData) ? formattedData : ''}
    />
  );
};
/* #endregion */

/* #region Styles */
const textStyle = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  color: 'black',
};

const floatingDivStyle = {
  backgroundColor: 'white',
  boxShadow: 'darkslategrey -5px 5px 15px',
  border: '1px solid darkslategrey',
};

const formPStyle = {
  margin: '10px 0 2px 0',
};

const formUlStyle = {
  padding: 0,
  margin: 0,
  maxWidth: '210px',
};

const formLiStyle = {
  padding: 0,
  margin: 0,
  listStyleType: 'none',
  listStylePosition: 'inside',
};

const inputStyle = {
  width: 'fit-content',
  flexGrow: 1,
  padding: '4px',
  border: '1px solid darkslategrey',
};

const buttonStyle = {
  display: 'inline-block',
  color: 'white',
  border: 'none',
  backgroundColor: '#4CAF50',
  textAlign: 'center',
  textDecoration: 'none',
  fontSize: '14px',
};

const accentButtonStyle = {
  ...buttonStyle,
  padding: '10px',
};
/* #endregion */

const App = ({ iframe }: { iframe: preact.RefObject<HTMLIFrameElement> }) => {
  /* #region State */
  const [isFormDisplayed, setIsFormDisplayed] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isGuiding, setIsGuiding] = useState(false);
  const [isVariousArtists, setIsVariousArtists] = useState(false);
  const [selectedElm, setSelectedElm] = useState(null);
  const [dataIndex, setDataIndex] = useState(0);
  const [data, setData] = useState(fields);

  const artistInputRef = useRef<HTMLInputElement>(null);
  /* #endregion */

  /* #region Hooks */
  const isElmInForm = (e: MouseEvent) => e.target instanceof Node
    && document.querySelector(`#${IFRAME_ID}`).contains(e.target as Node);

  useWindowEvent('mouseover', _.throttle((e: MouseEvent) => {
    if (isSelecting && !isElmInForm(e)) {
      (e.srcElement as HTMLElement).classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', (e: MouseEvent) => {
    (e.srcElement as HTMLElement).classList.remove(HOVER_CLASS);
  }, isFormDisplayed);

  /**
   * Capture user's DOM selection and prevent redirects
   */
  useDocumentEvent('click', (e: MouseEvent) => {
    if (isElmInForm(e)) return true;

    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    e.preventDefault();

    setSelectedElm(e.target);

    return false;
  }, isFormDisplayed);

  /**
   * Update data with clicked-on element's css selector
   */
  useEffect(() => {
    if (!selectedElm) return;

    let selector;

    try {
      selector = finder(selectedElm, {
        className: (n) => !n.startsWith(BASE_CLASS),
        idName: (n) => !n.startsWith(BASE_CLASS),
      });

      const currentField = data[dataIndex];

      const _data = update(data,
        {
          [dataIndex]:
          {
            selector: { $set: selector },
            data: { $set: pruneDataFromDOM(selector, currentField) },
          },
        });

      setData(_data);

      if (isGuiding) {
        nextField();
      } else { setIsSelecting(false); }
    } catch (e) {}
  }, [selectedElm]);

  useEffect(() => {
    const artistIndex = data.findIndex((f) => f.name === artist.name);
    const trackArtistsIndex = data.findIndex((f) => f.name === trackArtists.name);

    const _data = update(data,
      {
        [artistIndex]:
          {
            disabled: { $set: isVariousArtists },
          },
        [trackArtistsIndex]:
          {
            disabled: { $set: !isVariousArtists },
          },
      });

    setData(_data);
  }, [isVariousArtists]);

  /**
   * Initialization
   */
  useEffect(() => {
    // have to use native DOM listener to prevent browser redirects
    // because React's synthetic events fire after parent's
    $(document).ready(() => {
      $('a').click((e) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedElm(e.target);
      });
    });

    const template = Templates[document.location.hostname] as Template;

    if (template) {
      processTemplate(template);
    } else {
      setIsFormDisplayed(true);
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
      field.data = pruneDataFromDOM(field.selector, field);
    });

    setData([...d]);
  };

  const pruneDataFromDOM = (selector: string, field: Field) => {
    const matches = _.intersection(
      $(window.parent.document).find(selector).toArray(),
    );

    const transformers = field.transformers || [function (val: any) { return val; }];

    const transformedData = matches.map((m) => transformers
      .reduce((acc, f) => f(acc), (m as any).innerText.trim()));

    if (typeof field.default === 'string') return transformedData.join(' ');
    if (field.default instanceof Array) return transformedData;
    if (field.default instanceof Object) return _.first(transformedData);

    return transformedData;
  };

  const submitForm = () => {
    let id = '';

    if (isVariousArtists) {
      id = VARIOUS_ARTISTS_ID;
    } else {
      const matches = artistInputRef.current.value.match(/\d+/);
      if (matches && matches.length) {
        id = _.head(matches);
      }
    }

    if (id) {
      const formData: FormData = {
        url: window.location.href,
        id,
        artist: getDataForField(artist.name) as string,
        title: getDataForField(title.name) as string,
        type: getDataForField(type.name)as string,
        format: getDataForField(format.name) as string,
        discSize: getDataForField(discSize.name) as string,
        discSpeed: getDataForField(discSpeed.name) as string,
        date: getDataForField(date.name) as RYMDate,
        label: getDataForField(label.name) as string,
        catalogId: getDataForField(catalogId.name) as string,
        countries: getDataForField(countries.name) as Array<string>,
        tracks: getTracks(),
      };

      console.log(data);

      window.postMessage(
        {
          type: 'rym_submit',
          formData,
        }, '*',
      );
    } else {
      alert('Enter a valid RYM artist ID');
    }
  };

  const getTracks = () => {
    const tracks: Array<RYMTrack> = [];

    const positions = (getDataForField(trackPositions.name) as Array<string>) ?? [];
    const artists = (getDataForField(trackArtists.name) as Array<string>) ?? [];
    const titles = (getDataForField(trackTitles.name) as Array<string>) ?? [];
    const durations = (getDataForField(trackDurations.name) as Array<string>) ?? [];

    const max = _.max([
      positions.length,
      artists.length,
      titles.length,
      durations.length,
    ]);

    _.range(0, max).forEach((i) => tracks.push({
      position: positions && positions[i] ? positions[i] : '',
      artist: artists && artists[i] ? artists[i] : '',
      title: titles && titles[i] ? titles[i] : '',
      duration: durations && durations[i] ? durations[i] : '',
    }));

    return tracks;
  };

  const clearField = (i: number) => {
    const _data = update(data,
      {
        [i]:
          {
            data: { $set: null },
          },
      });

    setData(_data);
  };

  const nextField = () => {
    let index;

    for (index = dataIndex + 1; index < data.length && !isFieldEnabled(data[index]); index++);

    setDataIndex(index);
  };

  const isFieldEnabled = (field: Field) => !field.disabled && (!field.dependency
    || data.find((f) => f.name === (field.dependency as [Field, any])[0].name)
      ?.data === (field.dependency as [Field, any])[1]);

  const getDataForField = (name: string) => data.find((d) => d.name === name)?.data;
  /* #endregion */

  /* #region Render */
  return (
    isFormDisplayed && (
      <Fragment>
        {isSelecting && (
        <div
          style={{
            position: 'fixed',
            zIndex: '10000',
            bottom: '10px',
            width: '100%',
          }}
        >
          <div
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              width: 'fit-content',
              padding: 10,
              ...floatingDivStyle,
            }}
          >
            <p style={textStyle}>
              <b>{`Select ${data[dataIndex].label}`}</b>
            </p>
            <div style={{ display: 'flex ' }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                }}
                onClick={() => nextField()}
              >
                Skip
              </button>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  margin: '0px 5px',
                }}
                onClick={() => clearField(dataIndex)}
              >
                Clear
              </button>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                }}
                onClick={() => {
                  setIsGuiding(false);
                  setIsSelecting(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        )}
        <div
          style={{
            top: 0,
            right: 0,
          }}
        >
          <div>
            <p style={{ ...textStyle, margin: '0 0 10px 0' }}>
              <b>RYM artist ID:</b>
            </p>
            <input
              style={inputStyle}
              type="text"
              placeholder="e.g. Artist12345"
              ref={artistInputRef}
            />
            <div style={{ marginTop: 4 }}>
              <input
                type="checkbox"
                checked={isVariousArtists}
                onClick={() => setIsVariousArtists(!isVariousArtists)}
              />
              <label
                htmlFor="rym__va_box"
                style={{ paddingLeft: 4, ...textStyle }}
              >
                various artists
              </label>
            </div>
            <hr />
            <ul style={formUlStyle}>
              <button
                style={accentButtonStyle}
                type="button"
                onClick={() => {
                  setDataIndex(0);
                  setIsGuiding(true);
                  setIsSelecting(true);
                }}
              >
                Guide Me
              </button>
              {(data).map((field, i) => (
                <li style={formLiStyle}>
                  <p
                    style={{
                      ...textStyle,
                      ...formPStyle,
                    }}
                  >
                    <b style={i === dataIndex && isSelecting ? { backgroundColor: '#FFFF00' } : {}}>
                      {`${field.label}:`}
                    </b>
                  </p>
                  <div style={{ display: 'flex' }}>
                    <FormInput
                      field={field}
                      disabled={!isFieldEnabled(field) || (isSelecting && dataIndex !== i)}
                    />
                    <button
                      type="button"
                      disabled={isSelecting}
                      onClick={() => {
                        setIsSelecting(true);
                        setDataIndex(i);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </li>
              ))}
              <hr />
              <li>
                <p style={textStyle}><b>Tracks:</b></p>
                <ul style={formUlStyle}>
                  {getTracks().map((t) => (
                    <li style={{ listStyleType: 'disc' }}>
                      <p style={textStyle}>
                        {`${t.position ? `${t.position}.` : ''} 
                        ${t.artist ? `${t.artist} - ` : ''}
                        ${t.title} 
                        ${t.duration ? `(${t.duration})` : ''}`}
                      </p>
                    </li>
                  ))}
                </ul>
              </li>
              <hr />
            </ul>
            <button
              style={accentButtonStyle}
              type="button"
              onClick={submitForm}
            >
              Submit
            </button>
            <div style={{ height: '110px' }} />
          </div>
        </div>
      </Fragment>
    )
  );
  /* #endregion */
};

export default App;
