// PM2 process definition for the Dream Home public website (Next.js).
// Start:  pm2 start ecosystem.config.cjs
// NEXT_PUBLIC_* values are baked in at build time — rebuild after changing .env.staging.
module.exports = {
  apps: [
    {
      name: 'dh-website',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 4216',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '768M',
      env: { NODE_ENV: 'production', PORT: '4216' },
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      time: true,
    },
  ],
};
