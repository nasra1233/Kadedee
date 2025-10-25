import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { join } from 'path';

export class ScreenshotCapture {
  constructor() {
    this.browser = null;
    this.screenshotDir = './kadedee-reports/screenshots';
  }

  async initialize() {
    await mkdir(this.screenshotDir, { recursive: true });

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
  }

  async capture(url, filename) {
    if (!this.browser) {
      await this.initialize();
    }

    try {
      const page = await this.browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1
      });

      await page.setUserAgent('Kadedee-Scanner/1.0');

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      await page.waitForTimeout(1000);

      const screenshotPath = join(this.screenshotDir, `${filename}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      await page.close();

      return screenshotPath;

    } catch (error) {
      console.error(`Screenshot failed for ${url}:`, error.message);
      return null;
    }
  }

  async captureWithPayload(url, payload, filename) {
    if (!this.browser) {
      await this.initialize();
    }

    try {
      const page = await this.browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080
      });

      page.on('dialog', async dialog => {
        await dialog.dismiss();
      });

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      await page.waitForTimeout(2000);

      const screenshotPath = join(this.screenshotDir, `${filename}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      await page.close();

      return screenshotPath;

    } catch (error) {
      console.error(`Screenshot with payload failed:`, error.message);
      return null;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
