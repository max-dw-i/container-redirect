/**
 * @jest-environment jsdom
 */

describe('utils', () => {

  const utils = require('../utils');

  describe('formatString', () => {
    it('should return same string without variables', function () {
      const string = 'Farouq Nadeeb';
      expect(utils.formatString(string, {}))
        .toEqual(string);
    });

    it('should replace alphanumeric variables', function () {
      const name = 'Farouq';
      const lastName = 'Nadeeb';
      expect(utils.formatString('{name} {lastName}', {
        name, lastName,
      })).toEqual(`${name} ${lastName}`);
    });

    it('should replace kebab-case variables', function () {
      const name = 'Farouq';
      const lastName = 'Nadeeb';
      expect(utils.formatString('{name} {last-name}', {
        name, ['last-name']: lastName,
      })).toEqual(`${name} ${lastName}`);
    });

    it('should throw on non-existent variables', function () {
      const name = 'Farouq';
      const lastName = 'Nadeeb';
      expect(() => {
        utils.formatString('{name} {lastName} - born {dob}', {
          name, lastName,
        });
      }).toThrow('Cannot find variable \'dob\' in context');
    });

  });

  describe('filterByKey', () => {
    it('should create object with keys that don\'t start with a string', function () {
      expect(utils.filterByKey({
        removeThis: 'lol',
        removeThat: 'rofl',
        removeAnother: 'do eet!',
        keepMe: 'kept',
        keepThem: 'kept',
      }, (key) => !key.startsWith('remove')))
        .toEqual({
          keepMe: 'kept',
          keepThem: 'kept',
        });
    });

    it('should fail without a filter function', function () {
      expect(() => {
        utils.filterByKey({
          a: true,
          b: true,
        });
      }).toThrow('undefined is not a function');
    });

  });

  describe('matchesSavedMap', () => {
    const testCases = [
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match domain in URL',
        ],
        url: 'https://google.com',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches \'path\' part in URL but not \'domain\' part',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match any part of URL',
        ],
        url: 'https://google.com/?q=yahoo.com',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://subdomain.duckduckgo.com',
        matchPattern: '*.duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match domain in URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: '*.duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'domain only\' URL',
          'dots correctly escaped in pattern',
        ],
        url: 'https://duckduckgoGcom',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'domain only\' URL',
          'whole domain is tested',
        ],
        url: 'https://evil.duckduckgo.com.evil.com',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://subdomain.duckduckgo.com/?q=search+me+baby',
        matchPattern: '*.duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches \'path\' part in URL but not \'domain\' part',
        ],
        url: 'https://duckduckgo.com/?q=subdomain.duckduckgo.com',
        matchPattern: '*.duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match any part of URL',
        ],
        url: 'https://duckduckgo.com/?q=duckduckgo.com',
        matchPattern: '*.duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/?q=do+not+search+me+baby',
        matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path\' pattern',
          '\'domain only\' URL',
          'pattern does not match \'domain\' part of URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path\' pattern',
          '\'domain only\' URL',
          'pattern does not match \'path\' part of URL',
        ],
        url: 'https://subdomain.duckduckgo.com',
        matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://subdomain.duckduckgo.com/?q=search+me+baby',
        matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path\' pattern',
          '\'path\' URL',
          'pattern matches \'path\' part of URL but not \'domain\' part',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://subdomain.duckduckgo.com/?q=do+not+search+me+baby',
        matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: '@^duckduckgo\\.com(?:/.*)*$',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: '@^google\\.com(?:/.*)*$',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^duckduckgo\\.com(?:/.*)*$',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match \'domain\' part of URL',
        ],
        url: 'https://google.com/?q=search+me+baby',
        matchPattern: '@^duckduckgo\\.com(?:/.*)*$',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match \'path\' part of URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^duckduckgo\\.com(?:/.*)*$',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/?q=do+not+search+me+baby',
        matchPattern: '@^duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^[^/]*duckduckgo[^/]*(?:/.*)*$',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^[^/]*duckduckgo[^/]*(?:/.*)*$',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@.*?/.*duckduckgo\\.com.*',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@.*?/.*duckduckgo\\.com.*',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'domain only with trailing slash\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@.*?/.*duckduckgo\\.com.*',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'domain only without trailing slash\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com',
        matchPattern: '@.*?/.*duckduckgo\\.com.*',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@duckduckgo',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in URL\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://google.com/?q=do+not+search+me+baby',
        matchPattern: '@duckduckgo',
        isUrlMatch: false,
      },
    ];

    // [test case name, current container name, container name in matching pattern, match or not]
    const containerTestArgs = [
      // 'Edge case' below tests the situation when the tab is opened in an unknown container (which
      // is impossible) or 'ContextualIdentity' of the tab has no 'name' set (which is also
      // impossible according to the MSDN docs). This case was tested in the original extension so I
      // keep it here just in case
      ['tab without container and container not specified in pattern (edge case)', undefined, '', true],
      ['tab without container and container not specified in pattern', '', '', true],
      ['tab container matches container specified in pattern', 'CONTAINER NAME', '<CONTAINER NAME>', true],
      ['tab without container and rule \'No container\' specified in pattern', '', '<>', true],
      ['tab with any container and container not specified in pattern', 'CONTAINER NAME', '', true],
      ['tab with any container and rule \'No container\' specified in pattern', 'CONTAINER NAME', '<>', false],
      ['tab container mismatches container specified in pattern', 'CONTAINER NAME', '<OTHER CONTAINER NAME>', false],
    ];

    for (const tc of testCases) {
      for (const [contTestCaseName, currCont, contInPattern, isContMatch] of containerTestArgs) {
        for (const isOnlyLoweCase of [true, false]) {
          const url = isOnlyLoweCase
            ? tc.url
            : [...tc.url].map(c => Math.round(Math.random()) === 1 ? c.toUpperCase() : c).join('');

          const testCaseName = [
            isOnlyLoweCase ? 'lower case characters' : 'random case characters',
            contTestCaseName,
            ...tc.name,
          ].join(' / ');

          it(testCaseName, () => expect(
            utils.matchesSavedMap(url, currCont, { host: `${contInPattern}${tc.matchPattern}` })
          ).toBe((tc.isUrlMatch && isContMatch)));
        }
      }
    }
  });
});
