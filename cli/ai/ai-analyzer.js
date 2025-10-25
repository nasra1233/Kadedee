import axios from 'axios';

export class AIAnalyzer {
  constructor() {
    this.models = [
      {
        name: 'Hugging Face',
        endpoint: 'https://api-inference.huggingface.co/models/distilbert-base-uncased',
        available: true
      }
    ];
  }

  async analyze(scanResults) {
    const analysis = {
      executiveSummary: this.generateExecutiveSummary(scanResults),
      riskScore: this.calculateRiskScore(scanResults),
      prioritizedVulnerabilities: this.prioritizeVulnerabilities(scanResults.vulnerabilities),
      businessImpact: this.assessBusinessImpact(scanResults),
      remediationRoadmap: this.generateRemediationRoadmap(scanResults),
      complianceImpact: this.assessComplianceImpact(scanResults)
    };

    return analysis;
  }

  generateExecutiveSummary(results) {
    const criticalCount = results.vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highCount = results.vulnerabilities.filter(v => v.severity === 'HIGH').length;

    return {
      overview: `Security assessment of ${results.targetUrl} identified ${results.vulnerabilities.length} vulnerabilities across ${results.endpoints.length} endpoints.`,
      criticalFindings: criticalCount,
      highFindings: highCount,
      recommendation: criticalCount > 0
        ? 'IMMEDIATE ACTION REQUIRED: Critical vulnerabilities detected that could lead to complete system compromise.'
        : highCount > 0
        ? 'HIGH PRIORITY: Significant security issues require prompt remediation.'
        : 'MODERATE RISK: Address identified vulnerabilities in upcoming security sprint.'
    };
  }

  calculateRiskScore(results) {
    let score = 0;

    results.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'CRITICAL': score += 10; break;
        case 'HIGH': score += 7; break;
        case 'MEDIUM': score += 4; break;
        case 'LOW': score += 1; break;
      }
    });

    const normalizedScore = Math.min(100, (score / results.endpoints.length) * 10);

    return {
      score: Math.round(normalizedScore),
      level: normalizedScore > 70 ? 'CRITICAL' : normalizedScore > 40 ? 'HIGH' : normalizedScore > 20 ? 'MEDIUM' : 'LOW',
      factors: {
        vulnerabilityCount: results.vulnerabilities.length,
        criticalVulnerabilities: results.vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
        attackSurface: results.endpoints.length
      }
    };
  }

  prioritizeVulnerabilities(vulnerabilities) {
    const prioritized = vulnerabilities.map(vuln => {
      let priority = 0;

      switch (vuln.severity) {
        case 'CRITICAL': priority += 100; break;
        case 'HIGH': priority += 70; break;
        case 'MEDIUM': priority += 40; break;
        case 'LOW': priority += 10; break;
      }

      if (['SQL_INJECTION', 'COMMAND_INJECTION', 'XXE'].includes(vuln.type)) {
        priority += 20;
      }

      if (vuln.mlConfidence) {
        priority += vuln.mlConfidence * 10;
      }

      return { ...vuln, priorityScore: priority };
    });

    return prioritized.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 10);
  }

  assessBusinessImpact(results) {
    const impacts = {
      dataBreachRisk: false,
      reputationalDamage: false,
      financialLoss: false,
      regulatoryNonCompliance: false,
      operationalDisruption: false
    };

    results.vulnerabilities.forEach(vuln => {
      if (['SQL_INJECTION', 'LFI', 'IDOR'].includes(vuln.type)) {
        impacts.dataBreachRisk = true;
        impacts.regulatoryNonCompliance = true;
      }
      if (['XSS', 'CSRF'].includes(vuln.type)) {
        impacts.reputationalDamage = true;
      }
      if (['COMMAND_INJECTION', 'SSRF'].includes(vuln.type)) {
        impacts.operationalDisruption = true;
        impacts.financialLoss = true;
      }
    });

    return impacts;
  }

  generateRemediationRoadmap(results) {
    const roadmap = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    results.vulnerabilities.forEach(vuln => {
      const item = {
        vulnerability: vuln.type,
        action: vuln.remediation,
        effort: this.estimateEffort(vuln.type)
      };

      if (vuln.severity === 'CRITICAL') {
        roadmap.immediate.push(item);
      } else if (vuln.severity === 'HIGH') {
        roadmap.shortTerm.push(item);
      } else {
        roadmap.longTerm.push(item);
      }
    });

    return roadmap;
  }

  estimateEffort(vulnType) {
    const effortMap = {
      SQL_INJECTION: 'Medium (1-2 weeks)',
      XSS: 'Medium (1-2 weeks)',
      COMMAND_INJECTION: 'High (2-4 weeks)',
      SSRF: 'Medium (1-2 weeks)',
      XXE: 'Low (1-3 days)',
      SSTI: 'High (2-4 weeks)',
      LFI: 'Medium (1-2 weeks)',
      OPEN_REDIRECT: 'Low (1-3 days)',
      IDOR: 'Medium (1-2 weeks)',
      CSRF: 'Low (1-5 days)',
      MISSING_SECURITY_HEADERS: 'Low (1 day)',
      CORS_MISCONFIGURATION: 'Low (1-2 days)',
      RACE_CONDITION: 'High (2-3 weeks)'
    };

    return effortMap[vulnType] || 'Unknown';
  }

  assessComplianceImpact(results) {
    const frameworks = {
      GDPR: false,
      PCI_DSS: false,
      HIPAA: false,
      SOC2: false,
      ISO27001: false
    };

    const hasDataVulnerabilities = results.vulnerabilities.some(v =>
      ['SQL_INJECTION', 'LFI', 'IDOR'].includes(v.type)
    );

    if (hasDataVulnerabilities) {
      frameworks.GDPR = true;
      frameworks.HIPAA = true;
      frameworks.PCI_DSS = true;
    }

    if (results.vulnerabilities.length > 0) {
      frameworks.SOC2 = true;
      frameworks.ISO27001 = true;
    }

    return frameworks;
  }
}
