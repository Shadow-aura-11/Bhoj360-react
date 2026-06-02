const http = require('http');

function test(url) {
  console.log(`Testing: ${url}`);
  http.get(url, (res) => {
    console.log(`STATUS for ${url}:`, res.statusCode);
    console.log(`HEADERS for ${url}:`, JSON.stringify(res.headers));
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`BODY for ${url} (truncated):`, data.substring(0, 500));
      console.log('--------------------------------------------\n');
    });
  }).on('error', (err) => {
    console.error(`ERROR for ${url}:`, err.message);
    console.log('--------------------------------------------\n');
  });
}

test('http://localhost:3000/health');
test('http://localhost:3000/api/applications');
test('http://localhost:4000/api/applications');
