const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');
const forge = require('node-forge');

function createSelfSignedCertificate() {
  console.log('Creating SSL certificates for local development...');
  
  // Create certificates directory if it doesn't exist
  const certDir = path.join(__dirname, 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }
  
  try {
    // Generate a key pair
    console.log('Generating key pair...');
    const keys = forge.pki.rsa.generateKeyPair(2048);
    
    // Create a certificate
    console.log('Creating certificate...');
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    
    // Set certificate attributes
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [
      { name: 'commonName', value: 'localhost' },
      { name: 'countryName', value: 'US' },
      { name: 'stateOrProvinceName', value: 'State' },
      { name: 'localityName', value: 'Locality' },
      { name: 'organizationName', value: 'Development' },
      { name: 'organizationalUnitName', value: 'Development Unit' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    
    // Set extensions
    cert.setExtensions([
      {
        name: 'basicConstraints',
        cA: true
      },
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2, // DNS
            value: 'localhost'
          },
          {
            type: 7, // IP
            ip: '127.0.0.1'
          }
        ]
      }
    ]);
    
    // Self-sign the certificate
    cert.sign(keys.privateKey, forge.md.sha256.create());
    
    // Convert to PEM format
    const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
    const certPem = forge.pki.certificateToPem(cert);
    
    // Write files
    fs.writeFileSync(path.join(certDir, 'localhost.key'), privateKeyPem);
    fs.writeFileSync(path.join(certDir, 'localhost.crt'), certPem);
    
    console.log('SSL certificates created successfully!');
    console.log(`Certificates saved to: ${certDir}`);
    console.log('\nYou may need to add the certificate to your system trust store.');
    console.log('For development purposes, you can also just accept the security warning in your browser.');
  } catch (error) {
    console.error('Error creating certificates:', error);
    process.exit(1);
  }
}

// First, install node-forge if not already installed
try {
  require.resolve('node-forge');
  console.log('node-forge is already installed.');
} catch (e) {
  console.log('Installing node-forge...');
  try {
    execSync('npm install node-forge', { stdio: 'inherit' });
    console.log('node-forge installed successfully.');
  } catch (error) {
    console.error('Failed to install node-forge:', error);
    process.exit(1);
  }
}

createSelfSignedCertificate(); 