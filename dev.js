import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const backendUrl = 'http://127.0.0.1:3000';
const children = new Set();
let shuttingDown = false;

function stopChildren(signal = 'SIGTERM') {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  }
}

function startChild(name, args, env) {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    env,
    stdio: 'inherit',
  });
  children.add(child);

  child.once('error', (error) => {
    console.error(`[dev] Could not start ${name}: ${error.message}`);
    process.exitCode = 1;
    stopChildren();
  });

  child.once('exit', (code, signal) => {
    children.delete(child);
    if (shuttingDown) return;

    console.error(
      `[dev] ${name} exited unexpectedly${signal ? ` after ${signal}` : ` with code ${code}`}.`,
    );
    process.exitCode = code && code !== 0 ? code : 1;
    stopChildren();
  });

  return child;
}

process.on('SIGINT', () => stopChildren('SIGINT'));
process.on('SIGTERM', () => stopChildren('SIGTERM'));

startChild('Express API', ['server.js'], {
  ...process.env,
  PORT: '3000',
});

startChild('Vite preview', ['node_modules/vite/bin/vite.js'], {
  ...process.env,
  PORT: process.env.PORT || '5000',
  API_ORIGIN: backendUrl,
});