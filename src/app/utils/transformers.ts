import _ from 'lodash';

import { RYMDate, RegexMap } from '../types';
import { countryCodes } from './constants';

const ALWAYS_CAPITALIZE = [
  'be', 'been', 'am', 'are', 'is', 'was', 'were', 'if', 'as', 'so', 'he', 'she', 'we', 'it',
  'into', 'from', 'with', 'upon',
];

const DO_NOT_CAPITALIZE = [
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to',
  'versus', 'vs.', 'v.',
  'etc.', 'etc',
];

const MONTH_ABBREVIATIONS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

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

const countriesTransformer = (str: string) => str.split(/\s|,|&|(?: and )/)
  .map((c) => c.trim())
  .map((c) => {
    if (c.length === 2) {
      return countryCodes[c as keyof typeof countryCodes];
    }

    return Object.values(countryCodes)
      .find((country) => new RegExp(`${country}`, 'ig').test(c));
  })
  .filter((c) => c);

/**
 * Many sites display their label and catalog id in the same block level elm, or same string,
 * with the catalog id placed directly in the elm's inner text. Ergo, there is no direct
 * selector for the catalog id in most cases. This regex assumes the catalog id is the last
 * text of elm and consists of alphanumeric characters and spaces.
 */
const catalogIdTransformer = (str: string) => _.last(str.match(/[\d\s\w.-]+/ig)).trim();

const discSizeTransformer = (str: string) => _.head(str.match(/\d{1,2}"/));

const dateTransformer = (date: string) => {
  const monthRegexes = MONTH_ABBREVIATIONS.map((month, i) => {
    const paddedOrdinal = _.padStart(`${i + 1}`, 2, '0');

    return {
      // e.g. /(?:feb)|(?:(?<!(?:\d|(\w+\s+)))02)/
      regex: `(?:${month})|(?:(?<!(?:\\d|(\\w+\\s+)))${paddedOrdinal})`,
      mapTo: paddedOrdinal,
    };
  });

  const monthTransformer = regexMapTransformerFactory(monthRegexes, '00');

  const year = _.last(date.match(/(19\d\d)|(20\d\d)/ig));
  const month = monthTransformer(date);
  const day = _.padStart(
    _.head(date.match(/(?<!\d)(([1-3][0-1])|([1-2][1-9])|([1-9]))(?!\d)/)) || '00',
    2,
    '0',
  );

  return `${month}/${day}/${year}`;
};

/**
 * Used to remove 'nth-child' qualifier from topmost element of selector,
 * so fields corresponding to multiple elements can be parsed with a group selection.
 * Likely has some uncovered edge cases.
 * @param selector CSS Selector string from [finder]
 */
const removeNthChild = (selector: string) => selector.replace(/:nth-child\(\d+\)/i, '');

const parseTrackPosition = (str: string) => {
  const matches = str.match(/(?:^\s*\d+.?)|(?:[A-Z]\d)/ig);
  return matches ? _.last(matches).trim() : str;
};

const parseTrackArtist = (str: string) => {
  if (str.includes(' - ')) {
    const matches = str.match(/(?:(?:(?:\w\d+)|(?:\d+)).?\s+)*(.*)-/i);
    return (matches ? _.last(matches).trim() : str);
  }

  return str;
};

const parseTrackTitle = (str: string) => {
  if (str.includes(' - ')) {
    const matches = str.match(/(?:-\s?(.+)\s\(?\d+:\d+\)?)|(?:-\s?(.+)$)/i);
    return (matches ? _.last(matches).trim() : str);
  }

  return str;
};

const parseTrackDuration = (str: string) => {
  const matches = str.match(/\d+:\d+/ig);
  return matches ? _.last(matches).trim() : str;
};

export default {
  regexMapTransformerFactory,
  textTransformer,
  countriesTransformer,
  catalogIdTransformer,
  discSizeTransformer,
  dateTransformer,
  removeNthChild,
  parseTrackPosition,
  parseTrackArtist,
  parseTrackTitle,
  parseTrackDuration,
};
