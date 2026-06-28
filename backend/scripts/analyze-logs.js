/**
 * API Latency Analyzer — p50 / p95 / p99 & slowest endpoints.
 *
 * Usage:
 *   1. Capture live logs:
 *      node scripts/analyze-logs.js               (reads from stdin)
 *      echo "your logs" | node scripts/analyze-logs.js
 *
 *   2. Analyze a log file:
 *      node scripts/analyze-logs.js path/to/access.log
 *
 * Log format expected (from LoggingInterceptor):
 *   [HTTP] LOG     GET /api/v1/members 200 12ms
 *   [HTTP] WARN    SLOW POST /api/v1/payments 200 1240ms
 *   [HTTP] ERROR   POST /api/v1/attendance 500 302ms
 */

const fs = require('fs');

// ── Parsers ────────────────────────────────────────────────────────────────

// "[HTTP] LOG     GET /api/v1/members 200 12ms"
// "[HTTP] WARN    SLOW GET /api/v1/members 200 12ms"
// "[HTTP] ERROR   POST /api/v1/attendance 500 302ms"
const lineRegex =
  /\[HTTP\]\s+(?:LOG|WARN|ERROR)\s+(?:SLOW\s+)?(GET|POST|PUT|PATCH|DELETE)\s+(\S+)\s+(\d{3})\s+(\d+)ms/;

function parseLine(line) {
  const m = line.match(lineRegex);
  if (!m) return null;
  return {
    method: m[1],
    path: m[2],
    status: parseInt(m[3], 10),
    duration: parseInt(m[4], 10),
  };
}

// ── Statistics ─────────────────────────────────────────────────────────────

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function analyze(records) {
  // Group by endpoint key (method + path)
  const groups = {};
  for (const r of records) {
    const key = `${r.method} ${r.path}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(r.duration);
  }

  const results = Object.entries(groups).map(([endpoint, durations]) => {
    durations.sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    return {
      Endpoint: endpoint,
      'Requests': durations.length,
      'p50 (ms)': percentile(durations, 50),
      'p95 (ms)': percentile(durations, 95),
      'p99 (ms)': percentile(durations, 99),
      'Max (ms)': durations[durations.length - 1],
      'Avg (ms)': Math.round(sum / durations.length),
    };
  });

  return results;
}

// ── I/O ────────────────────────────────────────────────────────────────────

function run(data) {
  const lines = data.split('\n');
  const records = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed) records.push(parsed);
  }

  if (records.length === 0) {
    console.error('No matching HTTP log lines found. Check that logs contain the expected pattern.');
    process.exit(1);
  }

  const results = analyze(records);

  // Sort by p95 descending — worst endpoints first
  results.sort((a, b) => b['p95 (ms)'] - a['p95 (ms)']);

  // ── Slow-request summary ──
  const slowCount = records.filter((r) => r.duration >= 500).length;
  const statusCounts = {};
  for (const r of records) {
    const bucket = `${r.status}`[0] + 'xx';
    statusCounts[bucket] = (statusCounts[bucket] || 0) + 1;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('           API Latency Analysis Report');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Total requests:   ${records.length}`);
  console.log(`Unique endpoints: ${results.length}`);
  console.log(`Slow (≥500 ms):   ${slowCount} (${((slowCount / records.length) * 100).toFixed(1)}%)`);
  console.log(`Status breakdown: ${Object.entries(statusCounts).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
  console.log('');

  // ── Table ──
  const COL_SEP = '  ';
  const headers = ['Endpoint', 'Requests', 'p50 (ms)', 'p95 (ms)', 'p99 (ms)', 'Max (ms)', 'Avg (ms)'];

  // Calculate column widths
  const colWidths = headers.map((h, i) => {
    const maxData = Math.max(
      h.length,
      ...results.map((r) => {
        const vals = [r.Endpoint, String(r.Requests), String(r['p50 (ms)']),
                      String(r['p95 (ms)']), String(r['p99 (ms)']),
                      String(r['Max (ms)']), String(r['Avg (ms)'])];
        return vals[i].length;
      }),
    );
    return maxData;
  });

  const hLine = '─' + colWidths.map((w) => '─'.repeat(w + 2)).join('┬') + '─';

  function formatRow(vals) {
    return ' ' + vals.map((v, i) => String(v).padEnd(colWidths[i])).join(COL_SEP);
  }

  console.log(formatRow(headers));
  console.log(hLine);
  for (const r of results) {
    const vals = [r.Endpoint, r.Requests, r['p50 (ms)'], r['p95 (ms)'],
                  r['p99 (ms)'], r['Max (ms)'], r['Avg (ms)']];
    console.log(formatRow(vals));
  }
  console.log('');
}

// ── Entry point ────────────────────────────────────────────────────────────

const filePath = process.argv[2];

if (filePath) {
  // Read from file
  if (!fs.existsSync(filePath)) {
    console.error(`Error: file not found — ${filePath}`);
    process.exit(1);
  }
  run(fs.readFileSync(filePath, 'utf8'));
} else {
  // Read from stdin
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => (data += chunk));
  process.stdin.on('end', () => run(data));
}
