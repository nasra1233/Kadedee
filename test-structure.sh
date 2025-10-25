#!/bin/bash

echo "Testing Kadedee structure..."
echo ""

# Check main files
echo "✓ Checking main files..."
files=(
  "cli/index.js"
  "cli/scanner/vulnerability-scanner.js"
  "cli/scanner/crawler.js"
  "cli/scanner/screenshot-capture.js"
  "cli/scanner/detectors/vulnerability-detector.js"
  "cli/scanner/detectors/sqli-detector.js"
  "cli/scanner/detectors/xss-detector.js"
  "cli/scanner/detectors/ssrf-detector.js"
  "cli/scanner/detectors/xxe-detector.js"
  "cli/scanner/detectors/ssti-detector.js"
  "cli/scanner/detectors/command-injection-detector.js"
  "cli/scanner/detectors/lfi-detector.js"
  "cli/scanner/detectors/open-redirect-detector.js"
  "cli/scanner/detectors/idor-detector.js"
  "cli/scanner/detectors/csrf-detector.js"
  "cli/scanner/detectors/security-headers-detector.js"
  "cli/scanner/detectors/cors-detector.js"
  "cli/scanner/detectors/race-condition-detector.js"
  "cli/ai/ai-analyzer.js"
  "cli/ai/ml-engine.js"
  "cli/database/db.js"
  "cli/reporting/report-generator.js"
  "cli-package.json"
  "README-KADEDEE.md"
  "INSTALL.sh"
)

missing=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ MISSING: $file"
    missing=$((missing + 1))
  fi
done

echo ""
if [ $missing -eq 0 ]; then
  echo "✅ All files present! Structure is complete."
  echo ""
  echo "Next steps:"
  echo "1. Run: ./INSTALL.sh"
  echo "2. Test: node cli/index.js --help"
else
  echo "❌ $missing files are missing"
  exit 1
fi
