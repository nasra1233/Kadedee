import axios from 'axios';

export class SecurityHeadersDetector {
  constructor() {
    this.requiredHeaders = {
      'x-frame-options': 'Clickjacking protection',
      'x-content-type-options': 'MIME-sniffing protection',
      'strict-transport-security': 'HTTPS enforcement',
      'content-security-policy': 'XSS and injection protection',
      'x-xss-protection': 'XSS filter',
      'referrer-policy': 'Information disclosure control'
    };
  }

  async detect(endpoint) {
    const vulnerabilities = [];

    try {
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
        validateStatus: () => true
      });

      const missingHeaders = [];
      for (const [header, purpose] of Object.entries(this.requiredHeaders)) {
        if (!response.headers[header]) {
          missingHeaders.push(`${header} (${purpose})`);
        }
      }

      if (missingHeaders.length > 0) {
        vulnerabilities.push({
          type: 'MISSING_SECURITY_HEADERS',
          severity: 'LOW',
          url: endpoint.url,
          parameter: 'HTTP Headers',
          payload: 'N/A',
          evidence: `Missing headers: ${missingHeaders.join(', ')}`,
          description: 'Missing security headers',
          impact: 'Increased risk of clickjacking, XSS, MIME-sniffing attacks',
          remediation: 'Add security headers: X-Frame-Options, X-Content-Type-Options, CSP, HSTS, etc.',
          cwe: 'CWE-693',
          owasp: 'A05:2021 – Security Misconfiguration',
          reproductionSteps: [
            `1. Send request to ${endpoint.url}`,
            `2. Inspect response headers`,
            `3. Verify missing security headers`,
            `4. Test for related vulnerabilities`
          ],
          curlCommand: `curl -I -X GET "${endpoint.url}"`
        });
      }
    } catch (error) {}

    return vulnerabilities;
  }
}
