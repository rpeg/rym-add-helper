// @ts-ignore
import detectLanguage from 'franc-min';
import _ from 'lodash';

import { RegexMap } from '../types';
import { countryCodes } from './constants';

const ENG_ALWAYS_CAPITALIZE = [
  'be', 'been', 'am', 'are', 'is', 'was', 'were', 'if', 'as', 'so', 'he', 'she', 'we', 'it',
  'into', 'from', 'with', 'upon',
];

const ENG_DO_NOT_CAPITALIZE = [
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to',
  'versus', 'vs.', 'v.',
  'etc.', 'etc',
  "o'", "n'",
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
 * Uses a heuristic NLP library (franc) to gauge likelihood of the given text being English or not.
 * Note that the library is geared specifically to large documents and is not reliable
 * for short sentences (i.e. most titles), so a min length filter is applied, along with an ENG
 * probability conditional.
 *
 * Applies static capitalization rules to English text.
 *
 * Skips non-English text altogether because in most cases the text we are pruning data from
 * will be more accurate than any programmatic transformation is capable of without sophisticated
 * NLP techniques, and any other methods seem more likely to introduce discrepancies rather than
 * prevent them.
 */
const textTransformer = (text: string) => {
  if (_.isEmpty(text)) return text;

  const results = detectLanguage.all(text, { minLength: 25 }) as Array<[number, string]>;

  const topLanguage = results[0][1] ?? 'und';
  const eng = results.find((r) => r[1] === 'eng');
  const engProb = eng ? eng[0] : 0.0;

  console.info(`${text} : ${topLanguage}`);

  return topLanguage === 'eng' || topLanguage === 'und' || engProb > 0.5
    ? processEnglishText(text).trim()
    : text.trim();
};

/**
 * https://rateyourmusic.com/wiki/RYM:Capitalization
 *
 * Note: this won't capture the parts-of-speech exceptions for words like 'but'.
 * I attempted to do this with the 'compromise' library but it proved unsufficiently sophisticated
 * to recognize non-conjunction contexts of 'but' etc. More extensive NLP libraries would surely
 * incur too much overhead for the purpose of the extension.
 */
function processEnglishText(text: string) {
  let processedText = text;

  const words = text.split(' ');

  // Sections 1/2: Always Capitalize and Do Not Capitalize
  processedText = words
    .map((word) => word.trim())
    .map((word, i) => {
      let temp = word;

      if (i === 0 || i === words.length - 1 || ENG_ALWAYS_CAPITALIZE.includes(word.toLowerCase())) {
        temp = word.slice(0, 1).toUpperCase() + word.slice(1);
      } else if (ENG_DO_NOT_CAPITALIZE.includes(word.toLowerCase())) {
        temp = word.toLowerCase();
      }

      return temp;
    }).join(' ');

  // 3.1: Major punctuation
  processedText = processedText.split(/([:?!—()"])/g)
    .map((section) => {
      let temp = section;

      // capitalize first alphabetical char within each section
      for (let i = 0; i < section.length; i++) {
        if (/[a-zA-Z]/.test(section[i])) {
          temp = section.slice(0, i) + section[i].toUpperCase() + section.slice(i + 1);
        }
      }

      return temp;
    }).join('');

  // 3.2: Hyphens and 3.3: Acronyms + Abbreviations
  processedText = processedText.split(' ')
    .map((word) => {
      let temp = word;

      if (/[a-zA-Z]+-[a-zA-Z]+/.test(word)) { // hyphen
        const matches = word.match(/([a-zA-Z]+)-([a-zA-Z]+)/);

        if (matches.length > 1 && !ENG_DO_NOT_CAPITALIZE.includes(matches[1])) {
          temp = `${matches[0]}-${matches[1].toUpperCase()}`;
        }
      } else if (/([a-zA-Z]\.){2,}/.test(word)) { // acronym
        temp = word.toUpperCase();
      }

      return temp;
    }).join(' ');

  return processedText;
}

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

/**
 * Parsers for fields often grouped together in the same selector.
 */

const parseLabel = (str: string) => _.first(str.split('‎–')).trim();

const parseCatalogId = (str: string) => _.last(str.split('‎–')).trim();

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
  parseLabel,
  parseCatalogId,
  discSizeTransformer,
  dateTransformer,
  removeNthChild,
  parseTrackPosition,
  parseTrackArtist,
  parseTrackTitle,
  parseTrackDuration,
};
