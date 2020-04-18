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
import parseDomain from 'parse-domain';

import '../style.scss';

import { useWindowEvent, useDocumentEvent } from './utils/hooks';
import Transformers from './utils/transformers';
import Templates from './utils/templates';
import {
  HashMap, Field, Template, FormData, ReleaseTypes, Formats, DiscSpeeds, RYMDate, RYMTrack,
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
  dataTransformers: [Transformers.textTransformer],
};

const title : Field = {
  name: 'title',
  selector: '',
  label: 'title',
  default: '',
  dataTransformers: [Transformers.textTransformer],
};

const type : Field = {
  name: 'type',
  selector: '',
  label: 'type',
  default: '',
  placeholder: 'e.g. Album',
  dataTransformers: [Transformers.regexMapTransformerFactory(
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
  dataTransformers: [Transformers.regexMapTransformerFactory(
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
        regex: /(?<!\w)((?:mp3)|(?:streaming)|(?:download)|(?:digital)|(?:(?:f|a)lac)|(?:ogg))(?!\w)/,
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
  dataTransformers: [Transformers.discSizeTransformer],
};

const discSpeed : Field = {
  name: 'discSpeed',
  selector: '',
  label: 'disc speed',
  default: '',
  placeholder: 'e.g. 45 rpm',
  dependency: [format, Formats.Vinyl],
  dataTransformers: [Transformers.regexMapTransformerFactory(
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
  dataTransformers: [Transformers.dateTransformer],
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
  dataTransformers: [Transformers.catalogIdTransformer],
};

const countries : Field = {
  name: 'countries',
  selector: '',
  label: 'countries',
  default: [],
  dataTransformers: [Transformers.countriesTransformer],
  format: (cs: Array<string>) => cs && cs.length && cs.join(', '),
};

const trackPositions : Field = {
  name: 'trackPositions',
  selector: '',
  label: 'a track position',
  placeholder: 'e.g. A1',
  default: [],
  selectorTransformer: Transformers.removeNthChild,
  dataTransformers: [(position: string) => position.replace(/\.+$/, '')], // remove trailing period
};

const trackArtists : Field = {
  name: 'trackArtists',
  selector: '',
  label: 'a track artist',
  default: [],
  disabled: true, // enabled when VA
  selectorTransformer: Transformers.removeNthChild,
};

const trackTitles : Field = {
  name: 'trackTitles',
  selector: '',
  label: 'a track title',
  default: [],
  dataTransformers: [Transformers.textTransformer],
  selectorTransformer: Transformers.removeNthChild,
};

const trackDurations : Field = {
  name: 'trackDurations',
  selector: '',
  label: 'a track duration',
  default: [],
  selectorTransformer: Transformers.removeNthChild,
};

const _fields = [
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
  const [template, setTemplate] = useState(null);
  const [selectedElm, setSelectedElm] = useState(null);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [fields, setFields] = useState(_fields);

  const artistInputRef = useRef<HTMLInputElement>(null);
  /* #endregion */

  /* #region Hooks */
  const isElmInForm = (e: MouseEvent) => e.target instanceof Node
    && document.querySelector(`#${IFRAME_ID}`).contains(e.target as Node);

  const initListeners = () => {
    // have to use native DOM listener to prevent browser redirects
    // because React's synthetic events fire after parent's
    $(document).ready(() => {
      $('a').click((e) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedElm(e.target);
      });
    }); // TODO register on app untoggle
  };

  useWindowEvent('mouseover', _.throttle((e: MouseEvent) => {
    e.preventDefault();
    if (isSelecting && !isElmInForm(e)) {
      (e.srcElement as HTMLElement).classList.add(HOVER_CLASS);
    }
  }, 200), isFormDisplayed);

  useWindowEvent('mouseout', (e: MouseEvent) => {
    (e.srcElement as HTMLElement).classList.remove(HOVER_CLASS);
  }, isFormDisplayed);

  useDocumentEvent('click', (e: MouseEvent) => {
    if (isElmInForm(e)) return true;

    if (e.stopImmediatePropagation) {
      e.stopImmediatePropagation();
    }

    if (e.stopPropagation) {
      e.stopPropagation();
    }

    e.preventDefault();

    (e.target as HTMLElement).onmouseover = null;

    setSelectedElm(e.target);

    return false;
  }, isFormDisplayed);

  /**
   * Update data with clicked-on element's css selector
   */
  useEffect(() => {
    if (!selectedElm) return;

    const currentField = fields[fieldIndex];

    let selector;

    try {
      selector = finder(selectedElm, {
        className: (n) => !n.includes(BASE_CLASS) && !/hover|mouse/.test(n), // TODO find better way to ignore mouseover class
        idName: (n) => !n.includes(BASE_CLASS),
      });

      if (selector && currentField.selectorTransformer) {
        selector = currentField.selectorTransformer(selector);
      }

      console.info(selector);

      const newData = update(fields,
        {
          [fieldIndex]:
          {
            selector: { $set: selector },
            data: { $set: pruneDataFromDOM(selector, currentField) },
          },
        });

      setFields(newData);

      if (isGuiding) {
        nextField();
      } else { setIsSelecting(false); }
    } catch (e) {
      console.warn('invalid selector', e);
    }
  }, [selectedElm]);

  useEffect(() => {
    const artistIndex = fields.findIndex((f) => f.name === artist.name);
    const trackArtistsIndex = fields.findIndex((f) => f.name === trackArtists.name);

    const _data = update(fields,
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

    setFields(_data);
  }, [isVariousArtists]);

  /**
   * Initialization
   */
  useEffect(() => {
    initListeners();

    const { domain } = parseDomain(window.location.href);

    const temp = getLocalTemplate() || Templates[domain] as Template;

    if (temp) {
      processTemplate(temp);
      setTemplate(temp);
    } else {
      setIsFormDisplayed(true);
    }
  }, []);
  /* #endregion */

  /* #region Methods */
  const getLocalTemplate = () => {

  };

  const processTemplate = (temp: Template) => {
    const d = [...fields];

    Object.entries(temp).forEach(([k, v]) => {
      const field = d.find((f) => f.name === k);
      if (field) field.selector = v as string;
    });

    setFields(d);
    parseData();
    setFieldIndex(fields.length);
    setIsFormDisplayed(true);
  };

  const parseData = () => {
    const d = [...fields];

    d.filter((field) => field.selector).forEach((field) => {
      // eslint-disable-next-line no-param-reassign
      field.data = pruneDataFromDOM(field.selector, field);
    });

    setFields([...d]);
  };

  const pruneDataFromDOM = (selector: string, field: Field) => {
    const matches = _.intersection(
      $(window.parent.document).find(selector).toArray(),
    );

    const transformers = field.dataTransformers || [function (val: any) { return val; }];

    const transformedData = matches.map((m) => transformers
      .reduce((acc, f) => f(acc), (m as unknown as HTMLElement).innerText.trim()));

    if (typeof field.default === 'string') return transformedData.join(' ');
    if (field.default instanceof Array) return transformedData;
    if (field.default instanceof Object) return _.first(transformedData);

    return transformedData;
  };

  const saveTemplate = () => {
    if (template) { // process template changes
      const newTemplate = getNewTemplate();

      console.info(template);
      console.info(newTemplate);

      if (_.isEqual(template, newTemplate) || confirm('Overwrite existing template?')) {
        // save to localstorage
      }
    }
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
        type: getDataForField(type.name) as string,
        format: getDataForField(format.name) as string,
        discSize: getDataForField(discSize.name) as string,
        discSpeed: getDataForField(discSpeed.name) as string,
        date: getDataForField(date.name) as RYMDate,
        label: getDataForField(label.name) as string,
        catalogId: getDataForField(catalogId.name) as string,
        countries: getDataForField(countries.name) as Array<string>,
        tracks: getTracks(),
      };

      console.info(fields);

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

  /**
   * Convert local selectors into a [Template].
   */
  const getNewTemplate = () => {
    const newTemplate: HashMap<string, string> = {};

    fields.forEach((f) => {
      newTemplate[f.name] = f.selector;
    });

    return newTemplate;
  };

  const clearField = (i: number) => {
    const _data = update(fields,
      {
        [i]:
          {
            data: { $set: null },
          },
      });

    setFields(_data);
  };

  const nextField = () => {
    let index;

    for (index = fieldIndex + 1;
      index < fields.length && !isFieldEnabled(fields[index]);
      index++);

    if (fields.length && index > fields.length - 1) {
      setIsGuiding(false);
      setIsSelecting(false);
    } else {
      setFieldIndex(index);
    }
  };

  const isFieldEnabled = (field: Field) => !field.disabled && (!field.dependency
    || fields.find((f) => f.name === (field.dependency as [Field, any])[0].name)
      ?.data === (field.dependency as [Field, any])[1]);

  const getDataForField = (name: string) => fields.find((d) => d.name === name)?.data;
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
              <b>
                {`Select ${fields[fieldIndex].label}
                ${fields[fieldIndex].placeholder ? ` (${fields[fieldIndex].placeholder})` : ''}`}
              </b>
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
                onClick={() => clearField(fieldIndex)}
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
            {template && (
              <p>*Loaded from template!*</p>
            )}
            <hr />
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
                  setFieldIndex(0);
                  setIsGuiding(true);
                  setIsSelecting(true);
                }}
              >
                Guide Me
              </button>
              {(fields).map((field, i) => (
                <li style={formLiStyle}>
                  <p
                    style={{
                      ...textStyle,
                      ...formPStyle,
                    }}
                  >
                    <b style={i === fieldIndex && isSelecting ? { backgroundColor: '#FFFF00' } : {}}>
                      {`${field.label}:`}
                    </b>
                  </p>
                  <div style={{ display: 'flex' }}>
                    <FormInput
                      field={field}
                      disabled={!isFieldEnabled(field) || (isSelecting && fieldIndex !== i)}
                    />
                    <button
                      type="button"
                      disabled={isSelecting}
                      onClick={() => {
                        setIsSelecting(true);
                        setFieldIndex(i);
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
                        {`${t.position ? `${t.position}` : ''} 
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
            <div style={{ display: 'flex' }}>
              {template && (
              <button
                style={accentButtonStyle}
                type="button"
                onClick={saveTemplate}
              >
                Save Template
              </button>
              )}
              <button
                style={accentButtonStyle}
                type="button"
                onClick={submitForm}
              >
                Submit
              </button>
            </div>
            <div style={{ height: '110px' }} />
          </div>
        </div>
      </Fragment>
    )
  );
  /* #endregion */
};

export default App;
