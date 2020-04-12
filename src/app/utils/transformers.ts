import _ from 'lodash';

import {
  RYMDate, Months, RegexMap,
} from '../types';

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

/**
 * Second-order transformer for mapping regexes to corresponding RYM form types.
 */
const regexMapTransformerFactory = (maps: Array<RegexMap>, def: string) => (s: string) => {
  const match = maps.find((m) => new RegExp(m.regex, 'ig').test(s));

  return match ? match.mapTo : def;
};

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

const discSizeTransformer = (str: string) => _.head(str.match(/\d{1,2}"/));

const dateTransformer: (date: string) => RYMDate = (date) => {
  const year = _.last(date.match(/(19\d\d)|(20\d\d)/ig));
  const month = Object.values(Months).find((m) => new RegExp(m.slice(0, 3), 'ig').test(date));
  const day = _.head(date.match(/(?<!\d)(([1-3][0-1])|([1-2][1-9])|([1-9]))(?!\d)/));

  return {
    month,
    day,
    year,
  };
};

export default {
  regexMapTransformerFactory,
  textTransformer,
  catalogIdTransformer,
  discSizeTransformer,
  dateTransformer,
};
