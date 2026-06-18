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
        url: 'https://duckduckgo.com/',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match domain in URL',
        ],
        url: 'https://google.com/',
        matchPattern: 'duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match domain in URL (case-sensitivity)',
        ],
        url: 'https://google.com/',
        matchPattern: 'GOOGLE.COM',
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
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern matches \'path\' part in URL but not \'domain\' part',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '/\\?q=duckduckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern matches \'path\' part in URL except trailing slash',
        ],
        url: 'https://google.com/?q=duckduckgo.com/',
        matchPattern: '/\\?q=duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern matches beginning of \'path\' part in URL but but not the whole thing',
        ],
        url: 'https://google.com/?q=duckduckgo.com&ia=web',
        matchPattern: '/\\?q=duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern matches \'domain\' part in URL but not \'path\' part',
        ],
        url: 'https://google.com/duckduckgo.com',
        matchPattern: '/google.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern does not match path in URL (case-sensitivity)',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '/\\?q=DUCKDUCKGO.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'pattern does not match any part of URL',
        ],
        url: 'https://google.com/?q=yahoo.com',
        matchPattern: '/\\?q=duckduckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'empty path pattern matches URL',
        ],
        url: 'https://google.com/',
        matchPattern: '/',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          '\'path\' URL',
          'empty path pattern does not match URL',
        ],
        url: 'https://google.com/?q=yahoo.com',
        matchPattern: '/',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          'whole URL',
          'pattern matches URL with \'http\' scheme',
        ],
        url: 'http://google.com/?q=yahoo.com',
        matchPattern: 'google.com/\\?q=yahoo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          'whole URL',
          'pattern matches URL with \'https\' scheme',
        ],
        url: 'https://google.com/?q=yahoo.com',
        matchPattern: 'google.com/\\?q=yahoo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          'whole URL',
          'pattern does not match URL with trailing slash',
        ],
        url: 'https://google.com/?q=yahoo.com/',
        matchPattern: 'google.com/\\?q=yahoo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          'whole URL',
          'pattern matches the beginning of URL but not whole thing',
        ],
        url: 'https://google.com/?q=yahoo.com&ia=web',
        matchPattern: 'google.com/\\?q=yahoo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex plain \'path only\' pattern',
          'whole URL',
          'pattern matches \'path\' part of URL but not whole URL',
        ],
        url: 'https://google.com/google.com/yahoo.com',
        matchPattern: 'google.com/yahoo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          '\'domain only\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: 'duckd?ckgo.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL (\'.\' in same position as \'?\')',
        ],
        url: 'https://duckd.ckgo.com/',
        matchPattern: 'duckd?ckgo.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          '\'path\' URL',
          'pattern matches domain in URL',
        ],
        url: 'https://duckduckgo.com/?q=search',
        matchPattern: '/\\?q=s?arch',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          '\'path\' URL',
          'pattern does not match domain in URL (\'/\' in same position as \'?\')',
        ],
        url: 'https://duckduckgo.com/?q=s/arch',
        matchPattern: '/\\?q=s?arch',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          'whole URL',
          'pattern matches domain in URL',
        ],
        url: 'https://duckduckgo.com/?q=search',
        matchPattern: 'duckd?ckgo.com/\\?q=s?arch',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'?\'',
          'whole URL',
          'pattern does not match domain in URL (\'.\' and \'/\' in same position as \'?\')',
        ],
        url: 'https://duckd.ckgo.com/?q=s/arch',
        matchPattern: 'duckd?ckgo.com/\\?q=s?arch',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches domain in URL with 0 characters in place of \'*\'',
        ],
        url: 'https://gogle.com/',
        matchPattern: 'go*gle.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches domain in URL with 1 characters in place of \'*\'',
        ],
        url: 'https://google.com/',
        matchPattern: 'go*gle.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches domain in URL with >1 characters in place of \'*\'',
        ],
        url: 'https://gonoogle.com/',
        matchPattern: 'go*gle.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL with \'.\' in place of \'*\'',
        ],
        url: 'https://go.gle.com/',
        matchPattern: 'go*gle.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match URL if \'*\' in another subdomain',
        ],
        url: 'https://evil.google.com/',
        matchPattern: 'go*gle.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches subdomain in URL if \'*\' is alone and in same subdomain',
        ],
        url: 'https://evil.google.com/',
        matchPattern: '*.google.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if no subdomain where \'*\' is',
        ],
        url: 'https://google.com/',
        matchPattern: '*.google.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if >1 subdomain where \'*\' is',
        ],
        url: 'https://bad.evil.google.com/',
        matchPattern: '*.google.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches subdomain in URL if \'*\' is alone and in same top domain',
        ],
        url: 'https://google.com/',
        matchPattern: 'google.*',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if no subdomain where \'*\' is (top level)',
        ],
        url: 'https://google/',
        matchPattern: 'google.*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if >1 subdomain where \'*\' is (top level)',
        ],
        url: 'https://google.evil.com/',
        matchPattern: 'google.*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if whole pattern is only \'*\' and only one domain level',
        ],
        url: 'https://localhost/',
        matchPattern: '*',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if whole pattern is only \'*\' and multilple domain levels',
        ],
        url: 'https://google.com/',
        matchPattern: '*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if \'*\' is alone and in the middle of domain',
        ],
        url: 'https://jobs.companyone.com/',
        matchPattern: 'jobs.*.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if no subdomain where \'*\' is (middle)',
        ],
        url: 'https://jobs.com/',
        matchPattern: 'jobs.*.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'*\'',
          '\'domain only\' URL',
          'pattern does not match domain in URL if >1 subdomain where \'*\' is (middle)',
        ],
        url: 'https://jobs.third.company.com/',
        matchPattern: 'jobs.*.com',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL with 0 characters in place of \'*\'',
        ],
        url: 'https://google.com/jbs/',
        matchPattern: '/j*bs/',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL with 1 characters in place of \'*\'',
        ],
        url: 'https://google.com/jobs/',
        matchPattern: '/j*bs/',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL with >1 characters in place of \'*\'',
        ],
        url: 'https://duckduckgo.com/jnobs/',
        matchPattern: '/j*bs/',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL with \'/\' in place of \'*\'',
        ],
        url: 'https://duckduckgo.com/j/bs/',
        matchPattern: '/j*bs/',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match URL if pattern does not match whole URL, only substring',
        ],
        url: 'https://duckduckgo.com/jobs/programmer',
        matchPattern: '/j*bs/',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL if \'*\' is alone and 0 characters in place of \'*\' (trailing)',
        ],
        url: 'https://google.com/some/path/',
        matchPattern: '/some/path/*',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL if \'*\' is alone and >0 characters in place of \'*\' (trailing)',
        ],
        url: 'https://duckduckgo.com/some/path/even',
        matchPattern: '/some/path/*',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL if URL has no \'/\' even if it\'s expected in pattern (trailing)',
        ],
        url: 'https://google.com/some/path ',
        matchPattern: '/some/path/*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL if URL has unexpected \'/\' (trailing)',
        ],
        url: 'https://google.com/some/path/even/',
        matchPattern: '/some/path/*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL if URL has >1 segment in place of \'*\' (trailing)',
        ],
        url: 'https://google.com/some/path/even/further ',
        matchPattern: '/some/path/*',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL if \'*\' is alone (middle) and >1 characters in place of \'*\'',
        ],
        url: 'https://google.com/some/more/path',
        matchPattern: '/some/*/path',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL if \'*\' is alone (middle) and no path segment in place of \'*\'',
        ],
        url: 'https://google.com/some/path',
        matchPattern: '/some/*/path',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'*\'',
          '\'path\' URL',
          'pattern does not match path in URL if \'*\' is alone (middle) and >1 path segment in place of \'*\'',
        ],
        url: 'https://google.com/some/even/more/path',
        matchPattern: '/some/*/path',
        isUrlMatch: false,
      },
      {
        name: [
          'non-regex glob \'whole URL\' pattern with \'*\'',
          '\'path\' URL',
          'pattern matches path in URL if \'*\' is alone (middle) and >1 characters in place of \'*\'',
        ],
        url: 'https://good.gogle.com/gearch',
        matchPattern: '*.go*gle.com/*earch',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if no subdomain in place of \'**\' (pattern start)',
        ],
        url: 'https://google.com/',
        matchPattern: '**.google.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if 1 subdomain in place of \'**\' (pattern start)',
        ],
        url: 'https://evil.google.com/',
        matchPattern: '**.google.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if >1 subdomain in place of \'**\' (pattern start)',
        ],
        url: 'https://super.evil.google.com/',
        matchPattern: '**.google.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if no subdomain in place of \'**\' (pattern end)',
        ],
        url: 'https://jobs/',
        matchPattern: 'jobs.**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if 1 subdomain in place of \'**\' (pattern end)',
        ],
        url: 'https://jobs.com/',
        matchPattern: 'jobs.**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if >1 subdomain in place of \'**\' (pattern end)',
        ],
        url: 'https://jobs.company.com/',
        matchPattern: 'jobs.**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if no subdomain in place of \'**\' (pattern middle)',
        ],
        url: 'https://jobs.com/',
        matchPattern: 'jobs.**.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if 1 subdomain in place of \'**\' (pattern middle)',
        ],
        url: 'https://jobs.companyone.com/',
        matchPattern: 'jobs.**.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'domain only\' pattern with \'**\'',
          '\'domain only\' URL',
          'pattern matches domain in URL if >1 subdomain in place of \'**\' (pattern middle)',
        ],
        url: 'https://jobs.other.company.com/',
        matchPattern: 'jobs.**.com',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if no segment in place of \'**\' (pattern end)',
        ],
        url: 'https://google.com/evil/',
        matchPattern: '/evil/**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if 1 segment in place of \'**\' (pattern end)',
        ],
        url: 'https://google.com/evil/villain',
        matchPattern: '/evil/**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if >1 segments in place of \'**\' (pattern end)',
        ],
        url: 'https://duckduckgo.com/evil/not/good/',
        matchPattern: '/evil/**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if no segment in place of \'**\' (pattern middle)',
        ],
        url: 'https://google.com/evil/company',
        matchPattern: '/evil/**/company',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if 1 segment in place of \'**\' (pattern middle)',
        ],
        url: 'https://google.com/evil/very/company',
        matchPattern: '/evil/**/company',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'path only\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches path in URL if >1 segments in place of \'**\' (pattern middle)',
        ],
        url: 'https://google.com/evil/very/very/company',
        matchPattern: '/evil/**/company',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'whole URL\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches whole URL (1)',
        ],
        url: 'http://google.com/majestic/',
        matchPattern: '**.google.com/majestic/**',
        isUrlMatch: true,
      },
      {
        name: [
          'non-regex glob \'whole URL\' pattern with \'**\'',
          '\'path\' URL',
          'pattern matches whole URL (2)',
        ],
        url: 'https://good.google.com/majestic/company',
        matchPattern: '**.google.com/majestic/**',
        isUrlMatch: true,
      },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'domain only\' URL',
      //     'pattern matches domain in URL',
      //   ],
      //   url: 'https://subdomain.duckduckgo.com/',
      //   matchPattern: '*.duckduckgo.com',
      //   isUrlMatch: true,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'domain only\' URL',
      //     'pattern does not match domain in URL',
      //   ],
      //   url: 'https://duckduckgo.com/',
      //   matchPattern: '*.duckduckgo.com',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'domain only\' URL',
      //     'dots correctly escaped in pattern',
      //   ],
      //   url: 'https://duckduckgoGcom/',
      //   matchPattern: 'duckduckgo.com',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'domain only\' URL',
      //     'whole domain is tested',
      //   ],
      //   url: 'https://evil.duckduckgo.com.evil.com/',
      //   matchPattern: 'duckduckgo.com',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'path\' URL',
      //     'pattern matches domain in URL',
      //   ],
      //   url: 'https://subdomain.duckduckgo.com/?q=search+me+baby',
      //   matchPattern: '*.duckduckgo.com',
      //   isUrlMatch: true,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'path\' URL',
      //     'pattern matches \'path\' part in URL but not \'domain\' part',
      //   ],
      //   url: 'https://duckduckgo.com/?q=subdomain.duckduckgo.com',
      //   matchPattern: '*.duckduckgo.com',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'domain only\' pattern',
      //     '\'path\' URL',
      //     'pattern does not match any part of URL',
      //   ],
      //   url: 'https://duckduckgo.com/?q=duckduckgo.com',
      //   matchPattern: '*.duckduckgo.com',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex plain \'path\' pattern',
      //     '\'domain only\' URL',
      //     'pattern does not match URL',
      //   ],
      //   url: 'https://duckduckgo.com/',
      //   matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex plain \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern matches URL',
      //   ],
      //   url: 'https://duckduckgo.com/?q=search+me+baby',
      //   matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: true,
      // },
      // {
      //   name: [
      //     'non-regex plain \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern does not match URL (case-sensitivity, lowecase path, uppercase pattern)',
      //   ],
      //   url: 'https://duckduckgo.com/?q=search+me+baby',
      //   matchPattern: 'DUCKDUCKGO.COM/\\?q=SEARCH+ME+BABY',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex plain \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern does not match URL (case-sensitivity, uppercase path, lowercase pattern)',
      //   ],
      //   url: 'https://duckduckgo.com/?q=SEARCH+ME+BABY',
      //   matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex plain \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern does not match URL',
      //   ],
      //   url: 'https://duckduckgo.com/?q=do+not+search+me+baby',
      //   matchPattern: 'duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'path\' pattern',
      //     '\'domain only\' URL',
      //     'pattern does not match \'domain\' part of URL',
      //   ],
      //   url: 'https://duckduckgo.com/',
      //   matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'path\' pattern',
      //     '\'domain only\' URL',
      //     'pattern does not match \'path\' part of URL',
      //   ],
      //   url: 'https://subdomain.duckduckgo.com/',
      //   matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern matches URL',
      //   ],
      //   url: 'https://subdomain.duckduckgo.com/?q=search+me+baby',
      //   matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: true,
      // },
      // {
      //   name: [
      //     'non-regex glob \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern matches \'path\' part of URL but not \'domain\' part',
      //   ],
      //   url: 'https://duckduckgo.com/?q=search+me+baby',
      //   matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      // {
      //   name: [
      //     'non-regex glob \'path\' pattern',
      //     '\'path\' URL',
      //     'pattern does not match URL',
      //   ],
      //   url: 'https://subdomain.duckduckgo.com/?q=do+not+search+me+baby',
      //   matchPattern: '*.duckduckgo.com/\\?q=search+me+baby',
      //   isUrlMatch: false,
      // },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@^https://duckduckgo\\.com/',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL (no URL scheme in pattern)',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@^duckduckgo\\.com/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@^https://DUCKDUCKGO\\.COM/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern with \'i\' flag',
          '\'domain only\' URL',
          'pattern matches URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: 'i@^https://DUCKDUCKGO\\.COM/',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@^https://google\\.com/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://duckduckgo\\.com/',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://DUCKDUCKGO\\.COM/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'i@^https://DUCKDUCKGO\\.COM/',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match \'domain\' part of URL',
        ],
        url: 'https://google.com/?q=search+me+baby',
        matchPattern: '@^https://duckduckgo\\.com/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'domain only\' pattern',
          '\'path\' URL',
          'pattern does not match \'path\' part of URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^https://duckduckgo\\.com/',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity, lowecase path, uppercase pattern)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://DUCKDUCKGO\\.COM/\\?q=SEARCH\\+ME\\+BABY',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'path\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity, lowecase path, uppercase pattern)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'i@^https://DUCKDUCKGO\\.COM/\\?q=SEARCH\\+ME\\+BABY',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity, uppercase path, lowercase pattern)',
        ],
        url: 'https://duckduckgo.com/?q=SEARCH+ME+BABY',
        matchPattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'path\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity, uppercase path, lowercase pattern)',
        ],
        url: 'https://duckduckgo.com/?q=SEARCH+ME+BABY',
        matchPattern: 'i@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/?q=do+not+search+me+baby',
        matchPattern: '@^https://duckduckgo\\.com/\\?q=search\\+me\\+baby',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://[^/]*duckduckgo',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://[^/]*DUCKDUCKGO',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'i@^https://[^/]*DUCKDUCKGO',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in domain\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^https://[^/]*duckduckgo',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern matches URL',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^https://\\S+/.*duckduckgo\\.com',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity, lowercase path, uppercase pattern)',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: '@^https://\\S+/.*DUCKDUCKGO\\.COM',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity, lowercase path, uppercase pattern)',
        ],
        url: 'https://google.com/?q=duckduckgo.com',
        matchPattern: 'i@^https://\\S+/.*DUCKDUCKGO\\.COM',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern does not match URL (case-sensitivity, uppercase path, lowercase pattern)',
        ],
        url: 'https://google.com/?q=DUCKDUCKGO.COM',
        matchPattern: '@^https://\\S+/.*duckduckgo\\.com',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity, uppercase path, lowercase pattern)',
        ],
        url: 'https://google.com/?q=DUCKDUCKGO.COM',
        matchPattern: 'i@^https://\\S+/.*duckduckgo\\.com',
        isUrlMatch: true,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'path\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@^https://\\S+/.*duckduckgo\\.com',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL path\' pattern',
          '\'domain only\' URL',
          'pattern does not match URL',
        ],
        url: 'https://duckduckgo.com/',
        matchPattern: '@^https://\\S+/.*duckduckgo\\.com.*',
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
          'pattern does not match URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: '@DUCKDUCKGO',
        isUrlMatch: false,
      },
      {
        name: [
          'regex \'anywhere in URL\' pattern with \'i\' flag',
          '\'path\' URL',
          'pattern matches URL (case-sensitivity)',
        ],
        url: 'https://duckduckgo.com/?q=search+me+baby',
        matchPattern: 'i@DUCKDUCKGO',
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

    for (const tc of testCases) {
      for (const [testCaseGroupName, currCont, contInPattern, isContMatch] of containerTestArgs) {
        const testCaseName = [
          testCaseGroupName,
          ...tc.name,
        ].join(' / ');

        it(testCaseName, () => expect(
          utils.matchesSavedMap(tc.url, currCont, { host: `${contInPattern}${tc.matchPattern}` })
        ).toBe((tc.isUrlMatch && isContMatch)));
      }
    }
  });
});
