/**
 * @template {object} T
 * @param {T} target
 * @param {Partial<T>[]} sources
 * @returns {T} `Object.assign` result
 */
export function assign(target, ...sources) {
  return Object.assign(target, ...sources);
}

/**
 * @param {string} text
 */
export function toTitleCase(text) {
  const result = text.replace(/(?!^)([A-Z])/g, ' $1');
  return `${result[0].toUpperCase()}${result.slice(1)}`;
}

/**
 * HTML要素を作成
 * @template {keyof HTMLElementTagNameMap} T
 * @param {T} tagName
 * @param {Partial<HTMLElementTagNameMap[T]>} attributes
 * @param {readonly (string | Element)[]} children
 */
export function el(tagName, attributes = {}, children = []) {
  const element = assign(document.createElement(tagName), attributes);
  element.replaceChildren(...children);
  return element;
}

/**
 * 0からmaxまでの乱数を生成
 * @param {number} max
 */
export function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * 0からmaxまでの一意のsize個の乱数を生成
 * @param {number} max
 * @param {number} size
 * @example
 * getUniqueRandomIntList(5, 2) // [1, 3]
 * getUniqueRandomIntList(5, 3) // [0, 4, 2]
 */
export function getUniqueRandomIntList(max, size) {
  if (size > max) {
    throw new RangeError('size must be smaller than max.');
  }

  const shuffled = Array.from({ length: max }, (_, i) => i)
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  return shuffled.slice(0, size);
}

/**
 * @param {number} ms
 */
export function formatTimeMs(ms) {
  return (ms / 1000).toFixed(1);
}

/**
 * @param {object} obj
 * @param {Partial<HTMLDListElement>} attributes
 */
export function createDlFromObject(obj, attributes = {}) {
  return el('dl', attributes, Object.entries(obj).flatMap(([key, value]) => [
    el('dt', {}, [key]),
    el('dd', {}, [value]),
  ]));
}

/**
 * @param {HTMLAudioElement} audio
 */
export function replayAudio(audio) {
  audio.currentTime = 0;
  audio.play();
}

export const ranks = [
  {
    name: '一級',
    max: 6,
    description: 'この境地に達するまで何年かかりましたか？',
  },
  {
    name: '二級',
    max: 12,
    description: '頂点へあと一歩！',
  },
  {
    name: '三級',
    max: 24,
    description: '焦らずがんばろう。',
  },
  {
    name: '四級',
    max: 48,
    description: 'まだまだですね。',
  },
  {
    name: '五級',
    max: Infinity,
    description: '運がなかったかも。',
  },
];

export const LEVELS = /** @type {const} */(['easy', 'normal', 'hard']);

/**
 * @typedef {(typeof LEVELS)[number]} Level
 */

/**
 * @typedef {{
 *   character: string;
 *   on: string;
 *   kun: string;
 *   meaning: string;
 *   category: string;
 * }} QuestionDetail
 */

/**
 * @typedef {Record<Level, QuestionDetail[][]>} Questions
 */
