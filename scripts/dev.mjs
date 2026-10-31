import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ensurePostgresRunning, stopPostgres } from './start-db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

function pipeOutput(stream, prefix, colorCode) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m${prefix}\x1b[0m ${line}`);
      }
    }
  });
}

function getDatabasePort() {
  const envPath = path.join(serverDir, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?[^"'\n]+:(\d+)\//);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
  }
  return 5433;
}

async function main() {
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  🚀 Subscriptly SaaS Platform — Development Orchestrator\x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m\n');

  const processes = [];

  // 1. Check / Start PostgreSQL
  const dbPort = getDatabasePort();
  const pgProc = await ensurePostgresRunning(dbPort);
  if (pgProc) {
    processes.push(pgProc);
  }

  // 2. Start Backend Server
  console.log('\x1b[34m[server]\x1b[0m Starting Subscriptly Express API on port 5000...');
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
  pipeOutput(serverProc.stdout, '[server]', '34');
  pipeOutput(serverProc.stderr, '[server error]', '31');

  // 3. Start Frontend Client (Next.js Modern UI)
  console.log('\x1b[36m[ui]\x1b[0m Starting Subscriptly Neo-Brutalist Next.js UI on port 3000...');
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
  pipeOutput(clientProc.stdout, '[ui]', '36');
  pipeOutput(clientProc.stderr, '[ui log]', '33');

  // 4. Graceful teardown
  const shutdown = () => {
    console.log('\n\x1b[33mStopping Subscriptly development servers...\x1b[0m');
    for (const proc of processes) {
      try {
        proc.kill();
      } catch { }
    }
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to launch dev environment:', err);
  process.exit(1);
});
