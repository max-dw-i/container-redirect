describe('utils', () => {

  const ExtendedURL = require('../index').default;

  it('should have domain', function () {
    const eUrl = new ExtendedURL('https://gist.github.com');
    expect(eUrl.domain).toEqual('github');
    expect(eUrl.tld).toEqual('com');
  });

  it('should ignore IP addresses', function() {
    const eUrl = new ExtendedURL('https://192.0.2.123');
    expect(eUrl.domain).toEqual('192.0.2.123');
    expect(eUrl.tld).toEqual('192.0.2.123');
  });

  it('should understand second-level TLDs', function() {
    const eUrl = new ExtendedURL('https://amazon.co.uk');
    expect(eUrl.domain).toEqual('amazon');
    expect(eUrl.tld).toEqual('co.uk');
  });

  it('should understand public suffix TLDs', function() {
    const eUrl = new ExtendedURL('https://kintesh.github.io');
    expect(eUrl.domain).toEqual('kintesh');
    expect(eUrl.tld).toEqual('github.io');
  });

  it('should ignore localhost', function() {
    const eUrl = new ExtendedURL('https://localhost');
    expect(eUrl.domain).toEqual('localhost');
    expect(eUrl.tld).toEqual('localhost');
  });

  it('accepts unknown domains', function() {
    const eUrl = new ExtendedURL('https://some.fake_host.test_test');
    expect(eUrl.domain).toEqual('fake_host');
    expect(eUrl.tld).toEqual('test_test');
  });
});
