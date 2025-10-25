Kadedee Quick Start Guide
Installation (3 minutes)
Step 1: Run Installation Script
./INSTALL.sh
This will:

Check Node.js version
Install all dependencies (may take 2-3 minutes)
Set up the CLI
Initialize the database
Step 2: Verify Installation
node cli/index.js --help
You should see the Kadedee banner and help menu.

Basic Usage
Initialize Database
node cli/index.js init
Your First Scan
# Basic scan (recommended for first-time users)
node cli/index.js scan http://testphp.vulnweb.com

# Or test with a local server
node cli/index.js scan http://localhost:3000
Scan with All Features
node cli/index.js scan http://testphp.vulnweb.com \
  --ai-analysis \
  --depth 4 \
  --threads 5
View Results
After scanning, check these locations:

HTML Report: kadedee-reports/report.html (open in browser)
JSON Report: kadedee-reports/report.json (for automation)
Text Report: kadedee-reports/report.txt (for terminal)
Screenshots: kadedee-reports/screenshots/ (evidence images)
View Scan History
# List all previous scans
node cli/index.js report --list

# View specific scan details
node cli/index.js report --id 1
Common Options
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
Understanding Reports
Severity Levels
CRITICAL: Immediate action required (RCE, SQLi, etc.)
HIGH: Serious security risk (XSS, SSRF, etc.)
MEDIUM: Moderate risk (CSRF, Open Redirect, etc.)
LOW: Security improvement (Missing headers, etc.)
Vulnerability Types
Kadedee detects 13+ vulnerability types:

SQL Injection - Database attacks
XSS - JavaScript injection
SSRF - Server-side request forgery
XXE - XML external entity attacks
SSTI - Template injection
Command Injection - OS command execution
LFI - Local file inclusion
Open Redirect - Phishing vector
IDOR - Broken access control
CSRF - Cross-site request forgery
Missing Security Headers - Configuration issues
CORS Misconfiguration - Cross-origin issues
Race Conditions - Timing vulnerabilities
Test Targets
For learning and testing:

# DVWA (Damn Vulnerable Web Application)
node cli/index.js scan http://localhost/DVWA

# WebGoat
node cli/index.js scan http://localhost:8080/WebGoat

# Public vulnerable test sites (with permission)
node cli/index.js scan http://testphp.vulnweb.com
node cli/index.js scan http://testhtml5.vulnweb.com
Troubleshooting
"Cannot find module" Error
# Re-run installation
./INSTALL.sh
Puppeteer/Chromium Issues
# On Ubuntu/Debian
sudo apt-get install chromium-browser

# On macOS
brew install chromium
Slow Scans
# Reduce depth and increase threads
node cli/index.js scan <url> --depth 2 --threads 10
Database Locked
# Remove lock files
rm kadedee-data/kadedee.db-wal
rm kadedee-data/kadedee.db-shm
Advanced Features
AI Analysis
The --ai-analysis flag enables:

Executive summaries
Risk scoring (0-100)
Business impact assessment
Prioritized remediation roadmap
Compliance impact (GDPR, PCI-DSS, etc.)
Machine Learning
Kadedee automatically:

Learns from each scan
Updates vulnerability patterns
Improves detection accuracy
Reduces false positives over time
Screenshots
Automatically captures:

Visual proof of vulnerabilities
Full-page screenshots
Evidence for reports
Safety Reminders
⚠️ ONLY scan systems you own or have written permission to test!

Legal usage:

✅ Your own websites/applications
✅ Authorized penetration tests
✅ Lab environments
✅ With explicit written permission
Illegal usage:

❌ Third-party websites without permission
❌ Production systems without authorization
❌ Any unauthorized scanning
Next Steps
Read full documentation: README-KADEDEE.md
Try scanning your own application
Review the HTML report in a browser
Explore the scan history with report --list
Enable AI analysis for deeper insights
Getting Help
# General help
node cli/index.js --help

# Command-specific help
node cli/index.js scan --help
node cli/index.js report --help
Example Workflow
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
Happy Scanning! Remember: Use responsibly and only on authorized systems.
