const fs = require('fs');

/**
 * Utility to analyze NestJS HTTP logs and calculate latency percentiles.
 * 
 * Usage:
 * 1. Capture logs to a file: npm run start:dev > access.log
 * 2. Run analysis: node scripts/analyze-logs.js access.log
 */

// Matches format: [HTTP] GET /api/v1/members 200 - 45ms
const logRegex = /\[HTTP\] (GET|POST|PUT|PATCH|DELETE|OPTIONS) (.+?) \d+ - (\d+)ms/;

function getPercentile(data, percentile) {
  if (data.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * data.length) - 1;
  return data[index];
}

function analyze(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`Error: File not found at ${filePath}`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const stats = {};

  lines.forEach(line => {
    const match = line.match(logRegex);
    if (match) {
      const [, method, url, durationStr] = match;
      const duration = parseInt(durationStr, 10);
      
      // Strip query params for cleaner grouping
      const cleanUrl = url.split('?')[0];
      const key = `${method} ${cleanUrl}`;
      
      if (!stats[key]) stats[key] = [];
      stats[key].push(duration);
    }
  });

  if (Object.keys(stats).length === 0) {
    console.warn('No HTTP logs found matching the expected pattern.');
    return;
  }

  const results = Object.keys(stats).map(key => {
    const durations = stats[key].sort((a, b) => a - b);
    return {
      Endpoint: key,
      Requests: durations.length,
      'p50 (ms)': getPercentile(durations, 50),
      'p95 (ms)': getPercentile(durations, 95),
      'p99 (ms)': getPercentile(durations, 99),
      'Max (ms)': durations[durations.length - 1]
    };
  });

  // Sort by p95 descending to identify the slowest endpoints
  results.sort((a, b) => b['p95 (ms)'] - a['p95 (ms)']);

  console.log('\n--- API Latency Analysis ---\n');
  console.table(results);
}

const logFile = process.argv[2];
if (!logFile) {
  console.log('Usage: node scripts/analyze-logs.js <path-to-log-file>');
} else {
  analyze(logFile);
}
