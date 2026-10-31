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
  const is5433Open = await isPortOpen(5433);
  const is5432Open = await isPortOpen(5432);

  if (is5433Open || is5432Open) {
    const activePort = is5433Open ? 5433 : 5432;
    console.log(`\x1b[32m[db]\x1b[0m PostgreSQL is listening on port ${activePort}`);
  } else {
    // Attempt to start local postgres cluster if present on Windows
    const localAppData = process.env.LOCALAPPDATA || '';
    const pgDataDir = path.join(localAppData, 'subscriptly_db');
    const pgExe = 'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe';

    if (fs.existsSync(pgDataDir) && fs.existsSync(pgExe)) {
      console.log('\x1b[32m[db]\x1b[0m Starting local PostgreSQL service on port 5433...');
      const pgProc = spawn(pgExe, ['-D', pgDataDir, '-p', '5433'], {
        stdio: 'ignore',
        detached: false,
      });
      processes.push(pgProc);

      // Wait a moment for startup
      let ready = false;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (await isPortOpen(5433)) {
          ready = true;
          break;
        }
      }
      if (ready) {
        console.log('\x1b[32m[db]\x1b[0m Local PostgreSQL ready on port 5433.');
      } else {
        console.warn('\x1b[33m[db]\x1b[0m PostgreSQL starting in background.');
      }
    } else {
      console.log('\x1b[33m[db]\x1b[0m External PostgreSQL expected on configured DATABASE_URL.');
    }
  }

  // 2. Start Backend Server
  console.log('\x1b[34m[server]\x1b[0m Starting Subscriptly Express API on port 5000...');
  const tsxCli = path.join(serverDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
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

  // 3. Start Frontend Client (Vite)
  console.log('\x1b[36m[client]\x1b[0m Starting Subscriptly Vite SPA on port 5173...');
  const viteCli = path.join(clientDir, 'node_modules', 'vite', 'bin', 'vite.js');
  const clientProc = spawn(
    process.execPath,
    [viteCli],
    {
      cwd: clientDir,
      env: {
        ...process.env,
        NODE_OPTIONS: '--dns-result-order=ipv4first',
        NODE_DISABLE_COMPILE_CACHE: '1',
      },
    }
  );
  processes.push(clientProc);
  pipeOutput(clientProc.stdout, '[client]', '36');
  pipeOutput(clientProc.stderr, '[client error]', '31');

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
