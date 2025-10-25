import axios from 'axios';

export class SSTIDetector {
  constructor() {
    this.payloads = [
      '{{7*7}}',
      '${7*7}',
      '<%= 7*7 %>',
      '${{7*7}}',
      '#{7*7}',
      '*{7*7}',
      '{{7*\'7\'}}',
      '{{config.items()}}',
      '{{self}}',
      '{{7*7}}[[1]]',
      '{php}echo 7*7;{/php}',
      '{{request}}',
      '{{settings}}',
      '{%debug%}',
      '{{[].__class__.__base__.__subclasses__()}}'
    ];
    this.expectedResults = ['49', '7777777'];
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

          if (this.isVulnerable(response.data, payload)) {
            vulnerabilities.push({
              type: 'SSTI',
              severity: 'CRITICAL',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: response.data.toString().substring(0, 500),
              description: `Server-Side Template Injection (SSTI) in '${param}'`,
              impact: 'Remote code execution, full server compromise, data exfiltration',
              remediation: 'Use sandboxed template engines, avoid rendering user input directly in templates',
              cwe: 'CWE-94',
              owasp: 'A03:2021 – Injection',
              reproductionSteps: [
                `1. Navigate to: ${testUrl}`,
                `2. Check if mathematical expression is evaluated`,
                `3. Look for "49" in the response indicating 7*7 was executed`
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

  isVulnerable(data, payload) {
    const dataStr = data.toString();
    return this.expectedResults.some(result => dataStr.includes(result)) ||
           /config|settings|request|self|class|subclasses/i.test(dataStr);
  }
}
