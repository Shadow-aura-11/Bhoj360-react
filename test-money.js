const http = require('http');

function test(options, label) {
  console.log(`Testing: ${label}`);
  const req = http.request(options, (res) => {
    console.log(`STATUS:`, res.statusCode);
    console.log(`HEADERS:`, JSON.stringify(res.headers));
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`BODY (truncated):`, data.substring(0, 500));
      console.log('--------------------------------------------\n');
    });
  });

  req.on('error', (err) => {
    console.error(`ERROR:`, err.message);
    console.log('--------------------------------------------\n');
  });

  req.end();
}

// Test directly on restaurant port 3101
test({
  hostname: 'localhost',
  port: 3101,
  path: '/analytics/money',
  method: 'GET',
  headers: {
    'x-role': 'admin',
    'x-pin': '1111'
  }
}, 'Direct port 3101 /analytics/money');

// Test through Gateway proxy port 4000
test({
  hostname: 'localhost',
  port: 4000,
  path: '/r/REST-WWQ2RC/analytics/money',
  method: 'GET',
  headers: {
    'x-role': 'admin',
    'x-pin': '1111'
  }
}, 'Gateway port 4000 /r/REST-WWQ2RC/analytics/money');
