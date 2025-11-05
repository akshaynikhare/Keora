# Deployment Guide

This guide covers deploying Keora to production using Docker on a Linux server.

## Server Requirements

### Minimum Specifications
- **OS:** Ubuntu 20.04 LTS or later (or any Linux distribution)
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 20 GB SSD
- **Network:** Public IP address with ports 80 and 443 open

### Recommended Specifications
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 50 GB SSD
- **Network:** Public IP with domain name configured

## Prerequisites

1. **Docker & Docker Compose**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh

   # Add user to docker group
   sudo usermod -aG docker $USER

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Git**
   ```bash
   sudo apt update
   sudo apt install git -y
   ```

3. **Domain Name** (optional but recommended)
   - Point your domain's A record to your server's IP
   - For SSL, you'll need a domain name

## Deployment Steps

### 1. Clone Repository

```bash
cd /home/user
git clone <repository-url>
cd Keora
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

Required variables:
```env
DATABASE_URL="postgresql://postgres:CHANGE_THIS_PASSWORD@postgres:5432/keora?schema=public"
JWT_SECRET="GENERATE_A_SECURE_RANDOM_STRING_HERE"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=keora

# Optional but recommended
WHATSAPP_API_KEY=your_key_here
WHATSAPP_API_URL=your_url_here
WHATSAPP_SENDER_ID=your_sender_id

EMAIL_FROM=noreply@your-domain.com
SENDGRID_API_KEY=your_sendgrid_key
# OR
RESEND_API_KEY=your_resend_key

# File storage
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=keora-uploads
```

### 3. Generate Secure Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate PostgreSQL password
openssl rand -base64 16
```

### 4. Build and Start Services

```bash
# Build the application
docker-compose build

# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 5. Initialize Database

```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Generate Prisma client
docker-compose exec app npx prisma generate

# (Optional) Seed database
docker-compose exec app npx prisma db seed
```

### 6. Configure SSL (Recommended)

#### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop Nginx container temporarily
docker-compose stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Update nginx.conf to use SSL
# Uncomment the SSL server block in nginx.conf
nano nginx.conf

# Update certificate paths
ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

# Update docker-compose.yml to mount certificates
# Add under nginx volumes:
# - /etc/letsencrypt:/etc/letsencrypt:ro

# Restart Nginx
docker-compose up -d nginx
```

### 7. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## Monitoring and Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### Check Service Health

```bash
# Service status
docker-compose ps

# Health check endpoint
curl http://localhost/health

# Database connection
docker-compose exec app npx prisma db pull
```

### Backup Database

```bash
# Create backup directory
mkdir -p ~/backups

# Backup script
docker-compose exec postgres pg_dump -U postgres keora > ~/backups/keora_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups (add to crontab)
crontab -e

# Add this line:
0 2 * * * cd /home/user/Keora && docker-compose exec -T postgres pg_dump -U postgres keora > ~/backups/keora_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
# Restore from backup
cat ~/backups/keora_20240101.sql | docker-compose exec -T postgres psql -U postgres keora
```

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

## Performance Optimization

### 1. Enable Redis Caching

Already configured in docker-compose.yml. To use in your application:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache example
await redis.set('key', 'value', 'EX', 3600);
const value = await redis.get('key');
```

### 2. Configure Nginx Caching

Edit `nginx.conf` to add caching:

```nginx
# Add to http block
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=app_cache:10m max_size=1g inactive=60m;

# Add to location blocks
proxy_cache app_cache;
proxy_cache_valid 200 60m;
proxy_cache_bypass $http_cache_control;
```

### 3. Database Connection Pooling

Already configured in Prisma. Adjust in `lib/prisma.ts` if needed:

```typescript
new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  connectionLimit: 10,
});
```

## Troubleshooting

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Common issues:
# 1. Database connection error - check DATABASE_URL
# 2. Port already in use - change ports in docker-compose.yml
# 3. Missing environment variables - check .env file
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec postgres psql -U postgres -d keora -c "SELECT 1;"

# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### High Memory Usage

```bash
# Check container resource usage
docker stats

# Limit container resources in docker-compose.yml:
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
```

### Nginx Configuration Errors

```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Restrict database access
- [ ] Keep Docker images updated
- [ ] Monitor logs regularly
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Disable debug mode in production

## Monitoring Setup

### Using Docker Stats

```bash
# Real-time resource monitoring
docker stats
```

### Log Rotation

```bash
# Configure Docker log rotation
# Add to /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

## Scaling Considerations

### Horizontal Scaling

For high traffic, consider:

1. **Load Balancer:** Use Nginx or AWS ELB
2. **Multiple App Instances:** Scale `app` service
3. **Database Replication:** PostgreSQL read replicas
4. **CDN:** CloudFlare or AWS CloudFront for static assets
5. **Separate Redis:** Dedicated Redis cluster

### Vertical Scaling

```bash
# Increase container resources in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
      cpus: '2.0'
```

## Support

For deployment issues, please:
1. Check logs: `docker-compose logs -f`
2. Review this guide
3. Contact the development team

---

Last updated: 2025
