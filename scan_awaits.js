const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.ts') && !file.endsWith('.spec.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'backend', 'src'));

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('await ')) {
            // Count awaits in the next 10 lines
            let awaitCount = 0;
            let snippet = [];
            for (let j = i; j < Math.min(i + 15, lines.length); j++) {
                snippet.push(lines[j]);
                if (lines[j].includes('await ') && !lines[j].includes('expect(')) {
                    awaitCount++;
                }
            }
            if (awaitCount >= 3) {
                console.log(`\n\n=== File: ${file} (Line ${i + 1}) - ${awaitCount} awaits ===`);
                console.log(snippet.join('\n'));
                i += 15; // Skip ahead to avoid overlapping windows
            }
        }
    }
});
