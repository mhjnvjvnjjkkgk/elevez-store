const fs = require('fs');
const path = require('path');
const http = require('http');

const backupPath = path.join(__dirname, '../data/backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const payload = JSON.stringify(backupData);

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/update-constants',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk.toString());
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Body:', body);
    console.log('Successfully triggered recompile of constants.ts via running admin server.');
  });
});

req.on('error', (e) => {
  console.error('Error triggering recompile:', e);
});

req.write(payload);
req.end();
