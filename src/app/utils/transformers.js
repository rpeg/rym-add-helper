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

const dateTransformer = (date) => date;

const timeTransformer = (time) => time;

const metaTransformer = (transformer, iterable) => iterable.map((el) => transformer(el));

export default {
  textTransformer,
  dateTransformer,
  timeTransformer,
  metaTransformer,
};
