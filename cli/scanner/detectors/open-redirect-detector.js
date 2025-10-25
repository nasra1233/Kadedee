import axios from 'axios';

export class OpenRedirectDetector {
  constructor() {
    this.payloads = [
      'https://evil.com',
      '//evil.com',
      '///evil.com',
      '////evil.com',
      'https:evil.com',
      'http://evil.com',
      '//google.com',
      'javascript:alert(1)',
      '/\\evil.com',
      'https://evil.com@legitimate.com'
    ];
  }

  async detect(endpoint) {
    const vulnerabilities = [];
    if (!endpoint.parameters) return vulnerabilities;

    for (const param of endpoint.parameters) {
      if (!this.isRedirectParameter(param)) continue;

      for (const payload of this.payloads) {
        try {
          const testUrl = this.buildTestUrl(endpoint.url, param, payload);
          const response = await axios.get(testUrl, {
            timeout: 5000,
            validateStatus: () => true,
            maxRedirects: 0
          });

          if (this.isVulnerable(response, payload)) {
            vulnerabilities.push({
              type: 'OPEN_REDIRECT',
              severity: 'MEDIUM',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: response.headers.location || '',
              description: `Open Redirect vulnerability in '${param}'`,
              impact: 'Phishing attacks, credential theft, malware distribution',
              remediation: 'Use allowlists for redirect destinations, validate redirect URLs against trusted domains',
              cwe: 'CWE-601',
              owasp: 'A01:2021 – Broken Access Control',
              reproductionSteps: [
                `1. Navigate to: ${testUrl}`,
                `2. Check if browser redirects to external domain`,
                `3. Verify Location header in response`
              ],
              curlCommand: `curl -I -X GET "${testUrl}"`
            });
            break;
          }
        } catch (error) {}
      }
    }
    return vulnerabilities;
  }

  buildTestUrl(baseUrl, param, payload) {
    const url = new URL(baseUrl);
    url.searchParams.set(param, payload);
    return url.toString();
  }

  isRedirectParameter(param) {
    const redirectParams = ['redirect', 'url', 'next', 'return', 'returnUrl', 'goto', 'continue', 'dest', 'destination'];
    return redirectParams.some(p => param.toLowerCase().includes(p));
  }

  isVulnerable(response, payload) {
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.location;
      if (location && (location.includes('evil.com') || location.includes('google.com'))) {
        return true;
      }
    }
    return false;
  }
}
