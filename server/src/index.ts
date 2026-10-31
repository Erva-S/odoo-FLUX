import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Subscriptly API Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  console.log(`👉 Health check: http://localhost:${env.PORT}/api/health`);
});

const gracefulShutdown = async () => {
  console.log('\nStopping Subscriptly API Server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Process terminated gracefully.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
