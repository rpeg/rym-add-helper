import _ from 'lodash';

const ALWAYS_CAPITALIZE = [
  'be', 'been', 'am', 'are', 'is', 'was', 'were', 'if', 'as', 'so', 'he', 'she', 'we', 'it',
  'into', 'from', 'with', 'upon',
];

const DO_NOT_CAPITALIZE = [
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to',
  'versus', 'vs.', 'v.',
  'etc.',
];

const ReleaseTypes = {
  album: 'album',
  comp: 'comp',
  ep: 'ep',
  single: 'single',
  mixtape: 'mixtape',
  mix: 'mix',
  bootleg: 'bootleg',
  video: 'video',
};

/**
 * TODO: many of RYM's alphabetization rules are not formalizable from syntax alone,
 * and will require parts-of-speech NLP to be fully adequate.
 */

const textTransformer = (text) => {
  const words = text.split(' ').map((w) => w.trim());

  return words.map((word, i) => {
    let temp = word;

    if (i === 0 || i === words.length - 1 || ALWAYS_CAPITALIZE.includes(word.toLowerCase())) {
      temp = word.slice(0, 1).toUpperCase() + word.slice(1);
    } else if (DO_NOT_CAPITALIZE.includes(word.toLowerCase())) {
      temp = word.toLowerCase();
    }

    return temp;
  }).join(' ');
};

/**
 * Many sites display their label and catalog id in the same block level elm, or same string,
 * with the catalog id placed directly in the elm's inner text. Ergo, there is no direct
 * selector for the catalog id in most cases. This regex assumes the catalog id is the last
 * text of elm and consists of alphanumeric characters and spaces.
 * @param {String} str
 */
const catalogIdTransformer = (str) => _.last(str.match(/[\d\s\w.]+/ig)).trim();

const releaseTypeTransformer = (str) => {
  if (/album/ig.test(str)) return ReleaseTypes.album;
  if (/comp/ig.test(str)) return ReleaseTypes.comp;
  if (/ep/ig.test(str)) return ReleaseTypes.ep;
  if (/(single)|(7")/ig.test(str)) return ReleaseTypes.single;
  if (/mixtape/ig.test(str)) return ReleaseTypes.mixtape;
  if (/mix/ig.test(str)) return ReleaseTypes.mix;
  if (/(bootleg)|(unauth)/ig.test(str)) return ReleaseTypes.bootleg;
  if (/(video)|(dvd)|(vhs)/ig.test(str)) return ReleaseTypes.video;

  return '';
};

const discSizeTransformer = (str) => _.head(str.match(/\d{1,2}"/));

const dateTransformer = (date) => date;

const timeTransformer = (time) => time;

const metaTransformer = (transformer, iterable) => iterable.map((el) => transformer(el));

export default {
  textTransformer,
  catalogIdTransformer,
  releaseTypeTransformer,
  discSizeTransformer,
  dateTransformer,
  timeTransformer,
  metaTransformer,
};
