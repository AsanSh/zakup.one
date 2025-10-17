const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build Tailwind CSS
try {
  console.log('Building Tailwind CSS...');
  execSync('npx tailwindcss -i ./src/input.css -o ./dist/output.css --watch', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
} catch (error) {
  console.error('Error building Tailwind CSS:', error.message);
  process.exit(1);
}
