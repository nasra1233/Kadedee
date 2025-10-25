import axios from 'axios';

export class IDORDetector {
  constructor() {
    this.idPatterns = ['id', 'user', 'userid', 'account', 'doc', 'file', 'report', 'item'];
  }

  async detect(endpoint) {
    const vulnerabilities = [];
    if (!endpoint.parameters) return vulnerabilities;

    for (const param of endpoint.parameters) {
      if (!this.isIdParameter(param)) continue;

      try {
        const originalUrl = endpoint.url;
        const response1 = await axios.get(originalUrl, {
          timeout: 5000,
          validateStatus: () => true
        });

        const testUrl = this.buildTestUrl(originalUrl, param, '99999');
        const response2 = await axios.get(testUrl, {
          timeout: 5000,
          validateStatus: () => true
        });

        if (this.isVulnerable(response1, response2)) {
          vulnerabilities.push({
            type: 'IDOR',
            severity: 'HIGH',
            url: testUrl,
            parameter: param,
            payload: '99999',
            evidence: `Status: ${response2.status}, Different content accessible`,
            description: `Insecure Direct Object Reference (IDOR) in '${param}'`,
            impact: 'Unauthorized access to other users data, privacy violations, data manipulation',
            remediation: 'Implement proper authorization checks, use indirect references, validate user permissions',
            cwe: 'CWE-639',
            owasp: 'A01:2021 – Broken Access Control',
            reproductionSteps: [
              `1. Access original URL: ${originalUrl}`,
              `2. Access modified URL: ${testUrl}`,
              `3. Compare responses to verify unauthorized access`,
              `4. Try multiple ID values to access other resources`
            ],
            curlCommand: `curl -X GET "${testUrl}"`
          });
        }
      } catch (error) {}
    }
    return vulnerabilities;
  }

  buildTestUrl(baseUrl, param, value) {
    const url = new URL(baseUrl);
    url.searchParams.set(param, value);
    return url.toString();
  }

  isIdParameter(param) {
    return this.idPatterns.some(pattern => param.toLowerCase().includes(pattern));
  }

  isVulnerable(response1, response2) {
    if (response2.status === 200 && response1.status === 200) {
      const len1 = response1.data.toString().length;
      const len2 = response2.data.toString().length;
      return Math.abs(len1 - len2) > 100;
    }
    return false;
  }
}
