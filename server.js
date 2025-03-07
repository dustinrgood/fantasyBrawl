// server.js
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

// Disable SSL certificate validation in development
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Determine if we're in development mode
const dev = process.env.NODE_ENV !== 'production';
const PORT = 3001;

// Create Next.js app
const app = next({ 
  dev,
  dir: process.cwd(),
  hostname: 'localhost',
  port: PORT,
});

const handle = app.getRequestHandler();

// SSL certificate paths
// For Windows: Use absolute paths or relative paths from the project root
// For macOS/Linux: Use absolute paths or relative paths from the project root
const sslOptions = {
  key: fs.readFileSync(path.join(__dirname, './certificates/localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, './certificates/localhost.crt')),
};

// To generate self-signed certificates:
// For Windows: Use OpenSSL or mkcert
// For macOS: brew install mkcert && mkcert -install && mkcert localhost
// For Linux: Use OpenSSL or mkcert

app.prepare().then(() => {
  createServer(sslOptions, async (req, res) => {
    try {
      // Parse the URL
      const parsedUrl = parse(req.url, true);
      
      // Add CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      
      // Enhanced CSS handling
      if (parsedUrl.pathname.endsWith('.css')) {
        console.log('CSS file requested:', parsedUrl.pathname);
        res.setHeader('Content-Type', 'text/css');
      }
      
      // Handle specific TailwindCSS file paths with more detailed logging
      if (
        parsedUrl.pathname.includes('/_next/static/css/') ||
        parsedUrl.pathname.includes('/_next/static/chunks/')
      ) {
        console.log('Next.js CSS/chunk file requested:', parsedUrl.pathname);
        res.setHeader('Content-Type', 'text/css');
      }
      
      // Log requests for debugging
      console.log(`${req.method} ${parsedUrl.pathname}`);

      // Handle all requests with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://localhost:${PORT}`);
    console.log('> Tailwind CSS should be loaded from /_next/static/css/ directory');
  });
});