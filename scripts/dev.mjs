import { spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensurePostgresRunning } from './start-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');

function getDatabasePort() {
  const envPath = path.join(rootDir, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?[^"'\n]+:(\d+)\//);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  return 5433;
}

// Filter out noisy development compiler / watcher logs
function attachQuietOutput(proc, label) {
  proc.stderr.on('data', (chunk) => {
    const msg = chunk.toString();
    // Only print actual unexpected fatal errors, not compilation/watch/lockfile noise
    if (
      msg.includes('Error: Cannot find module') ||
      msg.includes('FATAL') ||
      msg.includes('UnhandledPromiseRejection') ||
      msg.includes('EADDRINUSE')
    ) {
      console.error(`\x1b[31m[${label} error]\x1b[0m ${msg.trim()}`);
    }
  });
}

async function main() {
  const processes = [];

  // 1. Ensure PostgreSQL is running
  const dbPort = getDatabasePort();
  const pgProc = await ensurePostgresRunning(dbPort);
  if (pgProc) {
    processes.push(pgProc);
  }

  // 2. Start Backend API Server quietly
  const tsxCli = fs.existsSync(path.join(serverDir, 'node_modules', 'tsx', 'dist', 'cli.mjs'))
    ? path.join(serverDir, 'node_modules', 'tsx', 'dist', 'cli.mjs')
    : path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const serverProc = spawn(
    process.execPath,
    [tsxCli, 'watch', 'src/index.ts'],
    {
      cwd: serverDir,
      env: {
        ...process.env,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        NODE_DISABLE_COMPILE_CACHE: '1',
      },
    }
  );
  processes.push(serverProc);
  attachQuietOutput(serverProc, 'server');

  // 3. Start Frontend UI quietly
  const nextCli = path.join(rootDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  const clientProc = spawn(
    process.execPath,
    [nextCli, 'dev', '-p', '3000'],
    {
      cwd: rootDir,
      env: {
        ...process.env,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
      },
    }
  );
  processes.push(clientProc);
  attachQuietOutput(clientProc, 'ui');

  // 4. Clean, static localhost summary banner (no live commentary spam)
  console.log('\n\x1b[1m\x1b[35m========================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  🚀 Subscriptly SaaS Platform — Development Ready\x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m\n');
  console.log('  \x1b[32m➜\x1b[0m  \x1b[1mUI Application:\x1b[0m   \x1b[36mhttp://localhost:3000\x1b[0m');
  console.log('  \x1b[32m➜\x1b[0m  \x1b[1mAPI Server:\x1b[0m       \x1b[34mhttp://localhost:5000\x1b[0m');
  console.log('  \x1b[32m➜\x1b[0m  \x1b[1mHealth Check:\x1b[0m     \x1b[34mhttp://localhost:5000/api/health\x1b[0m');
  console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mDatabase:\x1b[0m         \x1b[33m127.0.0.1:${dbPort}\x1b[0m\n`);
  console.log('  \x1b[90mReady for development. Press Ctrl+C to stop.\x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m\n');

  // 5. Clean teardown without Windows "Terminate batch job (Y/N)?" prompt
  let isShuttingDown = false;
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    process.stdout.write('\n\x1b[33mStopping Subscriptly development servers...\x1b[0m\n');
    for (const proc of processes) {
      if (proc && proc.pid) {
        try {
          if (process.platform === 'win32') {
            execSync(`taskkill /pid ${proc.pid} /t /f`, { stdio: 'ignore' });
          } else {
            proc.kill('SIGKILL');
          }
        } catch {}
      }
    }
    process.stdout.write('\x1b[32mDone.\x1b[0m\n');
    process.exit(0);
  };

  // Intercept Ctrl+C in raw mode so cmd.exe never asks "Terminate batch job (Y/N)?"
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (key) => {
        // Ctrl+C is \u0003, Ctrl+D is \u0004
        if (key === '\u0003' || key === '\u0004') {
          shutdown();
        }
      });
    } catch {}
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to launch dev environment:', err);
  process.exit(1);
});
