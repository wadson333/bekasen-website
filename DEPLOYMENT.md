# Deployment — Hostinger VPS

Production runs as: **Nginx (host) → Docker network → Next.js standalone container → Postgres container**.
This file is the bootstrap recipe for the VPS the first time, and the day-to-day reference afterwards.

> Gitignored sibling — `IMPLEMENTATION_STATUS.md` covers feature progress; this one is purely ops.

---

## 1. VPS prerequisites

```bash
# Ubuntu 22.04+ on Hostinger
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx fail2ban ufw

# Docker (official install script)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER     # log out + back in for this to apply

# Firewall — only allow what's needed
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. Code + secrets

```bash
sudo mkdir -p /opt/bekasen && sudo chown $USER /opt/bekasen
git clone https://github.com/wadson333/bekasen-website.git /opt/bekasen
cd /opt/bekasen

# Copy .env from a secure place (NOT git). Required keys:
#   DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PANEL_UID,
#   OPENROUTER_API_KEY, RESEND_API_KEY, EMAIL_NOTIFY_TO,
#   POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB,
#   NEXT_PUBLIC_SITE_URL=https://bekasen.com
nano .env
chmod 600 .env
```

---

## 3. Build + start the stack

```bash
docker compose build web
docker compose up -d db
sleep 5

# First-time only: apply schema + seed admin
docker compose run --rm migrate npm run db:migrate
docker compose run --rm migrate npm run db:seed   # PRINTS TEMP PASSWORD ONCE — save it.

docker compose up -d web
docker compose ps
docker compose logs -f web        # watch boot
```

---

## 4. Nginx + TLS

```bash
sudo cp nginx/bekasen.conf /etc/nginx/sites-available/bekasen.conf
sudo ln -sf /etc/nginx/sites-available/bekasen.conf /etc/nginx/sites-enabled/
sudo mkdir -p /etc/nginx/snippets
sudo cp nginx/bekasen-proxy.conf /etc/nginx/snippets/

sudo nginx -t
sudo systemctl reload nginx

# Issue Let's Encrypt cert (interactive once, auto-renew via certbot timer)
sudo certbot --nginx -d bekasen.com -d www.bekasen.com
```

For the `web` service to be reachable from Nginx running on the host, uncomment the `ports: 127.0.0.1:3000:3000` line in `docker-compose.yml`.
(If Nginx runs as a sibling container instead, leave `expose:` and join the same `bekasen-net` network.)

---

## 5. Backups

```bash
# Daily cron — append to /etc/cron.daily/bekasen-pgdump
#!/bin/sh
set -e
TS=$(date +%Y%m%d-%H%M)
mkdir -p /opt/bekasen/backups
docker compose -f /opt/bekasen/docker-compose.yml exec -T db \
  pg_dump -U bekasen -d bekasen --no-owner --clean \
  | gzip > /opt/bekasen/backups/bekasen-$TS.sql.gz
# Retain the last 14 days
find /opt/bekasen/backups/ -name "bekasen-*.sql.gz" -mtime +14 -delete
```

```bash
sudo chmod +x /etc/cron.daily/bekasen-pgdump
```

> Off-site copy: `rsync` the `backups/` folder to a separate object store (Backblaze, Wasabi, R2). Don't keep snapshots only on the same VPS.

---

## 6. Updates / redeploys

### From GitHub Actions (preferred)
Pushing to `main` triggers `.github/workflows/deploy.yml`. Required repo secrets:

| Secret | Value |
|---|---|
| `VPS_HOST` | IP or hostname (e.g. `bekasen.com`) |
| `VPS_SSH_USER` | deploy user (e.g. `bekasen`) |
| `VPS_SSH_PRIVATE_KEY` | private half of the key authorised in `~/.ssh/authorized_keys` on the VPS |
| `VPS_KNOWN_HOSTS` | output of `ssh-keyscan VPS_HOST` |
| `VPS_DEPLOY_PATH` | `/opt/bekasen` |

### Manual
```bash
cd /opt/bekasen
git pull origin main
docker compose build web
docker compose run --rm migrate npm run db:migrate
docker compose up -d web
docker image prune -f
```

---

## 7. Operational checks

```bash
# Containers
docker compose ps
docker compose logs --tail=200 web

# DB
docker compose exec db psql -U bekasen -d bekasen -c "SELECT count(*) FROM admin_users;"

# Nginx
sudo nginx -t
sudo systemctl status nginx

# Cert renewal dry-run
sudo certbot renew --dry-run
```

---

## 8. Rollback

```bash
# Revert to last known-good commit
cd /opt/bekasen
git log --oneline -10
git checkout <previous-sha>
docker compose build web
docker compose up -d web
```

If a migration broke things, restore from the latest pg_dump:

```bash
gunzip -c /opt/bekasen/backups/bekasen-YYYYMMDD-HHMM.sql.gz \
  | docker compose exec -T db psql -U bekasen -d bekasen
```

---

## 9. Things on the day-1 checklist

- [ ] DNS A/AAAA → VPS IP
- [ ] `.env` filled with real secrets (rotate OpenRouter/Resend keys after first deploy)
- [ ] Resend domain verified (SPF/DKIM)
- [ ] Cal.com event types `30min` + `15min` exist on `bekasen-ytjx1n`
- [ ] First admin login: change password + scan TOTP QR (printed once via seed)
- [ ] Admin panel URL stored offline (`/panel/{ADMIN_PANEL_UID}/login`)
- [ ] GitHub Actions secrets configured
- [ ] First Postgres backup taken + verified restorable
