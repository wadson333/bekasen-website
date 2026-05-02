# Nginx setup (Hostinger VPS)

Place these files on the VPS, then reload Nginx.

```bash
# 1. Vhost
sudo cp nginx/bekasen.conf /etc/nginx/sites-available/bekasen.conf
sudo ln -sf /etc/nginx/sites-available/bekasen.conf /etc/nginx/sites-enabled/bekasen.conf

# 2. Shared proxy snippet
sudo mkdir -p /etc/nginx/snippets
sudo cp nginx/bekasen-proxy.conf /etc/nginx/snippets/bekasen-proxy.conf

# 3. TLS via certbot (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d bekasen.com -d www.bekasen.com

# 4. Reload
sudo nginx -t
sudo systemctl reload nginx
```

## Verify

| Check | Command |
|---|---|
| HTTPS redirect | `curl -I http://bekasen.com` → 301 to https |
| TLS works | `curl -sI https://bekasen.com` → 200 |
| Public rate limit | 60 rapid requests → 503/429 after burst |
| Admin rate limit | 10 rapid POSTs to `/api/auth/login` → 503/429 |
| Static caching | `curl -sI https://bekasen.com/_next/static/css/...css` → `Cache-Control: public, immutable` |
| Headers | `curl -sI https://bekasen.com` → STS, X-Frame-Options, CSP present |

## Renewals

certbot adds a systemd timer; verify with:

```bash
sudo systemctl list-timers | grep certbot
```
