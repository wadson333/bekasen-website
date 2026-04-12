---
name: devops-vps
description: Skill pour la configuration infrastructure de Konprann. Docker Compose, GitHub Actions CI/CD, Nginx, monitoring VPS et optimisation pour connexions mobiles haïtiennes lentes.
---

# DevOps VPS — Konprann Skill

## Docker Compose Production (Palier 1)

```yaml
# docker-compose.prod.yml
services:
  backend:
    build: ./backend
    image: konprann/backend:latest
    restart: unless-stopped
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - QDRANT_URL=${QDRANT_URL}
      - SECRET_KEY=${SECRET_KEY}
    depends_on: [db, redis, qdrant]
    networks: [konprann-net]

  celery:
    build: ./backend
    command: celery -A app.tasks worker -l info -Q ingestion,notifications
    restart: unless-stopped
    depends_on: [backend, redis]
    networks: [konprann-net]

  db:
    image: postgres:15-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    environment:
      - POSTGRES_DB=konprann
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    networks: [konprann-net]

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
    networks: [konprann-net]

  qdrant:
    image: qdrant/qdrant:latest
    restart: unless-stopped
    volumes:
      - qdrant_data:/qdrant/storage
    networks: [konprann-net]

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
    depends_on: [backend]
    networks: [konprann-net]

volumes:
  postgres_data:
  qdrant_data:
networks:
  konprann-net:
    driver: bridge
```

## GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy Konprann
on:
  push:
    branches: [develop]
    tags: ['v*.*.*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Backend
        run: cd backend && pip install -r requirements.txt && pytest -v
      - name: Test Frontend
        run: cd packages/web && npm ci && npm run test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/konprann
            git pull origin develop
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --no-downtime
            docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

  deploy-prod:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Production VPS
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.PROD_HOST }}
          username: deploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/konprann
            git fetch --tags && git checkout ${{ github.ref_name }}
            docker compose -f docker-compose.prod.yml up -d --no-downtime
```

## Nginx — Optimisé pour Haïti

```nginx
# nginx/nginx.conf
http {
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types text/plain application/json application/javascript text/css
               application/woff2 audio/opus;

    # Cache agressif assets statiques
    location ~* \.(js|css|woff2|png|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Audio Manman Marie — cache 7 jours
    location /api/v1/fondation/audio/ {
        proxy_pass http://backend:8000;
        proxy_cache audio_cache;
        proxy_cache_valid 200 7d;
    }

    # API avec rate limiting
    location /api/v1/tutor/ {
        limit_req zone=tutor_limit burst=5 nodelay;
        proxy_pass http://backend:8000;
    }

    limit_req_zone $binary_remote_addr zone=tutor_limit:10m rate=10r/m;
}
```

## Backup Automatique PostgreSQL

```bash
#!/bin/bash
# /opt/konprann/scripts/backup.sh — cron quotidien à 3h
DATE=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U $DB_USER konprann | gzip > /backup/konprann_$DATE.sql.gz
# Garder seulement les 30 derniers jours
find /backup -name "konprann_*.sql.gz" -mtime +30 -delete
# Optionnel : upload vers S3
# aws s3 cp /backup/konprann_$DATE.sql.gz s3://konprann-backups/
```
