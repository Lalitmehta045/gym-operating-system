const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let replaceCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('bg-white')) {
    if (file.includes('QRCode') || file.includes('QrCode') || file.includes('QRAttendance')) {
      // Don't modify QR code files as they need white background
      return;
    }
    
    // Replace all occurrences of bg-white with bg-[var(--canvas-light)]
    const newContent = content.replace(/\bbg-white\b/g, 'bg-[var(--canvas-light)]');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      replaceCount++;
      console.log('Updated', file);
    }
  }
});

console.log('Total files updated:', replaceCount);
