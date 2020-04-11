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

enum ReleaseTypes {
  Album = 'Album',
  Comp = 'Comp',
  EP = 'EP',
  Single = 'Single',
  Mixtape = 'Mixtape',
  Mix = 'Mix',
  Bootleg = 'Bootleg',
  Video = 'Video'
}

/**
 * TODO: many of RYM's alphabetization rules are not formalizable from syntax alone,
 * and will require parts-of-speech NLP to be fully adequate.
 */
const textTransformer = (text: string) => {
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
 */
const catalogIdTransformer = (str: string) => _.last(str.match(/[\d\s\w.]+/ig)).trim();

const releaseTypeTransformer = (str: string) => {
  if (/album/ig.test(str)) return ReleaseTypes.Album;
  if (/comp/ig.test(str)) return ReleaseTypes.Comp;
  if (/ep/ig.test(str)) return ReleaseTypes.EP;
  if (/(single)|(7")/ig.test(str)) return ReleaseTypes.Single;
  if (/mixtape/ig.test(str)) return ReleaseTypes.Mixtape;
  if (/mix/ig.test(str)) return ReleaseTypes.Mix;
  if (/(bootleg)|(unauth)/ig.test(str)) return ReleaseTypes.Bootleg;
  if (/(video)|(dvd)|(vhs)/ig.test(str)) return ReleaseTypes.Video;

  return ReleaseTypes.Album;
};

const discSizeTransformer = (str: string) => _.head(str.match(/\d{1,2}"/));

const dateTransformer = (date: string) => date;

const timeTransformer = (time: string) => time;

export default {
  textTransformer,
  catalogIdTransformer,
  releaseTypeTransformer,
  discSizeTransformer,
  dateTransformer,
  timeTransformer,
};
