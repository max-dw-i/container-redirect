import punycode from 'punycode';

export const MAX_EXTENSION_POPUP_WIDTH = 800;  // px, found in google

const URL_SCHEMES = [
  'http://',
  'https://',
];

export const qs = (selector, node) => (node || document).querySelector(selector);
export const qsAll = (selector, node) => (node || document).querySelectorAll(selector);
export const ce = (tagName) => document.createElement(tagName);

const HOST_REGEX = new RegExp('^(?:<(.*?)>)?(i?@)?(.*)');

function parseMapHost(val) {
  const match = val.match(HOST_REGEX);
  if (match === null) return {};
  const [, containerNameRe, regexFlag, urlPattern] = match;
  return {
    containerNameRe,
    regexFlag,
    urlPattern,
  };
}

export function cleanHostInput(value = '') {
  if (value === '') return value;

  const parsedHost = parseMapHost(value.trim());
  if (!parsedHost.regexFlag) {
    // Trim the scheme if it's a glob pattern
    parsedHost.urlPattern = trimUrlScheme(parsedHost.urlPattern);
  }

  const cleanParts = [];
  if (parsedHost.containerNameRe !== undefined) cleanParts.push(`<${parsedHost.containerNameRe}>`);
  if (parsedHost.regexFlag !== undefined) cleanParts.push(parsedHost.regexFlag);
  if (parsedHost.urlPattern !== undefined) cleanParts.push(parsedHost.urlPattern);
  return cleanParts.join('');
}
export const cleanContainerName = (value) => value ? value.trim() : value;

export const sortMaps = (maps) => maps.sort((map1, map2) => {
  const pr1 = map1.priority;
  const pr2 = map2.priority;
  if (pr1 === pr2) return 0;
  return pr1 > pr2 ? 1 : -1;
});

/**
 * Converts the punycode domain in the URL to Unicode.
 *
 * @param {URL} url
 * @return {URL}
 */
export const normalizeUrlPunnycode = (url) => {
  const urlCopy = new URL(url);
  urlCopy.hostname = punycode.toUnicode(urlCopy.hostname);
  return urlCopy;
};

/**
 * Trims the URL scheme.
 *
 * @param {string} url
 * @return {string}
 */
export const trimUrlScheme = (url) => {
  let trimmed = url;
  for (const scheme of URL_SCHEMES) trimmed = trimmed.replace(scheme, '');
  return trimmed;
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

function domainGlobToRegex(s) {
  const escapedChars = [];
  let i = 0;
  while (i < s.length) {
    // '?' glob character
    if (s[i] === '?') {
      escapedChars.push('[^.]');
      i++;
    }
    // '*' glob character
    else if (s[i] === '*') {
      escapedChars.push('[^.]*');
      i++;
    }
    // 'Normal' characters
    else {
      escapedChars.push(escapeRegExp(s[i]));
      i++;
    }
  }
  return escapedChars.join('');
}

function pathGlobToRegex(s) {
  const escapedChars = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '\\' && (['?', '*'].includes(s[i + 1]))) {
      escapedChars.push(s.slice(i, i + 2));
      i = i + 2;
    } else {
      // '?' glob character
      if (s[i] === '?') {
        escapedChars.push('[^/]');
        i++;
      }
      // '*' glob character
      else if (s[i] === '*') {
        escapedChars.push('[^/]*');
        i++;
      }
      // 'Normal' characters
      else {
        escapedChars.push(escapeRegExp(s[i]));
        i++;
      }
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
  currentContainerName = cleanContainerName(currentContainerName);

  const mapHost = parseMapHost(host);
  if (Object.keys(mapHost).length === 0) {
    console.error(`couldn't parse value '${host}'`);
    return false;
  }
  const mapContainerNameRe = cleanContainerName(mapHost.containerNameRe);

  const originalUrl = new window.URL(url);
  const normalizedUrl = normalizeUrlPunnycode(originalUrl);
  let testUrl = normalizedUrl.toString();
  let hasUrlMatched = false;
  if (mapHost.regexFlag) {
    const caseInsensitive = mapHost.regexFlag[0] === 'i' ? 'i' : undefined;
    try {
      hasUrlMatched = (new RegExp(mapHost.urlPattern, caseInsensitive)).test(testUrl);
    } catch (e) {
      console.error('couldn\'t test regex', mapHost.urlPattern, e);
    }
  } else {
    let re;
    // The URL scheme is trimmed at this point so if there's a '/',
    // it's a start of the URL's path
    const firstSlashIndex = mapHost.urlPattern.indexOf('/');
    if (firstSlashIndex === -1) {
      // It's a domain-only glob pattern
      re = `^${domainGlobToRegex(mapHost.urlPattern)}$`;
      testUrl = normalizedUrl.hostname;
    } else if (firstSlashIndex === 0) {
      // It's a path-only glob pattern
      re = `^${pathGlobToRegex(mapHost.urlPattern)}$`;
      testUrl = normalizedUrl.pathname + normalizedUrl.search;
    } else {
      // It's a whole-URL glob pattern
      const domainPattern = mapHost.urlPattern.slice(0, firstSlashIndex);
      const pathPattern = mapHost.urlPattern.slice(firstSlashIndex);
      re = `^${domainGlobToRegex(domainPattern)}${pathGlobToRegex(pathPattern)}$`;
      testUrl = trimUrlScheme(testUrl);
    }
    // let reStr = globToRegex(mapHost.urlPattern);
    // reStr = `^${reStr}$`;
    // hasUrlMatched = (new RegExp(reStr)).test(testUrl);
    hasUrlMatched = (new RegExp(re)).test(testUrl);
  }

  if (!hasUrlMatched) return false;
  if (mapContainerNameRe === undefined) return true;
  if (mapContainerNameRe.length === 0) return currentContainerName === undefined || currentContainerName.length === 0;
  if (currentContainerName === undefined) return false;
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
