import axios from 'axios';

export class CORSDetector {
  async detect(endpoint) {
    const vulnerabilities = [];

    try {
      const response = await axios.get(endpoint.url, {
        headers: {
          'Origin': 'https://evil.com'
        },
        timeout: 5000,
        validateStatus: () => true
      });

      const acao = response.headers['access-control-allow-origin'];
      const acac = response.headers['access-control-allow-credentials'];

      if (this.isVulnerable(acao, acac)) {
        vulnerabilities.push({
          type: 'CORS_MISCONFIGURATION',
          severity: 'MEDIUM',
          url: endpoint.url,
          parameter: 'CORS Headers',
          payload: 'Origin: https://evil.com',
          evidence: `ACAO: ${acao}, ACAC: ${acac}`,
          description: 'Insecure CORS configuration',
          impact: 'Cross-origin data theft, credential leakage, sensitive data exposure',
          remediation: 'Restrict CORS to specific trusted origins, avoid wildcard with credentials',
          cwe: 'CWE-942',
          owasp: 'A05:2021 – Security Misconfiguration',
          reproductionSteps: [
            `1. Send request to ${endpoint.url}`,
            `2. Include Origin header: https://evil.com`,
            `3. Check Access-Control-Allow-Origin in response`,
            `4. Verify if credentials are allowed`
          ],
          curlCommand: `curl -H "Origin: https://evil.com" -I -X GET "${endpoint.url}"`
        });
      }
    } catch (error) {}

    return vulnerabilities;
  }

  isVulnerable(acao, acac) {
    if (!acao) return false;

    if (acao === '*' && acac === 'true') {
      return true;
    }

    if (acao === 'https://evil.com' || acao === 'null') {
      return true;
    }

    return false;
  }
}
