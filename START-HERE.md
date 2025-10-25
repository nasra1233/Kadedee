# 🛡️ KADEDEE Security Scanner - START HERE

## What is Kadedee?

Kadedee is a **comprehensive CLI security scanner** that helps you find vulnerabilities in your web applications. It combines traditional security testing with AI-powered analysis and machine learning.

## Quick Start (5 Minutes)

### 1. Install (2 minutes)

```bash
./INSTALL.sh
```

This installs all dependencies automatically.

### 2. Initialize (10 seconds)

```bash
node cli/index.js init
```

### 3. Scan Your First Target (1-3 minutes)

```bash
# Test with a vulnerable demo site
node cli/index.js scan http://testphp.vulnweb.com
```

### 4. View Results

Open the HTML report in your browser:

```bash
open kadedee-reports/report.html
```

## What You Get

### 13 Types of Vulnerabilities Detected

- SQL Injection
- Cross-Site Scripting (XSS)
- Server-Side Request Forgery (SSRF)
- XML External Entity (XXE)
- Template Injection (SSTI)
- Command Injection
- Local File Inclusion (LFI)
- Open Redirects
- Broken Access Control (IDOR)
- Cross-Site Request Forgery (CSRF)
- Missing Security Headers
- CORS Issues
- Race Conditions

### 3 Report Formats

1. **HTML Report** - Beautiful visual dashboard with screenshots
2. **JSON Report** - Machine-readable for automation
3. **Text Report** - Terminal-friendly detailed findings

### AI-Powered Analysis

Enable with `--ai-analysis`:
- Executive summaries
- Risk scoring (0-100)
- Business impact assessment
- Prioritized fixes with effort estimates

### Screenshots

Automatic visual proof of every vulnerability found.

## Common Commands

```bash
# Basic scan
node cli/index.js scan https://your-site.com

# Scan with AI analysis
node cli/index.js scan https://your-site.com --ai-analysis

# Deep scan (more thorough)
node cli/index.js scan https://your-site.com --depth 5

# Fast scan (less depth)
node cli/index.js scan https://your-site.com --depth 2

# View scan history
node cli/index.js report --list

# Get help
node cli/index.js --help
```

## Example Output

After scanning, you'll see:

```
╔════════════════════════════════════════════════════════════════════╗
║                  KADEDEE SECURITY REPORT                           ║
║              Comprehensive Vulnerability Assessment                 ║
╚════════════════════════════════════════════════════════════════════╝

Target: http://example.com
Scan Date: 2025-10-09 22:30:45
Scan ID: 1

═══════════════════════════════════════════════════════════════════

SUMMARY
-------
Total Vulnerabilities: 5
Endpoints Scanned: 23

By Severity:
  • CRITICAL: 2
  • HIGH: 1
  • MEDIUM: 2
  • LOW: 0
```

## Documentation

- **START-HERE.md** (this file) - Quick overview
- **QUICKSTART.md** - Detailed quick start guide
- **README-KADEDEE.md** - Complete documentation
- **KADEDEE-SUMMARY.md** - Technical architecture
- **PROJECT-STATUS.md** - Build status and features

## Important Security Notice

⚠️ **ONLY scan systems you own or have permission to test!**

Legal uses:
- ✅ Your own websites
- ✅ Your company's applications (with authorization)
- ✅ Lab/test environments
- ✅ Authorized penetration tests

Illegal uses:
- ❌ Random websites on the internet
- ❌ Competitors' sites
- ❌ Any system without explicit permission

## Features Highlights

### Self-Learning ML Engine
- Improves accuracy with each scan
- No cloud/API required
- Fully local operation

### Complete Evidence
Every vulnerability includes:
- Description and impact
- Screenshot proof
- Step-by-step reproduction
- cURL command to verify
- CWE and OWASP mappings

### Production Ready
- ~2,500 lines of code
- 22 JavaScript modules
- Comprehensive error handling
- Beautiful CLI interface

## System Requirements

- Node.js 18 or higher
- 2GB RAM minimum
- 500MB disk space

## Installation Issues?

### Puppeteer/Chromium Problems

```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser

# macOS
brew install chromium
```

### "Cannot find module" Error

```bash
# Re-run installation
./INSTALL.sh
```

## Next Steps

1. ✅ Install dependencies: `./INSTALL.sh`
2. ✅ Initialize database: `node cli/index.js init`
3. ✅ Run first scan: `node cli/index.js scan <url>`
4. ✅ View HTML report: `open kadedee-reports/report.html`
5. ✅ Read full docs: `README-KADEDEE.md`

## Support

For detailed information:
- Read **QUICKSTART.md** for usage examples
- Read **README-KADEDEE.md** for full documentation
- Check **PROJECT-STATUS.md** for feature list

## Version

**Kadedee v1.0.0** - Production Ready

---

**Remember**: Always get permission before scanning any system!
