import punycode from 'punycode';

export const MAX_EXTENSION_POPUP_WIDTH = 800;  // px, found in google

const URL_SCHEMES = [
  // Order matters!
  'https://',
  'http://',
];

export const qs = (selector, node) => (node || document).querySelector(selector);
export const qsAll = (selector, node) => (node || document).querySelectorAll(selector);
export const ce = (tagName) => document.createElement(tagName);

const HOST_REGEX = new RegExp('^(?:<(.*?)>)?(i?@)?(.*)');

function parseUrlPattern(s) {
  let scheme = '';
  for (const sc of URL_SCHEMES) {
    if (s.startsWith(sc)) {
      scheme = sc;
      s = s.slice(sc.length);
      break;
    }
  }

  let host = '';
  let path = '';
  const firstSlashIndex = s.indexOf('/');
  if (firstSlashIndex === -1) host = s;
  else if (firstSlashIndex === 0) path = s;
  else {
    host = s.slice(0, firstSlashIndex);
    path = s.slice(firstSlashIndex);
  }

  let hostname = '';
  let port = '';
  if (host) {
    const hostParts = host.split(':');
    hostname = hostParts[0];
    if (hostParts.length > 1) port = `:${hostParts[1]}`;
  }

  return { scheme, hostname, port, path };
}

function parseMapHost(val) {
  const match = val.match(HOST_REGEX);
  if (match === null) return {};
  const [, containerNameRe, regexFlag, urlPattern] = match;
  const parsedUrlPattern = parseUrlPattern(urlPattern);
  return {
    containerNameRe,
    regexFlag,
    urlPattern,
    parsedUrlPattern,
  };
}

export function cleanHostInput(value = '') {
  if (value === '') return value;

  const trimmed = value.trim();

  const ph = parseMapHost(trimmed);
  if (ph.regexFlag) return trimmed;

  // Patterns like 'a**.google.com', 'jobs.b**c.com', 'id.**d', '/a**/path', '/more/b**c/path', '/path/**d' are invalid
  if (/[^/.]\*\*|\*\*[^/.]/.test(trimmed)) return '';

  let hostname = ph.parsedUrlPattern.hostname;
  let port = ph.parsedUrlPattern.port;
  let path = ph.parsedUrlPattern.path;

  // Trim '**' if it's the whole domain part (to make the pattern 'path-only')
  hostname = hostname.replace(/^\*\*$/, '');
  // Trim '**' if it's the whole path part (to make the pattern 'domain-only')
  path = path.replace(/^\/\*\*$/, '');
  // Collapse glob '**'
  hostname = hostname.replace(/\*\*(?:\.\*\*)*/, '**');
  path = path.replace(/\*\*(?:\/\*\*)*/, '**');

  const cleanParts = [];
  if (ph.containerNameRe !== undefined) cleanParts.push(`<${ph.containerNameRe}>`);
  // Trim the scheme if it's a glob pattern
  cleanParts.push(`${hostname}${path}`);
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
 * Escape all regex metacharacters in a string.
 *
 * @param {string} s
 * @return {string}
 */
function escapeRegExp(s) {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
  return s.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function hostnameGlobToRegex(s) {
  const escapedChars = [];
  let i = 0;
  while (i < s.length) {
    // '?' glob character
    if (s[i] === '?') {
      escapedChars.push('[^.]');
      i++;
    }
    // '**' glob character
    else if (i === s.length - 3 && s.slice(i, i + 3) === '.**') {
      escapedChars.push('(?:\\.[^.]+)*');
      i = i + 3;
    }
    else if (i === 0 && s.slice(i, i + 3) === '**.') {
      escapedChars.push('(?:[^.]+\\.)*');
      i = i + 3;
    }
    else if (s.slice(i, i + 4) === '.**.') {
      escapedChars.push('\\.(?:[^.]+\\.)*');
      i = i + 4;
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
      // '**' glob character
      else if (i === s.length - 3 && s.slice(i, i + 3) === '/**') {
        escapedChars.push('\\/.*');
        i = i + 3;
      }
      else if (s.slice(i, i + 4) === '/**/') {
        escapedChars.push('\\/(?:[^/]+\\/)*');
        i = i + 4;
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
  let hasUrlMatched = false;
  if (mapHost.regexFlag) {
    const caseInsensitive = mapHost.regexFlag[0] === 'i' ? 'i' : undefined;
    const testUrl = normalizedUrl.toString();
    try {
      hasUrlMatched = (new RegExp(mapHost.urlPattern, caseInsensitive)).test(testUrl);
    } catch (e) {
      console.error('couldn\'t test regex', mapHost.urlPattern, e);
    }
  } else {
    const urlPattern = mapHost.parsedUrlPattern;
    if (urlPattern.hostname && !urlPattern.path) {
      // It's a domain-only glob pattern
      const re = `^${hostnameGlobToRegex(urlPattern.hostname)}$`;
      hasUrlMatched = (new RegExp(re)).test(normalizedUrl.hostname);
    } else if (!urlPattern.hostname && urlPattern.path) {
      // It's a path-only glob pattern
      const re = `^${pathGlobToRegex(urlPattern.path)}$`;
      hasUrlMatched = (new RegExp(re)).test(normalizedUrl.pathname + normalizedUrl.search);
    } else if (urlPattern.hostname && urlPattern.path) {
      // It's a whole-URL glob pattern
      const domainRe = `^${hostnameGlobToRegex(urlPattern.hostname)}$`;
      const pathRe = `^${pathGlobToRegex(urlPattern.path)}$`;
      hasUrlMatched = (new RegExp(domainRe)).test(normalizedUrl.hostname)
        && (new RegExp(pathRe)).test(normalizedUrl.pathname + normalizedUrl.search);
    } else {
      console.error(`Map rule '${host}' cannot be parsed`);
      return false;
    }
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
