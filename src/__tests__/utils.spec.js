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
    const plainPatterns = {
      group: 'plain',
      testCases: [
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckduckgo.com',
          match: true,
        },
        {
          url: 'https://google.com/',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/',
          pattern: 'GOOGLE.COM',
          match: false,
        },
        {
          url: 'https://duckduckgoGcom/',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://evil.duckduckgo.com.evil.com/',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:12345/',
          pattern: 'duckduckgo.com:12345',
          match: true,
        },
        {
          url: 'https://duckduckgo.com:12345/',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckduckgo.com:12345',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:54321/',
          pattern: 'duckduckgo.com:12345',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: 'duckduckgo.com',
          match: true,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=yahoo.com',
          pattern: 'duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '/\\?q=duckduckgo.com',
          match: true,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com/',
          pattern: '/\\?q=duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com&ia=web',
          pattern: '/\\?q=duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/duckduckgo.com',
          pattern: '/google.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '/\\?q=DUCKDUCKGO.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=yahoo.com',
          pattern: '/\\?q=duckduckgo.com',
          match: false,
        },
        {
          url: 'https://google.com/',
          pattern: '/',
          match: true,
        },
        {
          url: 'https://google.com/?q=yahoo.com',
          pattern: '/',
          match: false,
        },
        {
          url: 'http://google.com/?q=yahoo.com',
          pattern: 'google.com/\\?q=yahoo.com',
          match: true,
        },
        {
          url: 'https://google.com/?q=yahoo.com',
          pattern: 'google.com/\\?q=yahoo.com',
          match: true,
        },
        {
          url: 'https://google.com/?q=yahoo.com/',
          pattern: 'google.com/\\?q=yahoo.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=yahoo.com&ia=web',
          pattern: 'google.com/\\?q=yahoo.com',
          match: false,
        },
        {
          url: 'https://google.com/google.com/yahoo.com',
          pattern: 'google.com/yahoo.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:12345/search',
          pattern: 'duckduckgo.com:12345/search',
          match: true,
        },
        {
          url: 'https://duckduckgo.com:12345/search',
          pattern: 'duckduckgo.com/search',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/search',
          pattern: 'duckduckgo.com:12345/search',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:54321/search',
          pattern: 'duckduckgo.com:12345/search',
          match: false,
        },
      ],
    };
    const globQuestionMarkPatterns = {
      group: 'glob ?',
      testCases: [
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckd?ckgo.com',
          match: true,
        },
        {
          url: 'https://duckd.ckgo.com/',
          pattern: 'duckd?ckgo.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckduckgo.com:?',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:2/',
          pattern: 'duckduckgo.com:?2?',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:12345/',
          pattern: 'duckduckgo.com:?2???',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search',
          pattern: '/\\?q=s?arch',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=s/arch',
          pattern: '/\\?q=s?arch',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search',
          pattern: 'duckd?ckgo.com/\\?q=s?arch',
          match: true,
        },
        {
          url: 'https://duckd.ckgo.com/?q=s/arch',
          pattern: 'duckd?ckgo.com/\\?q=s?arch',
          match: false,
        },
      ],
    };
    const globSingleAsteriskPatterns = {
      group: 'glob *',
      testCases: [
        {
          url: 'https://gogle.com/',
          pattern: 'go*gle.com',
          match: true,
        },
        {
          url: 'https://google.com/',
          pattern: 'go*gle.com',
          match: true,
        },
        {
          url: 'https://gonoogle.com/',
          pattern: 'go*gle.com',
          match: true,
        },
        {
          url: 'https://go.gle.com/',
          pattern: 'go*gle.com',
          match: false,
        },
        {
          url: 'https://evil.google.com/',
          pattern: 'go*gle.com',
          match: false,
        },
        {
          url: 'https://evil.google.com/',
          pattern: '*.google.com',
          match: true,
        },
        {
          url: 'https://google.com/',
          pattern: '*.google.com',
          match: false,
        },
        {
          url: 'https://bad.evil.google.com/',
          pattern: '*.google.com',
          match: false,
        },
        {
          url: 'https://google.com/',
          pattern: 'google.*',
          match: true,
        },
        {
          url: 'https://google/',
          pattern: 'google.*',
          match: false,
        },
        {
          url: 'https://google.evil.com/',
          pattern: 'google.*',
          match: false,
        },
        {
          url: 'https://localhost/',
          pattern: '*',
          match: true,
        },
        {
          url: 'https://google.com/',
          pattern: '*',
          match: false,
        },
        {
          url: 'https://jobs.companyone.com/',
          pattern: 'jobs.*.com',
          match: true,
        },
        {
          url: 'https://jobs.com/',
          pattern: 'jobs.*.com',
          match: false,
        },
        {
          url: 'https://jobs.third.company.com/',
          pattern: 'jobs.*.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:12345/',
          pattern: 'duckduckgo.com:*',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckduckgo.com:*',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: 'duckduckgo.com:12*',
          match: false,
        },
        {
          url: 'https://duckduckgo.com:2/',
          pattern: 'duckduckgo.com:*2*',
          match: true,
        },
        {
          url: 'https://duckduckgo.com:12345/',
          pattern: 'duckduckgo.com:*2*',
          match: true,
        },
        {
          url: 'https://google.com/jbs/',
          pattern: '/j*bs/',
          match: true,
        },
        {
          url: 'https://google.com/jobs/',
          pattern: '/j*bs/',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/jnobs/',
          pattern: '/j*bs/',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/j/bs/',
          pattern: '/j*bs/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/jobs/programmer',
          pattern: '/j*bs/',
          match: false,
        },
        {
          url: 'https://google.com/some/path/',
          pattern: '/some/path/*',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/some/path/even',
          pattern: '/some/path/*',
          match: true,
        },
        {
          url: 'https://google.com/some/path ',
          pattern: '/some/path/*',
          match: false,
        },
        {
          url: 'https://google.com/some/path/even/',
          pattern: '/some/path/*',
          match: false,
        },
        {
          url: 'https://google.com/some/path/even/further ',
          pattern: '/some/path/*',
          match: false,
        },
        {
          url: 'https://google.com/some/more/path',
          pattern: '/some/*/path',
          match: true,
        },
        {
          url: 'https://google.com/some/path',
          pattern: '/some/*/path',
          match: false,
        },
        {
          url: 'https://google.com/some/even/more/path',
          pattern: '/some/*/path',
          match: false,
        },
        {
          url: 'https://good.gogle.com/gearch',
          pattern: '*.go*gle.com/*earch',
          match: true,
        },
      ],
    };
    const globDoubleAsteriskPatterns = {
      group: 'glob **',
      testCases: [
        {
          url: 'https://google.com/',
          pattern: '**.google.com',
          match: true,
        },
        {
          url: 'https://evil.google.com/',
          pattern: '**.google.com',
          match: true,
        },
        {
          url: 'https://super.evil.google.com/',
          pattern: '**.google.com',
          match: true,
        },
        {
          url: 'https://jobs/',
          pattern: 'jobs.**',
          match: true,
        },
        {
          url: 'https://jobs.com/',
          pattern: 'jobs.**',
          match: true,
        },
        {
          url: 'https://jobs.company.com/',
          pattern: 'jobs.**',
          match: true,
        },
        {
          url: 'https://jobs.com/',
          pattern: 'jobs.**.com',
          match: true,
        },
        {
          url: 'https://jobs.companyone.com/',
          pattern: 'jobs.**.com',
          match: true,
        },
        {
          url: 'https://jobs.other.company.com/',
          pattern: 'jobs.**.com',
          match: true,
        },
        {
          url: 'https://google.com/evil/',
          pattern: '/evil/**',
          match: true,
        },
        {
          url: 'https://google.com/evil/villain',
          pattern: '/evil/**',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/evil/not/good/',
          pattern: '/evil/**',
          match: true,
        },
        {
          url: 'https://google.com/evil/company',
          pattern: '/evil/**/company',
          match: true,
        },
        {
          url: 'https://google.com/evil/very/company',
          pattern: '/evil/**/company',
          match: true,
        },
        {
          url: 'https://google.com/evil/very/very/company',
          pattern: '/evil/**/company',
          match: true,
        },
        {
          url: 'http://google.com/majestic/',
          pattern: '**.google.com/majestic/**',
          match: true,
        },
        {
          url: 'https://good.google.com/majestic/company',
          pattern: '**.google.com/majestic/**',
          match: true,
        },
      ],
    };
    const globMixPatterns = {
      group: 'glob mix',
      testCases: [
        {
          url: 'https://subdomain1.4.google.a/asterisk/path/',
          pattern: '**.*.?.google.a*.**/**/*/path/',
          match: true,
        },
        {
          url: 'https://subdomain3.subdomain2.subdomain1.4.google.ask.me.later/or/not/asterisk/path/',
          pattern: '**.*.?.google.a*.**/**/*/path/',
          match: true,
        },
        {
          url: 'https://subdomain3.subdomain2.subdomain1.4.google.ask.me.later:12345/or/not/asterisk/path/',
          pattern: '**.*.?.google.a*.**:?2*45*/**/*/path/',
          match: true,
        },
      ],
    };
    const regexPatterns = {
      group: 'regex',
      testCases: [
        {
          url: 'https://duckduckgo.com/',
          pattern: '@^https://duckduckgo\\.com/',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: '@^duckduckgo\\.com/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: '@^https://DUCKDUCKGO\\.COM/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: 'i@^https://DUCKDUCKGO\\.COM/',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: '@^https://google\\.com/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://duckduckgo\\.com/',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://DUCKDUCKGO\\.COM/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: 'i@^https://DUCKDUCKGO\\.COM/',
          match: true,
        },
        {
          url: 'https://google.com/?q=search+me+baby',
          pattern: '@^https://duckduckgo\\.com/',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '@^https://duckduckgo\\.com/',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://DUCKDUCKGO\\.COM/\\?q=SEARCH\\+ME\\+BABY',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: 'i@^https://DUCKDUCKGO\\.COM/\\?q=SEARCH\\+ME\\+BABY',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=SEARCH+ME+BABY',
          pattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=SEARCH+ME+BABY',
          pattern: 'i@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=do+not+search+me+baby',
          pattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://[^/]*duckduckgo',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://[^/]*DUCKDUCKGO',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: 'i@^https://[^/]*DUCKDUCKGO',
          match: true,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '@^https://[^/]*duckduckgo',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '@^https://\\S+/.*duckduckgo\\.com',
          match: true,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: '@^https://\\S+/.*DUCKDUCKGO\\.COM',
          match: false,
        },
        {
          url: 'https://google.com/?q=duckduckgo.com',
          pattern: 'i@^https://\\S+/.*DUCKDUCKGO\\.COM',
          match: true,
        },
        {
          url: 'https://google.com/?q=DUCKDUCKGO.COM',
          pattern: '@^https://\\S+/.*duckduckgo\\.com',
          match: false,
        },
        {
          url: 'https://google.com/?q=DUCKDUCKGO.COM',
          pattern: 'i@^https://\\S+/.*duckduckgo\\.com',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@^https://\\S+/.*duckduckgo\\.com',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/',
          pattern: '@^https://\\S+/.*duckduckgo\\.com.*',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@duckduckgo',
          match: true,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: '@DUCKDUCKGO',
          match: false,
        },
        {
          url: 'https://duckduckgo.com/?q=search+me+baby',
          pattern: 'i@DUCKDUCKGO',
          match: true,
        },
        {
          url: 'https://google.com/?q=do+not+search+me+baby',
          pattern: '@duckduckgo',
          match: false,
        },
      ],
    };

    // [test case name, current container name, container name in matching pattern, match or not]
    const containerTestArgs = [
      // 'Edge case' below tests the situation when the tab is opened in an unknown container (which
      // is impossible) or 'ContextualIdentity' of the tab has no 'name' set (which is also
      // impossible according to the MSDN docs). This case was tested in the original extension so I
      // keep it here just in case
      ['tab without container and container not specified in pattern (edge case)', undefined, '', true],
      ['tab without container and container specified in pattern', undefined, '<CONTAINER>', false],
      ['tab without container and container specified in pattern', '', '<CONTAINER>', false],
      ['tab without container and container not specified in pattern', '', '', true],
      ['tab container matches container specified in pattern', 'CONTAINER', '<CONTAINER>', true],
      [
        'tab container matches container specified in pattern (trailing whitespaces in tab)',
        ' CONTAINER ',
        '<CONTAINER>',
        true,
      ],
      [
        'tab container matches container specified in pattern (trailing whitespaces in pattern)',
        'CONTAINER',
        '< CONTAINER >',
        true,
      ],
      ['tab without container and rule \'No container\' specified in pattern', '', '<>', true],
      ['tab with any container and container not specified in pattern', 'CONTAINER', '', true],
      ['tab with any container and rule \'No container\' specified in pattern', 'CONTAINER', '<>', false],
      ['tab container mismatches container specified in pattern', 'CONTAINER', '<OTHER_CONTAINER>', false],
      [
        'tab container mismatches container specified in pattern (uppercase tab, lowercase pattern)',
        'CONTAINER',
        '<container>',
        false,
      ],
      [
        'tab container mismatches container specified in pattern (lowercase tab, uppercase pattern)',
        'container',
        '<CONTAINER>',
        false,
      ],
      [
        'tab without container matches container specified in pattern (not \'CONTAINER\' regex group)',
        '',
        '<^(?!CONTAINER$)>',
        true,
      ],
      [
        'tab container matches container specified in pattern (not \'CONTAINER\' regex group)',
        'OTHER_CONTAINER',
        '<^(?!CONTAINER$)>',
        true,
      ],
      [
        'tab container mismatches container specified in pattern (not \'CONTAINER\' regex group)',
        'CONTAINER',
        '<^(?!CONTAINER$)>',
        false,
      ],
      [
        'tab container mismatches container specified in pattern (not \'CONTAINER\' regex group,'
        + ' lowercalse tab, uppercase container)',
        'container',
        '<^(?!CONTAINER$)>',
        true,
      ],
      [
        'tab container mismatches container specified in pattern (not \'CONTAINER\' regex group,'
        + ' uppercase tab, lowercalse container)',
        'CONTAINER',
        '<^(?!container$)>',
        true,
      ],
    ];

    for (const [testCaseGroupName, currCont, contInPattern, isContainerMatch] of containerTestArgs) {
      for (const tcGroup of [
        plainPatterns,
        globQuestionMarkPatterns,
        globSingleAsteriskPatterns,
        globDoubleAsteriskPatterns,
        globMixPatterns,
        regexPatterns,
      ]) {
        for (const tc of tcGroup.testCases) {
          const testCaseName = [
            testCaseGroupName,
            `pattern group: '${tcGroup.name}'`,
            `pattern: '${tc.pattern}'`,
            `URL: '${tc.url}'`,
          ].join(' / ');

          it(testCaseName, () => expect(
            utils.matchesSavedMap(tc.url, currCont, { host: `${contInPattern}${tc.pattern}` })
          ).toBe((tc.match && isContainerMatch)));
        }
      }
    }
  });
});
