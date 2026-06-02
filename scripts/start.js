const { spawn } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');

const services = [
  {
    name: 'agency-core',
    command: 'node',
    args: ['agency-core/index.js'],
    env: {},
  },
  {
    name: 'gateway',
    command: 'node',
    args: ['gateway/index.js'],
    env: { NODE_ENV: 'production' },
  },
];

const children = services.map((service) => {
  const child = spawn(service.command, service.args, {
    cwd: root,
    env: { ...process.env, ...service.env },
    stdio: 'inherit',
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      console.log(`[${service.name}] stopped by ${signal}`);
    } else if (code !== 0) {
      console.log(`[${service.name}] exited with code ${code}`);
    }
  });

  return child;
});

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
