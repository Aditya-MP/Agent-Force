const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

console.log('🚀 Starting Agent Forces (Backend + Frontend)...\n');

// Start Backend
console.log('📦 Starting Backend on port 3001...');
const backend = spawn(isWindows ? 'npm.cmd' : 'npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait 3 seconds then start Frontend
setTimeout(() => {
  console.log('\n🎨 Starting Frontend on port 5173...');
  const frontend = spawn(isWindows ? 'npm.cmd' : 'npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  frontend.on('error', (err) => {
    console.error('❌ Frontend error:', err);
  });
}, 3000);

backend.on('error', (err) => {
  console.error('❌ Backend error:', err);
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  backend.kill();
  process.exit(0);
});
