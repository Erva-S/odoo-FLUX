import { spawn } from 'child_process';
import path from 'path';
import net from 'net';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const serverDir = path.join(rootDir, 'server');
const clientDir = path.join(rootDir, 'client');

function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

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

async function main() {
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m');
  console.log('\x1b[1m\x1b[35m  🚀 Subscriptly SaaS Platform — Development Orchestrator\x1b[0m');
  console.log('\x1b[1m\x1b[35m========================================================\x1b[0m\n');

  const processes = [];

  // 1. Check / Start PostgreSQL dedicated cluster on port 5433
  const is5433Open = await isPortOpen(5433);

  if (is5433Open) {
    console.log(`\x1b[32m[db]\x1b[0m PostgreSQL is listening on port 5433`);
  } else {
    // Attempt to start local postgres cluster on port 5433
    const localAppData = process.env.LOCALAPPDATA || '';
    const pgDataDir = path.join(localAppData, 'subscriptly_db');
    const pgExe = 'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe';

    if (fs.existsSync(pgDataDir) && fs.existsSync(pgExe)) {
      // Check for stale postmaster.pid
      const pidFile = path.join(pgDataDir, 'postmaster.pid');
      if (fs.existsSync(pidFile)) {
        try {
          const pidText = fs.readFileSync(pidFile, 'utf8').split('\n')[0].trim();
          const pid = parseInt(pidText, 10);
          let alive = false;
          try {
            process.kill(pid, 0);
            alive = true;
          } catch {
            alive = false;
          }
          if (!alive) {
            fs.unlinkSync(pidFile);
          }
        } catch {}
      }

      console.log('\x1b[32m[db]\x1b[0m Starting local Subscriptly PostgreSQL service on port 5433...');
      const pgProc = spawn(pgExe, ['-D', pgDataDir, '-p', '5433', '-h', '127.0.0.1,localhost'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });
      processes.push(pgProc);
      pipeOutput(pgProc.stderr, '[db log]', '33');

      // Wait a moment for startup
      let ready = false;
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 400));
        if (await isPortOpen(5433)) {
          ready = true;
          break;
        }
      }
      if (ready) {
        console.log('\x1b[32m[db]\x1b[0m Local PostgreSQL ready on port 5433.');
      } else {
        console.warn('\x1b[33m[db]\x1b[0m PostgreSQL starting in background on port 5433.');
      }
    } else {
      console.log('\x1b[33m[db]\x1b[0m External PostgreSQL expected on configured DATABASE_URL.');
    }
  }

  // 2. Start Backend Server
  console.log('\x1b[34m[server]\x1b[0m Starting Subscriptly Express API...');
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
  console.log('\x1b[36m[client]\x1b[0m Starting Subscriptly Vite SPA...');
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

  // 4. Clean shutdown handler
  const shutdown = () => {
    console.log('\n\x1b[33mStopping all Subscriptly dev processes...\x1b[0m');
    for (const proc of processes) {
      try {
        proc.kill();
      } catch {}
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

