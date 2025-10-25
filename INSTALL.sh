#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                   KADEDEE SECURITY SCANNER                         ║"
echo "║                      Installation Script                           ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "✗ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This may take a few minutes..."
echo ""

npm install \
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

if [ $? -ne 0 ]; then
    echo "✗ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✓ Dependencies installed successfully"
echo ""

# Make CLI executable
echo "🔧 Setting up CLI..."
chmod +x cli/index.js

# Create necessary directories
mkdir -p kadedee-reports
mkdir -p kadedee-data
mkdir -p kadedee-models

echo "✓ CLI configured"
echo ""

# Initialize database
echo "🗄️  Initializing database..."
node cli/index.js init

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                  ✅ INSTALLATION COMPLETE                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📚 Usage:"
echo "   node cli/index.js scan <url>              # Basic scan"
echo "   node cli/index.js scan <url> --ai-analysis # Scan with AI"
echo "   node cli/index.js report --list           # View history"
echo "   node cli/index.js --help                  # Show help"
echo ""
echo "📖 Read README-KADEDEE.md for full documentation"
echo ""
echo "⚠️  Remember: Only scan systems you own or have permission to test!"
echo ""
