import axios from 'axios';

export class SSRFDetector {
  constructor() {
    this.payloads = [
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost',
      'http://127.0.0.1',
      'http://0.0.0.0',
      'http://[::1]',
      'file:///etc/passwd',
      'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
      'http://metadata.google.internal/computeMetadata/v1/'
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

          if (this.isVulnerable(response)) {
            vulnerabilities.push({
              type: 'SSRF',
              severity: 'CRITICAL',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: response.data.toString().substring(0, 500),
              description: `Server-Side Request Forgery (SSRF) detected in '${param}'`,
              impact: 'Access to internal resources, cloud metadata, internal APIs, and potential remote code execution',
              remediation: 'Validate and sanitize URLs, use allowlists for allowed domains, disable unused URL schemas',
              cwe: 'CWE-918',
              owasp: 'A10:2021 – Server-Side Request Forgery',
              reproductionSteps: [
                `1. Navigate to: ${testUrl}`,
                `2. Check response for internal resource data`,
                `3. Look for AWS metadata or internal network responses`
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

  isVulnerable(response) {
    const data = response.data.toString();
    return /ami-id|instance-id|iam|security-credentials|metadata/i.test(data) ||
           /root:x:0:0/i.test(data);
  }
}
