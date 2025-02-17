import { parse } from 'tldts';

export default class ExtendedURL extends URL {
  constructor(url) {
    super(url);
    const parseResult = parse(this.hostname, {
      allowPrivateDomains: true,
      extractHostname: false,
    });

    if (parseResult.isIp) {
      this.domain = this.tld = parseResult.hostname;
    } else {
      this.tld = parseResult.publicSuffix;
      this.domain = parseResult.domainWithoutSuffix || this.hostname;
    }
  }
}
