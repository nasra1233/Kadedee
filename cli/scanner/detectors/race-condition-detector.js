import axios from 'axios';

export class RaceConditionDetector {
  async detect(endpoint) {
    const vulnerabilities = [];

    if (endpoint.method !== 'POST' && endpoint.method !== 'PUT') {
      return vulnerabilities;
    }

    try {
      const requests = Array(10).fill(null).map(() =>
        axios.post(endpoint.url, endpoint.data || {}, {
          timeout: 5000,
          validateStatus: () => true
        })
      );

      const responses = await Promise.all(requests);

      if (this.hasRaceCondition(responses)) {
        vulnerabilities.push({
          type: 'RACE_CONDITION',
          severity: 'MEDIUM',
          url: endpoint.url,
          parameter: 'N/A',
          payload: 'Concurrent requests',
          evidence: 'Multiple successful responses to concurrent requests',
          description: 'Potential race condition vulnerability',
          impact: 'Double spending, privilege escalation, data corruption',
          remediation: 'Implement proper locking mechanisms, use database transactions, add idempotency keys',
          cwe: 'CWE-362',
          owasp: 'A04:2021 – Insecure Design',
          reproductionSteps: [
            `1. Send multiple concurrent requests to ${endpoint.url}`,
            `2. Check for duplicate operations`,
            `3. Verify if race condition allows unauthorized actions`,
            `4. Test with time-sensitive operations`
          ],
          curlCommand: `for i in {1..10}; do curl -X POST "${endpoint.url}" & done; wait`
        });
      }
    } catch (error) {}

    return vulnerabilities;
  }

  hasRaceCondition(responses) {
    const successCount = responses.filter(r => r.status >= 200 && r.status < 300).length;
    return successCount > 5;
  }
}
