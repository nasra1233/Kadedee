# KADEDEE

**Comprehensive Defensive Security Scanner with AI-Powered Vulnerability Detection**

Kadedee is an advanced CLI security tool that combines traditional vulnerability scanning with AI/ML analysis, machine learning pattern recognition, and automated screenshot evidence capture for defensive security testing.

## Features

### Core Capabilities

- **13+ Vulnerability Types Detected**
  - SQL Injection
  - Cross-Site Scripting (XSS)
  - Server-Side Request Forgery (SSRF)
  - XML External Entity (XXE)
  - Server-Side Template Injection (SSTI)
  - Command Injection
  - Local File Inclusion (LFI)
  - Open Redirect
  - IDOR (Insecure Direct Object References)
  - CSRF (Cross-Site Request Forgery)
  - Missing Security Headers
  - CORS Misconfiguration
  - Race Conditions

- **Advanced Web Crawler**
  - Automatic endpoint discovery
  - Form extraction and analysis
  - API endpoint detection
  - Configurable crawl depth
  - JavaScript-based endpoint discovery

- **Screenshot Evidence**
  - Automated screenshot capture of vulnerable pages
  - Visual proof of vulnerabilities
  - Full-page screenshots with headless browser

- **AI/ML Analysis**
  - Machine learning-based confidence scoring
  - Pattern recognition and learning
  - Self-updating vulnerability signatures
  - Risk assessment and business impact analysis
  - Executive summaries with actionable insights

- **Comprehensive Reporting**
  - JSON format for integration
  - Beautiful HTML reports with visual analytics
  - Plain text reports for terminals
  - Step-by-step manual reproduction guides
  - cURL commands for verification

- **Local Database**
  - SQLite-based scan history
  - Vulnerability tracking over time
  - ML training data persistence
  - Pattern learning and improvement

## Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Install Dependencies

```bash
# Navigate to project directory
cd /tmp/cc-agent/58356735/project

# Install using the CLI package configuration
npm install --prefix . \
  commander@^11.1.0 \
  chalk@^5.3.0 \
  ora@^7.0.1 \
  puppeteer@^21.5.2 \
  cheerio@^1.0.0-rc.12 \
  axios@^1.6.2 \
  better-sqlite3@^9.2.2 \
  cli-table3@^0.6.3 \
  inquirer@^9.2.12 \
  figlet@^1.7.0 \
  gradient-string@^2.0.2 \
  @tensorflow/tfjs-node@^4.15.0 \
  natural@^6.10.4 \
  compromise@^14.10.0
```

### Make Executable

```bash
chmod +x cli/index.js
```

### Optional: Link Globally

```bash
npm link
```

## Usage

### Initialize Database

```bash
node cli/index.js init
```

### Basic Scan

```bash
node cli/index.js scan https://example.com
```

### Advanced Scan Options

```bash
# Scan with custom depth
node cli/index.js scan https://example.com --depth 5

# Disable screenshots
node cli/index.js scan https://example.com --no-screenshots

# Enable AI analysis
node cli/index.js scan https://example.com --ai-analysis

# Custom output directory
node cli/index.js scan https://example.com --output ./my-reports

# More concurrent threads
node cli/index.js scan https://example.com --threads 10

# Combined options
node cli/index.js scan https://example.com \
  --depth 4 \
  --ai-analysis \
  --threads 8 \
  --output ./security-audit
```

### View Scan History

```bash
# List all scans
node cli/index.js report --list

# View specific scan by ID
node cli/index.js report --id 1
```

### Help

```bash
node cli/index.js --help
node cli/index.js scan --help
node cli/index.js report --help
```

## Report Formats

After each scan, Kadedee generates three report formats:

### 1. JSON Report (`report.json`)
- Machine-readable format
- Complete scan data
- Ideal for CI/CD integration
- API consumption

### 2. HTML Report (`report.html`)
- Beautiful visual presentation
- Interactive dashboard
- Screenshot embedding
- Executive summaries
- Risk scoring visualization

### 3. Text Report (`report.txt`)
- Terminal-friendly format
- Easy to read and share
- Plain text for documentation
- Command-line focused

## Output Structure

