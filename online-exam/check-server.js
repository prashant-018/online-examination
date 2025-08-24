import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is running! Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📊 Server Info:', response);
    } catch (e) {
      console.log('📄 Raw response:', data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Server is not running or not accessible');
  console.log('Error:', err.message);
  console.log('\n💡 To start the server:');
  console.log('1. Double-click start-server.bat');
  console.log('2. Or run: cd server && npm run dev');
});

req.on('timeout', () => {
  console.log('⏰ Request timed out - server might be starting up');
  req.destroy();
});

req.end();
