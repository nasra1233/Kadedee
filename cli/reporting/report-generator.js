import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export class ReportGenerator {
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  async generateReports(results, targetUrl) {
    if (!existsSync(this.outputDir)) {
      await mkdir(this.outputDir, { recursive: true });
    }

    await Promise.all([
      this.generateJSON(results),
      this.generateHTML(results, targetUrl),
      this.generateTXT(results, targetUrl)
    ]);
  }

  async generateJSON(results) {
    const jsonPath = join(this.outputDir, 'report.json');
    await writeFile(jsonPath, JSON.stringify(results, null, 2));
  }

  async generateHTML(results, targetUrl) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kadedee Security Report - ${targetUrl}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0e27; color: #e1e8f0; line-height: 1.6; }
    .container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; border-radius: 16px; margin-bottom: 40px; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3); }
    h1 { font-size: 3em; margin-bottom: 10px; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .subtitle { font-size: 1.2em; opacity: 0.9; color: #f0f0f0; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px; }
    .summary-card { background: #151b3d; padding: 30px; border-radius: 12px; border: 1px solid #2d3561; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .summary-card h3 { color: #8b9dc3; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
    .summary-card .value { font-size: 2.5em; font-weight: bold; color: white; }
    .critical { color: #ff4757; }
    .high { color: #ff6348; }
    .medium { color: #ffa502; }
    .low { color: #2ed573; }
    .section { background: #151b3d; border-radius: 12px; padding: 30px; margin-bottom: 30px; border: 1px solid #2d3561; }
    .section h2 { color: #667eea; margin-bottom: 20px; font-size: 1.8em; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .vuln-card { background: #1a2142; border-left: 4px solid #667eea; padding: 25px; margin-bottom: 20px; border-radius: 8px; transition: transform 0.2s; }
    .vuln-card:hover { transform: translateX(5px); }
    .vuln-card.critical { border-left-color: #ff4757; }
    .vuln-card.high { border-left-color: #ff6348; }
    .vuln-card.medium { border-left-color: #ffa502; }
    .vuln-card.low { border-left-color: #2ed573; }
    .vuln-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .vuln-title { font-size: 1.3em; font-weight: 600; color: white; }
    .severity-badge { padding: 6px 16px; border-radius: 20px; font-size: 0.85em; font-weight: 600; text-transform: uppercase; }
    .severity-badge.critical { background: #ff4757; color: white; }
    .severity-badge.high { background: #ff6348; color: white; }
    .severity-badge.medium { background: #ffa502; color: white; }
    .severity-badge.low { background: #2ed573; color: white; }
    .vuln-detail { margin: 15px 0; }
    .vuln-detail strong { color: #8b9dc3; display: inline-block; min-width: 120px; }
    .code { background: #0d1129; padding: 12px; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 0.9em; overflow-x: auto; border: 1px solid #2d3561; color: #7dd3fc; }
    .steps { background: #0d1129; padding: 20px; border-radius: 8px; margin-top: 15px; border: 1px solid #2d3561; }
    .steps ol { padding-left: 20px; }
    .steps li { margin: 10px 0; color: #c9d1d9; }
    .screenshot { max-width: 100%; border-radius: 8px; margin: 15px 0; border: 2px solid #2d3561; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    .ai-analysis { background: linear-gradient(135deg, #1a2142 0%, #2d1b4e 100%); padding: 30px; border-radius: 12px; border: 2px solid #667eea; }
    .risk-score { display: inline-block; padding: 20px 40px; background: #ff4757; color: white; border-radius: 50px; font-size: 2em; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4); }
    footer { text-align: center; padding: 40px 20px; color: #8b9dc3; border-top: 1px solid #2d3561; margin-top: 60px; }
    .impact-list { list-style: none; }
    .impact-list li { padding: 8px 0; padding-left: 30px; position: relative; }
    .impact-list li:before { content: "⚠"; position: absolute; left: 0; color: #ffa502; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🛡️ KADEDEE Security Report</h1>
      <p class="subtitle">Comprehensive Vulnerability Assessment</p>
      <p class="subtitle">Target: ${targetUrl}</p>
      <p class="subtitle">Scan Date: ${new Date(results.timestamp).toLocaleString()}</p>
    </header>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Vulnerabilities</h3>
        <div class="value">${results.vulnerabilities.length}</div>
      </div>
      <div class="summary-card">
        <h3>Endpoints Scanned</h3>
        <div class="value">${results.endpoints.length}</div>
      </div>
      <div class="summary-card">
        <h3>Critical Issues</h3>
        <div class="value critical">${results.vulnerabilities.filter(v => v.severity === 'CRITICAL').length}</div>
      </div>
      <div class="summary-card">
        <h3>High Severity</h3>
        <div class="value high">${results.vulnerabilities.filter(v => v.severity === 'HIGH').length}</div>
      </div>
    </div>

    ${results.aiAnalysis ? this.generateAIAnalysisHTML(results.aiAnalysis) : ''}

    <div class="section">
      <h2>🔍 Vulnerabilities Detected</h2>
      ${results.vulnerabilities.length === 0
        ? '<p style="color: #2ed573; font-size: 1.2em;">✅ No vulnerabilities detected</p>'
        : results.vulnerabilities.map(v => this.generateVulnHTML(v)).join('')
      }
    </div>

    <div class="section">
      <h2>📊 Statistics</h2>
      ${this.generateStatisticsHTML(results.statistics)}
    </div>
  </div>

  <footer>
    <p>Generated by <strong>Kadedee</strong> Security Scanner v1.0</p>
    <p>AI-Powered Defensive Security Tool</p>
  </footer>
</body>
</html>`;

    const htmlPath = join(this.outputDir, 'report.html');
    await writeFile(htmlPath, html);
  }

  generateAIAnalysisHTML(aiAnalysis) {
    return `
    <div class="section ai-analysis">
      <h2>🤖 AI-Powered Analysis</h2>
      <div class="vuln-detail">
        <strong>Executive Summary:</strong>
        <p>${aiAnalysis.executiveSummary.overview}</p>
        <p style="margin-top: 15px;"><strong>Recommendation:</strong> ${aiAnalysis.executiveSummary.recommendation}</p>
      </div>
      <div style="text-align: center;">
        <div class="risk-score">Risk Score: ${aiAnalysis.riskScore.score}/100</div>
        <p style="font-size: 1.2em; margin-top: 10px;">Level: <span class="${aiAnalysis.riskScore.level.toLowerCase()}">${aiAnalysis.riskScore.level}</span></p>
      </div>
      <div class="vuln-detail">
        <strong>Business Impact:</strong>
        <ul class="impact-list">
          ${Object.entries(aiAnalysis.businessImpact).filter(([k, v]) => v).map(([key]) =>
            `<li>${key.replace(/([A-Z])/g, ' $1').trim()}</li>`
          ).join('')}
        </ul>
      </div>
    </div>`;
  }

  generateVulnHTML(vuln) {
    return `
    <div class="vuln-card ${vuln.severity.toLowerCase()}">
      <div class="vuln-header">
        <div class="vuln-title">${vuln.type.replace(/_/g, ' ')}</div>
        <span class="severity-badge ${vuln.severity.toLowerCase()}">${vuln.severity}</span>
      </div>
      <div class="vuln-detail">
        <strong>Description:</strong> ${vuln.description}
      </div>
      <div class="vuln-detail">
        <strong>URL:</strong> <span class="code">${vuln.url}</span>
      </div>
      ${vuln.parameter ? `<div class="vuln-detail"><strong>Parameter:</strong> ${vuln.parameter}</div>` : ''}
      ${vuln.payload ? `<div class="vuln-detail"><strong>Payload:</strong> <div class="code">${this.escapeHtml(vuln.payload)}</div></div>` : ''}
      <div class="vuln-detail">
        <strong>Impact:</strong> ${vuln.impact}
      </div>
      <div class="vuln-detail">
        <strong>Remediation:</strong> ${vuln.remediation}
      </div>
      ${vuln.mlConfidence ? `<div class="vuln-detail"><strong>ML Confidence:</strong> ${(vuln.mlConfidence * 100).toFixed(1)}%</div>` : ''}
      ${vuln.cwe ? `<div class="vuln-detail"><strong>CWE:</strong> ${vuln.cwe}</div>` : ''}
      ${vuln.owasp ? `<div class="vuln-detail"><strong>OWASP:</strong> ${vuln.owasp}</div>` : ''}
      ${vuln.reproductionSteps ? `
        <div class="steps">
          <strong>📋 Manual Reproduction Steps:</strong>
          <ol>
            ${vuln.reproductionSteps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
      ` : ''}
      ${vuln.curlCommand ? `
        <div class="vuln-detail" style="margin-top: 15px;">
          <strong>cURL Command:</strong>
          <div class="code">${this.escapeHtml(vuln.curlCommand)}</div>
        </div>
      ` : ''}
      ${vuln.screenshotPath ? `
        <div class="vuln-detail">
          <strong>Screenshot Evidence:</strong><br>
          <img src="${vuln.screenshotPath}" class="screenshot" alt="Vulnerability screenshot">
        </div>
      ` : ''}
    </div>`;
  }

  generateStatisticsHTML(stats) {
    if (!stats) return '<p>No statistics available</p>';

    return `
      <div class="vuln-detail">
        <strong>By Severity:</strong>
        <ul>
          <li class="critical">Critical: ${stats.bySeverity?.critical || 0}</li>
          <li class="high">High: ${stats.bySeverity?.high || 0}</li>
          <li class="medium">Medium: ${stats.bySeverity?.medium || 0}</li>
          <li class="low">Low: ${stats.bySeverity?.low || 0}</li>
        </ul>
      </div>
      <div class="vuln-detail">
        <strong>By Type:</strong>
        <ul>
          ${Object.entries(stats.byType || {}).map(([type, count]) =>
            `<li>${type.replace(/_/g, ' ')}: ${count}</li>`
          ).join('')}
        </ul>
      </div>
    `;
  }

  async generateTXT(results, targetUrl) {
    let txt = `
╔════════════════════════════════════════════════════════════════════╗
║                  KADEDEE SECURITY REPORT                           ║
║              Comprehensive Vulnerability Assessment                 ║
╚════════════════════════════════════════════════════════════════════╝

Target: ${targetUrl}
Scan Date: ${new Date(results.timestamp).toLocaleString()}
Scan ID: ${results.scanId}

═══════════════════════════════════════════════════════════════════

SUMMARY
-------
Total Vulnerabilities: ${results.vulnerabilities.length}
Endpoints Scanned: ${results.endpoints.length}

By Severity:
  • CRITICAL: ${results.vulnerabilities.filter(v => v.severity === 'CRITICAL').length}
  • HIGH: ${results.vulnerabilities.filter(v => v.severity === 'HIGH').length}
  • MEDIUM: ${results.vulnerabilities.filter(v => v.severity === 'MEDIUM').length}
  • LOW: ${results.vulnerabilities.filter(v => v.severity === 'LOW').length}

═══════════════════════════════════════════════════════════════════

VULNERABILITIES
---------------

${results.vulnerabilities.map((v, i) => `
[${i + 1}] ${v.type.replace(/_/g, ' ')}
────────────────────────────────────────────────────────────────
Severity: ${v.severity}
URL: ${v.url}
${v.parameter ? `Parameter: ${v.parameter}` : ''}
${v.payload ? `Payload: ${v.payload}` : ''}

Description: ${v.description}

Impact: ${v.impact}

Remediation: ${v.remediation}

${v.cwe ? `CWE: ${v.cwe}` : ''}
${v.owasp ? `OWASP: ${v.owasp}` : ''}
${v.mlConfidence ? `ML Confidence: ${(v.mlConfidence * 100).toFixed(1)}%` : ''}

Reproduction Steps:
${v.reproductionSteps ? v.reproductionSteps.map((s, idx) => `  ${idx + 1}. ${s}`).join('\n') : 'N/A'}

cURL Command:
${v.curlCommand || 'N/A'}

${v.screenshotPath ? `Screenshot: ${v.screenshotPath}` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════════════════

${results.aiAnalysis ? `
AI ANALYSIS
-----------
${results.aiAnalysis.executiveSummary.overview}

Risk Score: ${results.aiAnalysis.riskScore.score}/100 (${results.aiAnalysis.riskScore.level})

Recommendation: ${results.aiAnalysis.executiveSummary.recommendation}

═══════════════════════════════════════════════════════════════════
` : ''}

Generated by Kadedee Security Scanner v1.0
AI-Powered Defensive Security Tool
`;

    const txtPath = join(this.outputDir, 'report.txt');
    await writeFile(txtPath, txt);
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
