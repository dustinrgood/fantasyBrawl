@echo off
echo Creating SSL certificates for local development...

mkdir -p certificates
cd certificates

echo Generating private key...
openssl genrsa -out localhost.key 2048

echo Generating certificate signing request...
openssl req -new -key localhost.key -out localhost.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

echo Generating self-signed certificate...
openssl x509 -req -days 365 -in localhost.csr -signkey localhost.key -out localhost.crt

echo Cleaning up...
del localhost.csr

echo SSL certificates created successfully!
echo Certificates saved to: %CD%

cd ..
echo.
echo You may need to add the certificate to your system trust store.
echo For development purposes, you can also just accept the security warning in your browser. 