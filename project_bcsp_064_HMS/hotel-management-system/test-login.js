const http = require('http');

async function test() {
  const data = JSON.stringify({ email: 'admin@hotel.com', password: 'unknown' });
  const req = http.request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    console.log('StatusCode:', res.statusCode);
    console.log('Headers:', res.headers);
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => console.log('Body:', body));
  });
  req.write(data);
  req.end();
}
test();
