import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

export class Crawler {
  constructor(options = {}) {
    this.maxDepth = options.depth || 3;
    this.visited = new Set();
    this.endpoints = [];
    this.baseUrl = null;
  }

  async crawl(startUrl) {
    this.baseUrl = new URL(startUrl).origin;
    await this.crawlRecursive(startUrl, 0);
    return this.endpoints;
  }

  async crawlRecursive(url, depth) {
    if (depth > this.maxDepth || this.visited.has(url)) {
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (!url.startsWith(this.baseUrl)) {
        return;
      }

      this.visited.add(url);

      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'Kadedee-Scanner/1.0'
        }
      });

      const endpoint = {
        url: url,
        method: 'GET',
        statusCode: response.status,
        contentType: response.headers['content-type'],
        parameters: this.extractParameters(parsedUrl),
        forms: []
      };

      if (response.headers['content-type']?.includes('text/html')) {
        const $ = cheerio.load(response.data);

        const forms = this.extractForms($, url);
        endpoint.forms = forms;

        const links = this.extractLinks($, url);

        for (const link of links.slice(0, 20)) {
          await this.crawlRecursive(link, depth + 1);
        }
      }

      this.endpoints.push(endpoint);

      const apiEndpoints = this.discoverAPIEndpoints($, url);
      for (const apiUrl of apiEndpoints) {
        if (!this.visited.has(apiUrl)) {
          this.endpoints.push({
            url: apiUrl,
            method: 'GET',
            statusCode: null,
            contentType: 'application/json',
            parameters: this.extractParameters(new URL(apiUrl)),
            forms: []
          });
          this.visited.add(apiUrl);
        }
      }

    } catch (error) {
      // Error crawling, skip
    }
  }

  extractParameters(url) {
    const params = [];
    url.searchParams.forEach((value, key) => {
      params.push(key);
    });
    return params;
  }

  extractLinks($, baseUrl) {
    const links = [];
    $('a[href]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        try {
          const absoluteUrl = new URL(href, baseUrl).toString();
          if (absoluteUrl.startsWith(this.baseUrl)) {
            links.push(absoluteUrl);
          }
        } catch (e) {}
      }
    });
    return [...new Set(links)];
  }

  extractForms($, baseUrl) {
    const forms = [];
    $('form').each((i, elem) => {
      const form = {
        action: $(elem).attr('action') || baseUrl,
        method: ($(elem).attr('method') || 'GET').toUpperCase(),
        inputs: []
      };

      $(elem).find('input, textarea, select').each((j, input) => {
        const name = $(input).attr('name');
        const type = $(input).attr('type') || 'text';
        if (name) {
          form.inputs.push({ name, type });
        }
      });

      forms.push(form);
    });
    return forms;
  }

  discoverAPIEndpoints($, baseUrl) {
    const apiEndpoints = [];
    const scripts = [];

    $('script').each((i, elem) => {
      const src = $(elem).attr('src');
      const content = $(elem).html();

      if (src) scripts.push(src);
      if (content) scripts.push(content);
    });

    const apiPatterns = [
      /['"]([^'"]*\/api\/[^'"]*)['"]/g,
      /fetch\(['"]([^'"]+)['"]/g,
      /axios\.[a-z]+\(['"]([^'"]+)['"]/g,
      /\$\.ajax\({[^}]*url:\s*['"]([^'"]+)['"]/g
    ];

    for (const script of scripts) {
      for (const pattern of apiPatterns) {
        let match;
        while ((match = pattern.exec(script)) !== null) {
          try {
            const url = new URL(match[1], baseUrl).toString();
            if (url.startsWith(this.baseUrl)) {
              apiEndpoints.push(url);
            }
          } catch (e) {}
        }
      }
    }

    return [...new Set(apiEndpoints)];
  }
}
