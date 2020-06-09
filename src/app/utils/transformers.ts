// @ts-ignore
import detectLanguage from 'franc-min';
import nlp from 'compromise';
import _ from 'lodash';

import { RegexMap } from '../types';
import { countryCodes } from './constants';

const ENG_ALWAYS_CAPITALIZE = [
  'be', 'been', 'am', 'are', 'is', 'was', 'were', 'if', 'as', 'he', 'she', 'we', 'it',
  'into', 'from', 'with', 'upon',
];

const ENG_DO_NOT_CAPITALIZE = [
  'a', 'an', 'the',
  'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'as', 'at', 'by', 'for', 'in', 'of', 'on', 'to',
  'versus', 'vs.', 'v.',
  'etc.', 'etc',
  "o'", "n'",
  'to', // assumes non-infinitive
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
 * Uses a NLP heuristic (franc) to gauge likelihood of the given text being English or not.
 * Note that the library is geared specifically to large documents and is not reliable
 * for short sentences (i.e. most titles), so a min length filter is applied, along with an English
 * probability conditional.
 *
 * Applies static capitalization rules to English text.
 *
 * Does not transform non-English text because in most cases the text we are pruning data from
 * will be more accurate than any programmatic transformation is capable of without sophisticated
 * NLP techniques, and any other methods seem more likely to introduce discrepancies rather than
 * prevent them.
 */
const textCapitalizationTransformer = (text: string) => {
  if (_.isEmpty(text)) return text;

  const results = detectLanguage.all(text, { minLength: 20 }) as Array<[string, number]>;

  const topLanguage = results[0][0] ?? 'und';
  const eng = results.find((r) => r[0] === 'eng');
  const engProb = eng ? eng[1] : 0.0;

  // console.info(`${text}: ${topLanguage}, eng: ${engProb}`);

  return topLanguage === 'eng' || topLanguage === 'und' || engProb > 0.5
    ? processEnglishText(text).trim()
    : text.trim();
};

/**
 * https://rateyourmusic.com/wiki/RYM:Capitalization
 *
 * Note: this won't capture the context-sensitive parts-of-speech exceptions for words like 'but'.
 */
function processEnglishText(text: string) {
  let processedText = text.trim();

  const words = text.split(' ');

  // word rules
  processedText = words
    .map((word) => word.trim())
    .map((word, i) => {
      if (_.isEmpty(word)) return word;

      let temp = word;

      // needs to be lowercase or else will be assumed proper noun
      const result = nlp(word.toLowerCase()).out('tags');
      const pos = !_.isEmpty(result) ? _.flatten([_.head(Object.values(_.head(result)))]) : [];

      // dynamic parts-of-speech parsing
      // note: doesn't include subordinating conjunctions or "so"-as-adjective
      if (pos.some((p) => ['Noun', 'Verb', 'Adverb', 'Adjective', 'Pronoun'].includes(p))) {
        temp = word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
      }

      // static parsing
      if (i === 0 || i === words.length - 1 || ENG_ALWAYS_CAPITALIZE.includes(word.toLowerCase())) {
        temp = word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
      } else if (ENG_DO_NOT_CAPITALIZE.includes(word.toLowerCase())) {
        temp = word.toLowerCase();
      }

      return temp;
    }).join(' ');

  // 3.1: Major punctuation
  const sections = processedText.split(/([:?!—()"])/g);
  if (sections.length > 1) {
    let temp = '';

    for (let i = 0; i < sections.length; i++) {
      temp += sections[i];

      if (/[:?!—()"]/.test(sections[i])) {
        const s = sections[i + 1];

        if (s) {
          // capitalize first alphabetical char within each section immediately
          // following a 'major punctuation' char
          let foundAlpha = false;

          for (let j = 0; j < s.length; j++) {
            if (!foundAlpha && /[a-zA-Z]/.test(s[j])) {
              temp += s[j].toUpperCase();
              foundAlpha = true;
            } else {
              temp += s[j];
            }
          }

          i++;
        }
      }
    }

    processedText = temp;
  }

  // 3.2: Hyphens and 3.3: Acronyms + Abbreviations
  processedText = processedText.split(' ')
    .map((word) => {
      let temp = word;

      if (/([a-zA-Z]+-[a-zA-Z]+)+/.test(word)) { // hyphen
        const parts = word.split('-');

        temp = parts.map((p) => (ENG_DO_NOT_CAPITALIZE.includes(p.toLowerCase())
          ? p
          : `${p.slice(0, 1).toUpperCase()}${p.slice(1).toLowerCase()}`)).join('-');
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
 * RYM formats time as MM:SS. Hours are transformed to minutes.
 * Remove leading zero to prevent '00:00' bug.
 */
const trackDurationTransformer = (str: string) => {
  if (str.trim() === '') return str.trim(); // no duration present

  if (/^\d\d:\d\d$/.test(str.trim())) {
    return str[0] === '0'
      ? str.slice(1).trim()
      : str.trim();
  }

  if (/^\d:\d\d$/.test(str.trim())) {
    return str.trim();
  }

  const matches = str.match(/\d+/ig);

  if (matches && matches.length === 3) { // contains hours section
    const hours = parseInt(matches[0], 10) ?? 0;
    return `${hours * 60 + parseInt(matches[1], 10) ?? 0}:${matches[2]}`;
  }

  if (matches && matches.length > 1) {
    return matches.slice(1).join(':').trim();
  }

  if (matches && matches.length === 1) {
    return `0:${matches[0]}`;
  }

  return str.trim();
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
  const matches = str.match(/\d+:\d\d/ig);
  return matches ? _.last(matches).trim() : str;
};

export default {
  regexMapTransformerFactory,
  textCapitalizationTransformer,
  countriesTransformer,
  parseLabel,
  parseCatalogId,
  discSizeTransformer,
  dateTransformer,
  trackDurationTransformer,
  removeNthChild,
  parseTrackPosition,
  parseTrackArtist,
  parseTrackTitle,
  parseTrackDuration,
};
