import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export class Database {
  constructor() {
    const dbDir = './kadedee-data';
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }

    this.db = new Database(join(dbDir, 'kadedee.db'));
    this.initializeTables();
  }

  initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        target_url TEXT NOT NULL,
        scan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'in_progress',
        vulnerability_count INTEGER DEFAULT 0,
        endpoint_count INTEGER DEFAULT 0,
        risk_score INTEGER DEFAULT 0,
        results_json TEXT,
        error TEXT
      );

      CREATE TABLE IF NOT EXISTS vulnerabilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        url TEXT NOT NULL,
        parameter TEXT,
        payload TEXT,
        evidence TEXT,
        description TEXT,
        impact TEXT,
        remediation TEXT,
        cwe TEXT,
        owasp TEXT,
        screenshot_path TEXT,
        ml_confidence REAL,
        reproduction_steps TEXT,
        curl_command TEXT,
        discovered_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scan_id) REFERENCES scans(id)
      );

      CREATE TABLE IF NOT EXISTS endpoints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scan_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        method TEXT,
        status_code INTEGER,
        content_type TEXT,
        parameters TEXT,
        forms TEXT,
        FOREIGN KEY (scan_id) REFERENCES scans(id)
      );

      CREATE TABLE IF NOT EXISTS ml_training_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vulnerability_type TEXT NOT NULL,
        features TEXT NOT NULL,
        label INTEGER NOT NULL,
        created_date DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_scans_date ON scans(scan_date);
      CREATE INDEX IF NOT EXISTS idx_vulns_scan ON vulnerabilities(scan_id);
      CREATE INDEX IF NOT EXISTS idx_vulns_severity ON vulnerabilities(severity);
      CREATE INDEX IF NOT EXISTS idx_vulns_type ON vulnerabilities(type);
      CREATE INDEX IF NOT EXISTS idx_endpoints_scan ON endpoints(scan_id);
    `);
  }

  createScan(targetUrl) {
    const stmt = this.db.prepare(`
      INSERT INTO scans (target_url, status)
      VALUES (?, 'in_progress')
    `);

    const result = stmt.run(targetUrl);
    return result.lastInsertRowid;
  }

  updateScan(scanId, data) {
    const updates = [];
    const values = [];

    if (data.vulnerabilities) {
      updates.push('vulnerability_count = ?');
      values.push(data.vulnerabilities.length);
    }

    if (data.endpoints) {
      updates.push('endpoint_count = ?');
      values.push(data.endpoints.length);
    }

    if (data.statistics?.riskScore) {
      updates.push('risk_score = ?');
      values.push(data.statistics.riskScore);
    }

    if (data.error) {
      updates.push('error = ?', 'status = ?');
      values.push(data.error, 'error');
    } else {
      updates.push('status = ?', 'results_json = ?');
      values.push('completed', JSON.stringify(data));
    }

    if (updates.length > 0) {
      values.push(scanId);
      const stmt = this.db.prepare(`
        UPDATE scans
        SET ${updates.join(', ')}
        WHERE id = ?
      `);
      stmt.run(...values);
    }
  }

  saveVulnerability(scanId, vuln) {
    const stmt = this.db.prepare(`
      INSERT INTO vulnerabilities (
        scan_id, type, severity, url, parameter, payload,
        evidence, description, impact, remediation, cwe, owasp,
        screenshot_path, ml_confidence, reproduction_steps, curl_command
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      scanId,
      vuln.type,
      vuln.severity,
      vuln.url,
      vuln.parameter || null,
      vuln.payload || null,
      vuln.evidence || null,
      vuln.description || null,
      vuln.impact || null,
      vuln.remediation || null,
      vuln.cwe || null,
      vuln.owasp || null,
      vuln.screenshotPath || null,
      vuln.mlConfidence || null,
      JSON.stringify(vuln.reproductionSteps || []),
      vuln.curlCommand || null
    );
  }

  saveEndpoint(scanId, endpoint) {
    const stmt = this.db.prepare(`
      INSERT INTO endpoints (scan_id, url, method, status_code, content_type, parameters, forms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      scanId,
      endpoint.url,
      endpoint.method,
      endpoint.statusCode,
      endpoint.contentType,
      JSON.stringify(endpoint.parameters || []),
      JSON.stringify(endpoint.forms || [])
    );
  }

  getScanById(scanId) {
    const stmt = this.db.prepare('SELECT * FROM scans WHERE id = ?');
    const scan = stmt.get(scanId);

    if (!scan) return null;

    const vulnStmt = this.db.prepare('SELECT * FROM vulnerabilities WHERE scan_id = ?');
    scan.vulnerabilities = vulnStmt.all(scanId);

    return scan;
  }

  listScans(limit = 50) {
    const stmt = this.db.prepare(`
      SELECT id, target_url, scan_date, status, vulnerability_count, endpoint_count, risk_score
      FROM scans
      ORDER BY scan_date DESC
      LIMIT ?
    `);

    return stmt.all(limit);
  }

  getVulnerabilitiesBySeverity(severity) {
    const stmt = this.db.prepare('SELECT * FROM vulnerabilities WHERE severity = ? ORDER BY discovered_date DESC');
    return stmt.all(severity);
  }

  getVulnerabilitiesByType(type) {
    const stmt = this.db.prepare('SELECT * FROM vulnerabilities WHERE type = ? ORDER BY discovered_date DESC');
    return stmt.all(type);
  }

  getStatistics() {
    const stats = {
      totalScans: this.db.prepare('SELECT COUNT(*) as count FROM scans').get().count,
      totalVulnerabilities: this.db.prepare('SELECT COUNT(*) as count FROM vulnerabilities').get().count,
      bySeverity: {},
      byType: {}
    };

    const severityStats = this.db.prepare(`
      SELECT severity, COUNT(*) as count
      FROM vulnerabilities
      GROUP BY severity
    `).all();

    severityStats.forEach(row => {
      stats.bySeverity[row.severity] = row.count;
    });

    const typeStats = this.db.prepare(`
      SELECT type, COUNT(*) as count
      FROM vulnerabilities
      GROUP BY type
    `).all();

    typeStats.forEach(row => {
      stats.byType[row.type] = row.count;
    });

    return stats;
  }

  close() {
    this.db.close();
  }
}
