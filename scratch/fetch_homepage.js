const https = require('https');

https.get('https://www.elevez.shop/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const scripts = data.match(/<script[^>]*src="[^"]*"[^>]*>/g);
    console.log('Live Scripts:', scripts);
  });
}).on('error', (err) => {
  console.error('Error:', err);
});