```
kadedee-reports/
├── report.json
├── report.html
├── report.txt
└── screenshots/
    ├── vuln_SQL_INJECTION_1234567890.png
    ├── vuln_XSS_1234567891.png
    └── ...

kadedee-data/
└── kadedee.db

kadedee-models/
├── model.json
├── weights.bin
└── patterns.json
```

## Security Notice

**IMPORTANT:** Kadedee is a defensive security tool designed for:

- Testing your own applications
- Authorized penetration testing
- Security research with explicit permission
- Educational purposes on controlled environments

**DO NOT:**
- Scan systems you don't own
- Use without explicit written permission
- Deploy against production systems without authorization
- Use for malicious purposes

## Architecture

### Components

1. **Scanner Engine** (`cli/scanner/`)
   - Vulnerability detection logic
   - Individual detector modules
   - Crawling functionality

2. **AI/ML Engine** (`cli/ai/`)
   - TensorFlow.js-based ML models
   - Natural language processing
   - Pattern learning and updates

3. **Database Layer** (`cli/database/`)
   - SQLite persistence
   - Scan history tracking
   - Training data storage

4. **Reporting System** (`cli/reporting/`)
   - Multi-format report generation
   - HTML templating
   - Data visualization

5. **Screenshot Capture** (`cli/scanner/screenshot-capture.js`)
   - Puppeteer-based automation
   - Evidence collection
   - Visual proof generation

## Configuration

Kadedee uses sensible defaults but can be configured:

- **Depth**: Controls crawl depth (default: 3)
- **Threads**: Concurrent scanning threads (default: 5)
- **Screenshots**: Enable/disable screenshot capture (default: enabled)
- **AI Analysis**: Enable AI-powered insights (default: disabled)
- **Output Directory**: Report destination (default: ./kadedee-reports)

## Machine Learning

Kadedee includes a self-learning ML engine:

- **Pattern Recognition**: Learns from each scan
- **Confidence Scoring**: ML-based vulnerability confidence
- **Signature Updates**: Automatically updates detection patterns
- **False Positive Reduction**: Improves accuracy over time

The ML model:
- Trains on vulnerability features
- Uses TensorFlow.js for neural networks
- Stores patterns locally
- Updates incrementally with each scan

## Performance

- **Concurrent Scanning**: Multi-threaded vulnerability detection
- **Smart Crawling**: Efficient endpoint discovery
- **Caching**: Reduces redundant requests
- **Timeout Management**: Prevents hanging scans

## Troubleshooting

### Puppeteer Installation Issues

```bash
# Install Chromium dependencies on Linux
sudo apt-get install -y \
  chromium-browser \
  libx11-xcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxi6 \
  libxtst6 \
  libnss3 \
  libcups2 \
  libxss1 \
  libxrandr2 \
  libasound2 \
  libatk1.0-0 \
  libgtk-3-0
```

### Database Locked

```bash
# Remove database lock
rm kadedee-data/kadedee.db-wal
rm kadedee-data/kadedee.db-shm
```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" node cli/index.js scan <url>
```

## Development

### Project Structure

```
cli/
├── index.js                 # Main CLI entry point
├── scanner/
│   ├── vulnerability-scanner.js
│   ├── crawler.js
│   ├── screenshot-capture.js
│   └── detectors/
│       ├── vulnerability-detector.js
│       ├── sqli-detector.js
│       ├── xss-detector.js
│       └── ...
├── ai/
│   ├── ai-analyzer.js
│   └── ml-engine.js
├── database/
│   └── db.js
└── reporting/
    └── report-generator.js
```

## License

Use responsibly for defensive security purposes only.

## Disclaimer

This tool is provided for educational and authorized security testing purposes only. The authors and contributors are not responsible for any misuse or damage caused by this tool. Always obtain proper authorization before scanning any systems.

## Support

For issues, improvements, or questions, please ensure you:
- Have proper authorization to scan target systems
- Are using the latest version
- Have all dependencies installed correctly
- Follow responsible disclosure practices

---

**Built with:** Node.js, TensorFlow.js, Puppeteer, SQLite, Natural NLP

**Version:** 1.0.0
