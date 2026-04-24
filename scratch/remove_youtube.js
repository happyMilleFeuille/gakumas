const fs = require('fs');
const content = fs.readFileSync('producedata.js', 'utf8');

const lines = content.split('\n');
const result = lines.map(line => {
    // Check if this line has _2nd or fes in the id field, AND has a youtube_url
    if ((line.includes('_2nd') || line.includes('fes')) && line.includes('youtube_url')) {
        return line.replace(/,\s*youtube_url:\s*"[^"]*"/, '');
    }
    return line;
});

fs.writeFileSync('producedata.js', result.join('\n'), 'utf8');
console.log('Done');
