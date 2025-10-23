# Deployment to Production Server

## 🚀 Quick Deployment Guide

### 1. Create GitHub Repository

```bash
# On GitHub, create new repository: minibeat-auth
# Then connect local repo:

cd /Users/nitishpradhan/Documents/data-deployer-auth
git remote add origin https://github.com/YOUR_USERNAME/minibeat-auth.git
git add .
git commit -m "Initial commit: Minibeat Auth System"
git push -u origin main
```

### 2. SSH to Your Second Droplet

```bash
ssh root@YOUR_DROPLET_IP
```

### 3. Install Docker (if not installed)

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

### 4. Clone and Setup

```bash
# Clone repository
cd /root
git clone https://github.com/YOUR_USERNAME/minibeat-auth.git
cd minibeat-auth

# Create production .env file
cd backend
nano .env
```

**Paste this in .env:**
```bash
# Database
DATABASE_URL=postgresql://auth_user:CHANGE_THIS_PASSWORD@postgres:5432/auth_db

# Redis
REDIS_URL=redis://redis:6379/0

# JWT Settings (IMPORTANT: Generate new secret!)
SECRET_KEY=GENERATE_NEW_SECRET_HERE_USE_COMMAND_BELOW
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=False

# CORS (Add your Minibeat app URL)
ALLOWED_ORIGINS=http://YOUR_MINIBEAT_URL,http://64.227.183.35

# Admin User
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=CHANGE_THIS_STRONG_PASSWORD
```

**Generate SECRET_KEY:**
```bash
openssl rand -hex 32
# Copy the output and paste as SECRET_KEY above
```

Save file: `Ctrl+X`, then `Y`, then `Enter`

### 5. Update Docker Compose for Production

```bash
cd /root/minibeat-auth
nano docker-compose.yml
```

Update the file to use environment variables from .env:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: auth-postgres
    environment:
      POSTGRES_USER: auth_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-auth_password}
      POSTGRES_DB: auth_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - auth-network

  redis:
    image: redis:7-alpine
    container_name: auth-redis
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - auth-network

  backend:
    build: ./backend
    container_name: auth-backend
    env_file:
      - ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - auth-network

  admin-ui:
    build: ./admin-ui
    container_name: auth-admin-ui
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - auth-network

volumes:
  postgres_data:
  redis_data:

networks:
  auth-network:
    driver: bridge
```

### 6. Start Services

```bash
cd /root/minibeat-auth
docker-compose up -d --build
```

### 7. Check Status

```bash
# View running containers
docker-compose ps

# Check logs
docker-compose logs -f backend

# Check if services are healthy
curl http://localhost:8000/health
curl http://localhost
```

### 8. Access Your Auth System

**Admin Panel**: `http://YOUR_DROPLET_IP`
**API**: `http://YOUR_DROPLET_IP:8000`

Login with the credentials you set in `.env`

---

## 🔒 Security Checklist

- ✅ Changed `SECRET_KEY` to random 32-byte hex
- ✅ Changed `ADMIN_PASSWORD` to strong password
- ✅ Changed PostgreSQL password
- ✅ Set `DEBUG=False`
- ✅ Updated `ALLOWED_ORIGINS` with Minibeat URL
- ✅ Firewall configured (allow ports 80, 8000, 22)

---

## 🔄 Updating Code

```bash
ssh root@YOUR_DROPLET_IP
cd /root/minibeat-auth
git pull origin main
docker-compose down
docker-compose up -d --build
```

---

## 📊 Monitoring

```bash
# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Database backup
docker exec auth-postgres pg_dump -U auth_user auth_db > backup.sql
```

---

## 🆘 Troubleshooting

**Can't connect to API:**
```bash
# Check if backend is running
docker-compose ps
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

**Database issues:**
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

**Memory issues:**
```bash
# Check memory
free -h

# Increase droplet size if needed
```

---

## 🔗 Next Step: Connect Minibeat

Once auth system is deployed, update Minibeat to use:
- Auth Server URL: `http://YOUR_DROPLET_IP:8000`
- Follow integration guide in main Minibeat app
