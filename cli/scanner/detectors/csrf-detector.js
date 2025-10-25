import axios from 'axios';

export class CSRFDetector {
  async detect(endpoint) {
    const vulnerabilities = [];

    try {
      const response = await axios.get(endpoint.url, {
        timeout: 5000,
        validateStatus: () => true
      });

      const hasCSRFToken = this.hasCSRFProtection(response);
      const hasSameSiteCookie = this.hasSameSiteCookie(response);

      if (!hasCSRFToken && !hasSameSiteCookie) {
        vulnerabilities.push({
          type: 'CSRF',
          severity: 'MEDIUM',
          url: endpoint.url,
          parameter: 'N/A',
          payload: 'N/A',
          evidence: 'No CSRF token or SameSite cookie attribute found',
          description: 'Missing CSRF protection',
          impact: 'Attackers can perform unauthorized actions on behalf of authenticated users',
          remediation: 'Implement CSRF tokens, use SameSite cookie attribute, verify Origin/Referer headers',
          cwe: 'CWE-352',
          owasp: 'A01:2021 – Broken Access Control',
          reproductionSteps: [
            `1. Inspect HTML forms at ${endpoint.url}`,
            `2. Check for CSRF token fields`,
            `3. Verify Set-Cookie headers for SameSite attribute`,
            `4. Attempt cross-origin form submission`
          ],
          curlCommand: `curl -I -X GET "${endpoint.url}"`
        });
      }
    } catch (error) {}

    return vulnerabilities;
  }

  hasCSRFProtection(response) {
    const html = response.data.toString();
    return /csrf|_token|authenticity_token|__RequestVerificationToken/i.test(html);
  }

  hasSameSiteCookie(response) {
    const cookies = response.headers['set-cookie'] || [];
    return cookies.some(cookie => /samesite=(strict|lax)/i.test(cookie));
  }
}
