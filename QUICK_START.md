# 🚀 Quick Start Guide

## ⚡ Get Started in 5 Minutes

### 1. Start the Auth System

```bash
cd /Users/nitishpradhan/Documents/data-deployer-auth

# Create .env file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d
```

Wait ~30 seconds for services to initialize.

### 2. Access Admin Panel

Open browser: **http://localhost:5173**

**Default Login:**
- Email: `admin@example.com`
- Password: `changeme123`

### 3. Create Your First Organization

1. Go to **Organizations** tab
2. Click **Create Organization**
3. Fill in:
   - Name: "My Company"
   - License Type: Standard
   - Expiry: 1 year from now
   - Max Users: 20
   - Features: ✓ validator ✓ migrator ✓ reconciliator
   - Allowed IPs: (leave empty for now)

### 4. Create Users

1. Go to **User Management** tab
2. Click **Create User**
3. Fill in user details
4. Assign role (admin/user/viewer)
5. Select organization

### 5. Test API

```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"changeme123"}'

# Copy the access_token from response

# Validate token
curl -X GET http://localhost:8000/license/status \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📊 Check Logs

```bash
# Backend logs
docker-compose logs -f backend

# All services
docker-compose logs -f
```

## 🛑 Stop Services

```bash
docker-compose down
```

## 🔄 Reset Everything

```bash
docker-compose down -v
docker-compose up -d
```

## 🔗 Next Steps

1. **Change admin password** in Organizations tab
2. **Configure IP whitelist** for production
3. **Set strong SECRET_KEY** in `backend/.env`
4. **Integrate with main app** - See README.md "Integration" section

## 📍 Service URLs

- **Admin UI**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## ⚙️ Production Deployment

### Deploy to Your Second Droplet

```bash
# SSH to your auth droplet
ssh root@your-auth-server-ip

# Clone/copy files
cd /root
# Transfer data-deployer-auth folder

# Set production environment
cd data-deployer-auth/backend
nano .env
# Set:
# - SECRET_KEY (generate: openssl rand -hex 32)
# - ADMIN_EMAIL
# - ADMIN_PASSWORD
# - DEBUG=False

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### Update Main App

1. Install middleware in main app (see README.md)
2. Update CORS origins in auth server
3. Point frontend to auth server IP
4. Test login flow

---

**Need Help?** Check `README.md` for detailed documentation.
