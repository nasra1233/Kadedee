import * as tf from '@tensorflow/tfjs-node';
import natural from 'natural';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

export class MLEngine {
  constructor(database) {
    this.db = database;
    this.modelPath = './kadedee-models';
    this.model = null;
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    this.trainingData = [];
  }

  async initialize() {
    try {
      if (existsSync(join(this.modelPath, 'model.json'))) {
        this.model = await tf.loadLayersModel(`file://${this.modelPath}/model.json`);
      } else {
        this.model = this.createModel();
      }
    } catch (error) {
      this.model = this.createModel();
    }
  }

  createModel() {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [100], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictConfidence(vulnerability) {
    if (!this.model) {
      await this.initialize();
    }

    const features = this.extractFeatures(vulnerability);

    if (features.length === 0) {
      return this.getRuleBasedConfidence(vulnerability);
    }

    try {
      const tensor = tf.tensor2d([features]);
      const prediction = await this.model.predict(tensor);
      const confidence = (await prediction.data())[0];

      tensor.dispose();
      prediction.dispose();

      return Math.round(confidence * 100) / 100;
    } catch (error) {
      return this.getRuleBasedConfidence(vulnerability);
    }
  }

  extractFeatures(vulnerability) {
    const features = new Array(100).fill(0);

    const severityMap = { CRITICAL: 1.0, HIGH: 0.75, MEDIUM: 0.5, LOW: 0.25, INFO: 0.1 };
    features[0] = severityMap[vulnerability.severity] || 0.5;

    const typeMap = {
      SQL_INJECTION: 1, XSS: 2, SSRF: 3, XXE: 4, SSTI: 5,
      COMMAND_INJECTION: 6, LFI: 7, OPEN_REDIRECT: 8, IDOR: 9,
      CSRF: 10, MISSING_SECURITY_HEADERS: 11, CORS_MISCONFIGURATION: 12,
      RACE_CONDITION: 13
    };
    features[1] = (typeMap[vulnerability.type] || 0) / 13;

    if (vulnerability.evidence) {
      features[2] = Math.min(vulnerability.evidence.length / 1000, 1);
    }

    if (vulnerability.payload) {
      features[3] = Math.min(vulnerability.payload.length / 100, 1);
    }

    const tokens = this.tokenizer.tokenize(vulnerability.description || '');
    const dangerousKeywords = ['execute', 'injection', 'bypass', 'exploit', 'unauthorized', 'disclosure'];
    features[4] = tokens.filter(t => dangerousKeywords.includes(t.toLowerCase())).length / dangerousKeywords.length;

    features[5] = vulnerability.screenshotPath ? 1 : 0;

    return features;
  }

  getRuleBasedConfidence(vulnerability) {
    let confidence = 0.5;

    switch (vulnerability.severity) {
      case 'CRITICAL': confidence += 0.3; break;
      case 'HIGH': confidence += 0.2; break;
      case 'MEDIUM': confidence += 0.1; break;
    }

    if (['SQL_INJECTION', 'COMMAND_INJECTION', 'XXE'].includes(vulnerability.type)) {
      confidence += 0.15;
    }

    if (vulnerability.evidence && vulnerability.evidence.length > 100) {
      confidence += 0.05;
    }

    return Math.min(confidence, 1.0);
  }

  async trainOnScanResults(results) {
    results.vulnerabilities.forEach(vuln => {
      const features = this.extractFeatures(vuln);
      const label = vuln.severity === 'CRITICAL' || vuln.severity === 'HIGH' ? 1 : 0;

      this.trainingData.push({ features, label });
    });

    if (this.trainingData.length >= 50) {
      await this.trainModel();
    }

    this.updatePatternDatabase(results);
  }

  async trainModel() {
    if (!this.model) {
      await this.initialize();
    }

    const xs = tf.tensor2d(this.trainingData.map(d => d.features));
    const ys = tf.tensor2d(this.trainingData.map(d => [d.label]));

    try {
      await this.model.fit(xs, ys, {
        epochs: 10,
        batchSize: 16,
        validationSplit: 0.2,
        verbose: 0
      });

      await this.model.save(`file://${this.modelPath}`);
    } catch (error) {
      console.error('Model training error:', error.message);
    } finally {
      xs.dispose();
      ys.dispose();
    }
  }

  updatePatternDatabase(results) {
    const patterns = {
      timestamp: new Date().toISOString(),
      vulnerabilityTypes: {},
      commonPayloads: [],
      successfulExploits: []
    };

    results.vulnerabilities.forEach(vuln => {
      if (!patterns.vulnerabilityTypes[vuln.type]) {
        patterns.vulnerabilityTypes[vuln.type] = 0;
      }
      patterns.vulnerabilityTypes[vuln.type]++;

      if (vuln.payload) {
        patterns.commonPayloads.push({
          type: vuln.type,
          payload: vuln.payload,
          success: true
        });
      }

      patterns.successfulExploits.push({
        type: vuln.type,
        url: vuln.url,
        parameter: vuln.parameter
      });
    });

    try {
      const patternsPath = join(this.modelPath, 'patterns.json');
      let existingPatterns = { history: [] };

      if (existsSync(patternsPath)) {
        existingPatterns = JSON.parse(readFileSync(patternsPath, 'utf-8'));
      }

      existingPatterns.history.push(patterns);

      if (existingPatterns.history.length > 100) {
        existingPatterns.history = existingPatterns.history.slice(-100);
      }

      writeFileSync(patternsPath, JSON.stringify(existingPatterns, null, 2));
    } catch (error) {
      console.error('Pattern database update error:', error.message);
    }
  }

  async getLearnedPatterns() {
    try {
      const patternsPath = join(this.modelPath, 'patterns.json');
      if (existsSync(patternsPath)) {
        return JSON.parse(readFileSync(patternsPath, 'utf-8'));
      }
    } catch (error) {}
    return { history: [] };
  }
}
