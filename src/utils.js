import punycode from 'punycode';

export const MAX_EXTENSION_POPUP_WIDTH = 800;  // px, found in google

export const PREFIX_REGEX_FLAG = '@';

export const qs = (selector, node) => (node || document).querySelector(selector);
export const qsAll = (selector, node) => (node || document).querySelectorAll(selector);
export const ce = (tagName) => document.createElement(tagName);

export const cleanHostInput = (value = '') => value.trim().toLowerCase();

const HOST_REGEX = new RegExp('^(?:<(.*?)>)?(@)?(.*)');

export const sortMaps = (maps) => maps.sort((map1, map2) => {
  const pr1 = map1.priority;
  const pr2 = map2.priority;
  if (pr1 === pr2) return 0;
  return pr1 > pr2 ? 1 : -1;
});

/**
 * Converts the punycode domain in the URL to Unicode and trims the protocol.
 *
 * @param {URL} url
 * @return {string}
 */
export const normalizedUrl = (url) => {
  url.hostname = punycode.toUnicode(url.hostname);
  return url.toString().replace('https://', '').replace('http://', '');
};

/**
 * Returns the domain part of the URL converted from punycode to Unicode.
 *
 * @param {URL} url
 * @return {string}
 */
export const normalizedDomain = (url) => {
  return punycode.toUnicode(url.hostname);
};

/**
 * Escape all regex metacharacters in a string.
 *
 * @param {string} s
 * @return {string}
 */
function escapeRegExp(s) {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
  return s.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Converts a glob matching pattern to a regular expression.
 *
 * @param {string} s
 * @return {string}
 */
function globToRegex(s) {
  const escapedChars = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '\\' && (['?', '*'].includes(s[i + 1]))) {
      escapedChars.push(s.slice(i, i + 2));
      i = i + 2;
    } else {
      if (s[i] === '?') escapedChars.push('.?');
      else if (s[i] === '*') escapedChars.push('.*');
      else escapedChars.push(escapeRegExp(s[i]));
      i++;
    }
  }
  return escapedChars.join('');
}

/**
 * Checks if the URL matches a given hostmap
 *
 * Depending on the prefix in the hostmap it'll choose a match method:
 *  - glob
 *  - regex
 *
 * @param {string} url
 * @param {string} currentContainerName
 * @param map
 * @return {boolean}
 */
export const matchesSavedMap = (url, currentContainerName, { host }) => {
  const mapHostMatch = host.match(HOST_REGEX);
  if (mapHostMatch === null) {
    console.error(`couldn't parse value '${host}'`);
    return false;
  }
  const [, mapContainerNameRe, regexFlag, mapUrlPattern] = mapHostMatch;

  const urlO = new window.URL(url);
  let testUrl = normalizedUrl(urlO);
  let hasUrlMatched = false;
  if (regexFlag) {
    try {
      hasUrlMatched = (new RegExp(mapUrlPattern, 'i')).test(testUrl);
    } catch (e) {
      console.error('couldn\'t test regex', mapUrlPattern, e);
    }
  } else {
    let reStr = globToRegex(mapUrlPattern);
    reStr = `^${reStr}$`;
    const firstSlashIndex = mapUrlPattern.trimEnd('/').indexOf('/');
    if (firstSlashIndex === -1) {
      testUrl = normalizedDomain(urlO);
    }
    hasUrlMatched = (new RegExp(reStr, 'i')).test(testUrl);
  }

  if (!hasUrlMatched) return false;
  if (currentContainerName === undefined || mapContainerNameRe === undefined) return true;
  if (mapContainerNameRe.length === 0) return currentContainerName.length === 0;
  return (new RegExp(mapContainerNameRe)).test(currentContainerName);
};


export const filterByKey = (dict, func) => {
  return Object.keys(dict)
    .filter(func)
    .reduce((acc, curr) => {
      acc[curr] = dict[curr];
      return acc;
    }, {});
};

/**
 * Replaces occurrences of {variable} in strings
 *
 * It handles camelCase, kebab-case and snake_case variable names
 *
 * @param string {String}
 * @param context {Object}
 * @throws Error when the variable doesn't exist in the context
 * @return {String}
 */
export function formatString(string, context) {
  return string.replace(/(\{([\w_-]+)\})/g, (match, _, token) => {
    const replacement = context[token];
    if (replacement === undefined) {
      throw `Cannot find variable '${token}' in context`;
    }
    return replacement;
  });
}
