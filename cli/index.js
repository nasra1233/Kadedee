#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { VulnerabilityScanner } from './scanner/vulnerability-scanner.js';
import { ReportGenerator } from './reporting/report-generator.js';
import { Database } from './database/db.js';

const program = new Command();

function showBanner() {
  console.clear();
  const banner = figlet.textSync('KADEDEE', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  console.log(gradient.pastel.multiline(banner));
  console.log(chalk.cyan('\n  🛡️  Comprehensive Defensive Security Scanner'));
  console.log(chalk.gray('  AI-Powered Vulnerability Detection & Analysis\n'));
  console.log(chalk.yellow('  ⚠️  Use only on systems you own or have permission to test\n'));
}

program
  .name('kadedee')
  .description('AI-powered defensive security vulnerability scanner')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan a target URL for vulnerabilities')
  .argument('<url>', 'Target URL to scan')
  .option('-d, --depth <number>', 'Crawl depth', '3')
  .option('-o, --output <path>', 'Output directory for reports', './kadedee-reports')
  .option('--no-screenshots', 'Disable screenshot capture')
  .option('--ai-analysis', 'Enable AI-powered analysis')
  .option('-t, --threads <number>', 'Number of concurrent threads', '5')
  .action(async (url, options) => {
    showBanner();

    console.log(chalk.blue('🚀 Initializing Kadedee Scanner...\n'));

    const db = new Database();
    const scanner = new VulnerabilityScanner(db, {
      depth: parseInt(options.depth),
      screenshots: options.screenshots,
      aiAnalysis: options.aiAnalysis,
      threads: parseInt(options.threads)
    });

    try {
      console.log(chalk.cyan(`🎯 Target: ${url}`));
      console.log(chalk.cyan(`📊 Depth: ${options.depth}`));
      console.log(chalk.cyan(`🧵 Threads: ${options.threads}`));
      console.log(chalk.cyan(`📸 Screenshots: ${options.screenshots ? 'Enabled' : 'Disabled'}`));
      console.log(chalk.cyan(`🤖 AI Analysis: ${options.aiAnalysis ? 'Enabled' : 'Disabled'}\n`));

      const results = await scanner.scan(url);

      console.log(chalk.green('\n✅ Scan Complete!\n'));

      const reportGen = new ReportGenerator(options.output);
      await reportGen.generateReports(results, url);

      console.log(chalk.green(`\n📁 Reports saved to: ${options.output}`));
      console.log(chalk.gray(`   - JSON: ${options.output}/report.json`));
      console.log(chalk.gray(`   - HTML: ${options.output}/report.html`));
      console.log(chalk.gray(`   - TXT: ${options.output}/report.txt`));

      if (results.vulnerabilities.length > 0) {
        console.log(chalk.red(`\n⚠️  Found ${results.vulnerabilities.length} vulnerabilities`));
      } else {
        console.log(chalk.green('\n✨ No vulnerabilities detected'));
      }

    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command('report')
  .description('View scan history and reports')
  .option('-l, --list', 'List all scans')
  .option('-i, --id <scanId>', 'View specific scan report')
  .action(async (options) => {
    showBanner();

    const db = new Database();

    if (options.list) {
      const scans = db.listScans();
      console.log(chalk.blue('📋 Scan History:\n'));
      scans.forEach(scan => {
        console.log(chalk.cyan(`ID: ${scan.id}`));
        console.log(chalk.gray(`   URL: ${scan.target_url}`));
        console.log(chalk.gray(`   Date: ${scan.scan_date}`));
        console.log(chalk.gray(`   Vulnerabilities: ${scan.vulnerability_count}\n`));
      });
    } else if (options.id) {
      const scan = db.getScanById(options.id);
      if (scan) {
        console.log(chalk.blue('📊 Scan Report:\n'));
        console.log(JSON.stringify(scan, null, 2));
      } else {
        console.log(chalk.red(`❌ Scan ID ${options.id} not found`));
      }
    }
  });

program
  .command('init')
  .description('Initialize Kadedee database and configuration')
  .action(() => {
    showBanner();
    console.log(chalk.blue('🔧 Initializing Kadedee...\n'));

    const db = new Database();
    console.log(chalk.green('✅ Database initialized'));
    console.log(chalk.green('✅ Configuration ready'));
    console.log(chalk.cyan('\n💡 Run "kadedee scan <url>" to start scanning\n'));
  });

if (process.argv.length === 2) {
  showBanner();
  program.help();
} else {
  program.parse();
}
