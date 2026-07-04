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

const replacements = {
  'bg-[#ffffff]': 'bg-[var(--canvas-light)]',
  'text-[#171717]': 'text-[var(--on-primary)]',
  'text-[#0b0b0b]': 'text-[var(--on-primary)]',
  'text-[#000000]': 'text-[var(--on-primary)]',
  'bg-white': 'bg-[var(--canvas-light)]',
  'bg-[#fafafa]': 'bg-[var(--canvas-soft)]',
  'bg-[#f5f5f5]': 'bg-[var(--canvas-paper)]',
  'bg-[#F8F7FF]': 'bg-[var(--canvas-soft)]',
  'text-gray-900': 'text-[var(--on-primary)]',
  'text-gray-800': 'text-[var(--on-primary)]',
  'text-gray-700': 'text-[var(--ink-soft)]',
  'text-gray-500': 'text-[var(--mute)]',
  'text-gray-400': 'text-[var(--ash)]',
  'border-gray-100': 'border-[var(--hairline-soft)]',
  'border-gray-200': 'border-[var(--hairline)]',
  'border-[#F0EEFF]': 'border-[var(--hairline-soft)]',
  'bg-gray-50': 'bg-[var(--canvas-paper)]',
  'bg-gray-100': 'bg-[var(--canvas-paper)]',
  'text-gray-600': 'text-[var(--slate-soft)]'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  if (file.includes('QRCode') || file.includes('QrCode') || file.includes('QRAttendance')) {
    // skip these files for bg replacements to avoid breaking qr codes
  } else {
    for (const [oldVal, newVal] of Object.entries(replacements)) {
      // Escape brackets for regex
      const regex = new RegExp(oldVal.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
      content = content.replace(regex, newVal);
    }
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    replaceCount++;
    console.log('Updated', file);
  }
});

console.log('Total files updated:', replaceCount);
