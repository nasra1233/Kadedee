import axios from 'axios';

export class XSSDetector {
  constructor() {
    this.name = 'Cross-Site Scripting (XSS)';
    this.payloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload=alert("XSS")>',
      '<input onfocus=alert("XSS") autofocus>',
      '<select onfocus=alert("XSS") autofocus>',
      '<textarea onfocus=alert("XSS") autofocus>',
      '<marquee onstart=alert("XSS")>',
      '<details open ontoggle=alert("XSS")>',
      'javascript:alert("XSS")',
      '<a href="javascript:alert(\'XSS\')">Click</a>',
      '{{7*7}}',
      '${7*7}',
      '<script>console.log("KADEDEE_XSS_TEST")</script>'
    ];
  }

  async detect(endpoint) {
    const vulnerabilities = [];

    if (!endpoint.parameters || endpoint.parameters.length === 0) {
      return vulnerabilities;
    }

    for (const param of endpoint.parameters) {
      for (const payload of this.payloads) {
        try {
          const testUrl = this.buildTestUrl(endpoint.url, param, payload);
          const response = await axios.get(testUrl, {
            timeout: 10000,
            validateStatus: () => true
          });

          if (this.isVulnerable(response.data, payload)) {
            vulnerabilities.push({
              type: 'XSS',
              severity: this.determineSeverity(payload),
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: this.extractEvidence(response.data, payload),
              description: `Cross-Site Scripting (XSS) vulnerability detected in parameter '${param}'`,
              impact: 'Attacker can execute arbitrary JavaScript in victim browsers, steal session cookies, perform actions on behalf of users, deface websites, or redirect users to malicious sites',
              remediation: 'Implement proper output encoding based on context (HTML, JavaScript, URL, CSS). Use Content Security Policy (CSP) headers. Sanitize user input with allowlisting.',
              cwe: 'CWE-79',
              owasp: 'A03:2021 – Injection',
              reproductionSteps: this.generateReproductionSteps(testUrl, param, payload),
              curlCommand: this.generateCurlCommand(testUrl)
            });
            break;
          }
        } catch (error) {
          // Network errors
        }
      }
    }

    return vulnerabilities;
  }

  buildTestUrl(baseUrl, param, payload) {
    const url = new URL(baseUrl);
    url.searchParams.set(param, payload);
    return url.toString();
  }

  isVulnerable(responseData, payload) {
    const data = responseData.toString();
    const normalizedPayload = payload.toLowerCase();

    if (data.includes(payload)) {
      return true;
    }

    if (normalizedPayload.includes('<script>') && /<script[^>]*>[\s\S]*?<\/script>/i.test(data)) {
      return true;
    }

    if (normalizedPayload.includes('onerror') && /onerror\s*=\s*['"]/i.test(data)) {
      return true;
    }

    if (normalizedPayload.includes('onload') && /onload\s*=\s*['"]/i.test(data)) {
      return true;
    }

    if (normalizedPayload.includes('javascript:') && /javascript:/i.test(data)) {
      return true;
    }

    return false;
  }

  determineSeverity(payload) {
    if (payload.includes('onerror') || payload.includes('onload')) {
      return 'HIGH';
    }
    if (payload.includes('<script>')) {
      return 'CRITICAL';
    }
    return 'MEDIUM';
  }

  extractEvidence(data, payload) {
    const dataStr = data.toString();
    const index = dataStr.indexOf(payload);
    if (index !== -1) {
      const start = Math.max(0, index - 100);
      const end = Math.min(dataStr.length, index + payload.length + 100);
      return dataStr.substring(start, end).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return dataStr.substring(0, 500).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  generateReproductionSteps(url, param, payload) {
    return [
      `1. Open a web browser and navigate to: ${url}`,
      `2. The parameter '${param}' contains XSS payload: ${payload}`,
      `3. Inspect the page source (Right-click > View Page Source)`,
      `4. Search for the injected payload in the HTML`,
      `5. If using alert() payload, check if JavaScript alert box appears`,
      `6. Verify that the script is executed in the browser context`
    ];
  }

  generateCurlCommand(url) {
    return `curl -X GET "${url}" -H "User-Agent: Kadedee-Scanner"`;
  }
}
