<<<<<<< HEAD
# Innoventies admin — run & deploy

## System layout

| Piece   | Repo                     | Local port | Staging URL |
|---------|--------------------------|-----------|-------------|
| API     | `innoventies-nodejs`     | 5004      | `https://innoventies.com/api` (PM2 `innoventies-api`) |
| Website | `innoventies-website`    | 5104      | `https://innoventies.com` (PM2 `innoventies-website`) |
| Admin   | `innoventies-dashboard`  | 4303      | `https://innoventies.com/admin` (static, Apache) |
=======
# Dream Home website — run & deploy

## System layout

| Piece   | Repo                  | Local port | Staging URL |
|---------|-----------------------|-----------|-------------|
| API     | `dream-home-nodejs`   | 5016      | `https://dev.dreamsolutions25.com/api` (PM2 `dh-api`) |
| Website | `dream-home-website`  | 4216      | `https://dev.dreamsolutions25.com` (PM2 `dh-website`) |
| Admin   | `dream-home-dashboad` | 4316      | `https://dev.dreamsolutions25.com/admin` (static, Apache) |
>>>>>>> 6c2dd35eb085bbc234cd2710d6a2f1d9fa887fb5

Staging is a Linux box managed with aaPanel: Apache terminates TLS and reverse-proxies
to the two PM2 Node processes; the admin bundle is served as static files.

## Run locally

```bash
cp .env.example .env.local   # first time only
npm install
<<<<<<< HEAD
npm run dev                  # http://localhost:4303
```

Vite proxies `/api` and `/public` to `http://localhost:5004`, so the API must be running.

## Environments

`VITE_*` variables are **baked in at build time**. Vite picks the file from `--mode`,
and mode-specific files outrank `.env.local`.

| Command | Env file | API base | Served at |
|---------|----------|----------|-----------|
| `npm run dev`              | `.env.local`      | `http://localhost:5004/api` | `/` |
| `npm run build:staging`    | `.env.staging`    | `https://innoventies.com/api` | `/admin` |
| `npm run build:production` | `.env.production` | `https://innoventies.com/api` | `/admin` |

### The `/admin` sub-path

`VITE_BASE_PATH` (set to `/admin/` in the staging and production env files, unset in dev)
drives three things at once, so they can never drift apart:

- Vite's `base`, which rewrites every asset URL in `build/index.html` to `/admin/...`
- `import.meta.env.BASE_URL`, which feeds the react-router `basename` in `src/App.js`
- the hard `window.location.href` redirects to the sign-in page in `src/lib/apiClient.js`

Uploaded images still resolve correctly: the admin and the API share an origin under
`/admin`, so `src/config/api.js` returns `/public/uploads/...` as a same-origin path.

## Deploy to staging

The admin is a static SPA — **no PM2 process**. Apache serves it from
`/www/wwwroot/innoventies.com/admin`, mapped to `/admin` with `Alias`.

Keep the git checkout *outside* Apache's document tree, so `.git`, `node_modules`
and `.env.staging` are never reachable over HTTP:

```bash
mkdir -p /www/wwwroot/innoventies.com/repos
cd /www/wwwroot/innoventies.com/repos
git clone https://github.com/BudeshPatil/innoventies-dashboard.git admin
cd admin
cp .env.example .env.staging      # set VITE_API_BASE_URL and VITE_BASE_PATH=/admin/
./deploy.sh
```

`deploy.sh` pulls, builds, checks that the bundle really is sub-path aware, then
`rsync --delete`s `build/` into the served directory. Override the target with
`DEPLOY_DIR=/some/path ./deploy.sh`.

Every deploy after that is just:

```bash
cd /www/wwwroot/innoventies.com/repos/admin && ./deploy.sh
```

### Apache

The `/admin` block lives in the single staging vhost, kept in the website repo at
`apache.conf`. Three lines there are load-bearing:

- `ProxyPass /admin !` — must come **before** the catch-all `ProxyPass /`, or Apache
  hands `/admin` to Next.js instead of serving the bundle from disk.
- `Alias /admin` **and** `Alias /admin/` — the trailing-slash form alone does not match
  a bare `/admin`, which would fall through to the website.
- `RewriteRule ^ index.html [L]` — the SPA fallback, so reloading `/admin/services`
  works instead of 404ing.

`<Location /admin> Require all granted` exempts the dashboard from the staging basic-auth
prompt that covers the rest of the site.
=======
npm run dev                  # http://localhost:4216
```

The API must be running on 5016 first, and its `CORS_ORIGIN` must include
`http://localhost:4216`.

## Environments

`NEXT_PUBLIC_*` variables are **baked in at build time**, not read at runtime — changing
`.env.staging` requires a rebuild, not just a restart.

| File | Used by | API base |
|------|---------|----------|
| `.env.local`      | `npm run dev`              | `http://localhost:5016/api` |
| `.env.staging`    | `npm run build:staging`    | `https://dev.dreamsolutions25.com/api` |
| `.env.production` | `npm run build:production` | `https://dreamsolutions25.com/api` |

Next only auto-loads `.env.local`/`.env.production`, so the `build:staging` script sources
`.env.staging` into the shell before calling `next build`.

## Deploy to staging

The website **must** run as a Node process — it cannot be static files. `/blogs/[slug]`,
`/portfolio/[slug]` and `/services/[slug]` have no `generateStaticParams`, so Next renders
them per request. Apache reverse-proxies `/` to that process.

One-time setup on the server:

```bash
cd /www/wwwroot/dev.dreamsolutions25.com
git clone https://github.com/BudeshPatil/dream-home-website.git website
cd website
cp .env.example .env.staging      # NEXT_PUBLIC_API_URL=https://dev.dreamsolutions25.com/api
npm ci && npm run build:staging
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup           # run the command pm2 startup prints
```

Then install `apache.conf` as the staging vhost
(`/www/server/panel/vhost/apache/dev.dreamsolutions25.com.conf`) and reload Apache.
That one file routes all three pieces:

| Path | Goes to |
|------|---------|
| `/api/` (incl. `/api/health`), `/public/` | Express API on 5016 |
| `/admin/` | static Vite bundle on disk |
| `/` | this Next.js process on 4216 |

Every deploy after that:

```bash
cd /www/wwwroot/dev.dreamsolutions25.com/website && ./deploy.sh
```

### Two things the vhost gets wrong if you hand-edit it

- **`ProxyPass /` must stay last.** `/api/`, `/public/` and `ProxyPass /admin !`
  all have to come before it, or the catch-all swallows them.
- **Basic auth belongs in `<Location />`, not `<Directory>`.** A proxied request never
  touches the filesystem, so a `<Directory>` auth block silently stops applying the moment
  the website stops being served from disk. The same applies to the `<Files>` dotfile deny,
  which is why the vhost also carries a URL-based `<LocationMatch>` for it.

## Verify

```bash
curl https://dev.dreamsolutions25.com/api/health             # API, no auth
curl https://dev.dreamsolutions25.com/api/services/public    # API, no auth
curl -I https://dev.dreamsolutions25.com/admin/              # dashboard, no auth
curl -I -u admin:PASS https://dev.dreamsolutions25.com/      # website, behind basic auth
```
>>>>>>> 6c2dd35eb085bbc234cd2710d6a2f1d9fa887fb5
