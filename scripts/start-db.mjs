import { spawn, execSync } from 'child_process';
import path from 'path';
import net from 'net';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function isPortOpen(port, host = '127.0.0.1') {
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
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

export async function stopPostgres(targetPort = 5433) {
  const localAppData = process.env.LOCALAPPDATA || '';
  const pgDataDir = path.join(localAppData, 'subscriptly_db');
  const pgCtl = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe';

  if (fs.existsSync(pgDataDir) && fs.existsSync(pgCtl)) {
    try {
      execSync(`"${pgCtl}" stop -D "${pgDataDir}" -m fast`, { stdio: 'ignore', timeout: 5000 });
      console.log(`\x1b[33m[db]\x1b[0m PostgreSQL cleanly stopped on port ${targetPort}.`);
    } catch {}
  }
}

export async function ensurePostgresRunning(targetPort = 5433) {
  const isOpen = await isPortOpen(targetPort, '127.0.0.1');
  if (isOpen) {
    console.log(`\x1b[32m[db]\x1b[0m PostgreSQL is active and accepting connections on port ${targetPort}`);
    return null;
  }

  const localAppData = process.env.LOCALAPPDATA || '';
  const pgDataDir = path.join(localAppData, 'subscriptly_db');
  const pgExe = 'C:\\Program Files\\PostgreSQL\\18\\bin\\postgres.exe';
  const pgCtl = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe';

  if (!fs.existsSync(pgDataDir)) {
    console.log(`\x1b[33m[db]\x1b[0m PostgreSQL data directory not found at ${pgDataDir}. Expecting external service on port ${targetPort}.`);
    return null;
  }

  // Clear stale postmaster.pid if postgres crashed earlier
  const pidFile = path.join(pgDataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      const pidContent = fs.readFileSync(pidFile, 'utf8').trim().split('\n')[0];
      const pid = parseInt(pidContent, 10);
      try {
        process.kill(pid, 0); // Check if alive
      } catch {
        fs.unlinkSync(pidFile);
      }
    } catch {}
  }

  console.log(`\x1b[32m[db]\x1b[0m Starting Subscriptly PostgreSQL daemon on port ${targetPort}...`);
  
  let pgProc = null;
  if (fs.existsSync(pgCtl)) {
    try {
      execSync(`"${pgCtl}" start -D "${pgDataDir}" -o "-p ${targetPort} -h *" -w -t 20`, {
        stdio: 'ignore',
        timeout: 25000,
      });
    } catch {
      // Fallback: spawn directly as background process
      pgProc = spawn(pgExe, ['-D', pgDataDir, '-p', String(targetPort), '-h', '*'], {
        stdio: 'ignore',
        detached: true,
      });
      pgProc.unref();
    }
  } else if (fs.existsSync(pgExe)) {
    pgProc = spawn(pgExe, ['-D', pgDataDir, '-p', String(targetPort), '-h', '*'], {
      stdio: 'ignore',
      detached: true,
    });
    pgProc.unref();
  }

  // Wait for postgres to accept connections
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 400));
    if (await isPortOpen(targetPort, '127.0.0.1')) {
      ready = true;
      break;
    }
  }

  if (ready) {
    console.log(`\x1b[32m[db]\x1b[0m PostgreSQL database engine ready on port ${targetPort}.`);
  } else {
    console.warn(`\x1b[33m[db]\x1b[0m PostgreSQL daemon launching on port ${targetPort}...`);
  }

  return pgProc;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensurePostgresRunning(5433).then(() => {
    console.log('Database start check completed.');
  });
}
