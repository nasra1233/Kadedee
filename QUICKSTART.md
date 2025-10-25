# Kadedee Quick Start Guide

## Installation (3 minutes)

### Step 1: Run Installation Script

```bash
./INSTALL.sh
```

This will:
- Check Node.js version
- Install all dependencies (may take 2-3 minutes)
- Set up the CLI
- Initialize the database

### Step 2: Verify Installation

```bash
node cli/index.js --help
```

You should see the Kadedee banner and help menu.

## Basic Usage

### Initialize Database

```bash
node cli/index.js init
```

### Your First Scan

```bash
# Basic scan (recommended for first-time users)
node cli/index.js scan http://testphp.vulnweb.com

# Or test with a local server
node cli/index.js scan http://localhost:3000
```

### Scan with All Features

```bash
node cli/index.js scan http://testphp.vulnweb.com \
  --ai-analysis \
  --depth 4 \
  --threads 5
```

### View Results

After scanning, check these locations:

1. **HTML Report**: `kadedee-reports/report.html` (open in browser)
2. **JSON Report**: `kadedee-reports/report.json` (for automation)
3. **Text Report**: `kadedee-reports/report.txt` (for terminal)
4. **Screenshots**: `kadedee-reports/screenshots/` (evidence images)

### View Scan History

```bash
# List all previous scans
node cli/index.js report --list

# View specific scan details
node cli/index.js report --id 1
```

## Common Options

```bash
# Scan Options
--depth <number>        # How deep to crawl (default: 3)
--threads <number>      # Concurrent threads (default: 5)
--output <path>         # Report directory (default: ./kadedee-reports)
--no-screenshots        # Disable screenshot capture
--ai-analysis          # Enable AI-powered insights

# Examples
node cli/index.js scan https://example.com --depth 2
node cli/index.js scan https://example.com --no-screenshots
node cli/index.js scan https://example.com --output ./my-scan
```

## Understanding Reports

### Severity Levels

- **CRITICAL**: Immediate action required (RCE, SQLi, etc.)
- **HIGH**: Serious security risk (XSS, SSRF, etc.)
- **MEDIUM**: Moderate risk (CSRF, Open Redirect, etc.)
- **LOW**: Security improvement (Missing headers, etc.)

### Vulnerability Types

Kadedee detects 13+ vulnerability types:

1. **SQL Injection** - Database attacks
2. **XSS** - JavaScript injection
3. **SSRF** - Server-side request forgery
4. **XXE** - XML external entity attacks
5. **SSTI** - Template injection
6. **Command Injection** - OS command execution
7. **LFI** - Local file inclusion
8. **Open Redirect** - Phishing vector
9. **IDOR** - Broken access control
10. **CSRF** - Cross-site request forgery
11. **Missing Security Headers** - Configuration issues
12. **CORS Misconfiguration** - Cross-origin issues
13. **Race Conditions** - Timing vulnerabilities

## Test Targets

For learning and testing:

```bash
# DVWA (Damn Vulnerable Web Application)
node cli/index.js scan http://localhost/DVWA

# WebGoat
node cli/index.js scan http://localhost:8080/WebGoat

# Public vulnerable test sites (with permission)
node cli/index.js scan http://testphp.vulnweb.com
node cli/index.js scan http://testhtml5.vulnweb.com
```

## Troubleshooting

### "Cannot find module" Error

```bash
# Re-run installation
./INSTALL.sh
```

### Puppeteer/Chromium Issues

```bash
# On Ubuntu/Debian
sudo apt-get install chromium-browser

# On macOS
brew install chromium
```

### Slow Scans

```bash
# Reduce depth and increase threads
node cli/index.js scan <url> --depth 2 --threads 10
```

### Database Locked

```bash
# Remove lock files
rm kadedee-data/kadedee.db-wal
rm kadedee-data/kadedee.db-shm
```

## Advanced Features

### AI Analysis

The `--ai-analysis` flag enables:
- Executive summaries
- Risk scoring (0-100)
- Business impact assessment
- Prioritized remediation roadmap
- Compliance impact (GDPR, PCI-DSS, etc.)

### Machine Learning

Kadedee automatically:
- Learns from each scan
- Updates vulnerability patterns
- Improves detection accuracy
- Reduces false positives over time

### Screenshots

Automatically captures:
- Visual proof of vulnerabilities
- Full-page screenshots
- Evidence for reports

## Safety Reminders

⚠️ **ONLY scan systems you own or have written permission to test!**

Legal usage:
- ✅ Your own websites/applications
- ✅ Authorized penetration tests
- ✅ Lab environments
- ✅ With explicit written permission

Illegal usage:
- ❌ Third-party websites without permission
- ❌ Production systems without authorization
- ❌ Any unauthorized scanning

## Next Steps

1. Read full documentation: `README-KADEDEE.md`
2. Try scanning your own application
3. Review the HTML report in a browser
4. Explore the scan history with `report --list`
5. Enable AI analysis for deeper insights

## Getting Help

```bash
# General help
node cli/index.js --help

# Command-specific help
node cli/index.js scan --help
node cli/index.js report --help
```

## Example Workflow

```bash
# 1. Initialize
node cli/index.js init

# 2. Scan your app
node cli/index.js scan https://myapp.local \
  --ai-analysis \
  --depth 3 \
  --output ./security-audit

# 3. Open HTML report
open ./security-audit/report.html

# 4. Review findings
cat ./security-audit/report.txt

# 5. Check history
node cli/index.js report --list
```

---

**Happy Scanning! Remember: Use responsibly and only on authorized systems.**
