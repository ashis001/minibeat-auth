# Data Deployer Authentication System

Enterprise-grade OAuth2 + JWT authentication and license management system built with Python FastAPI and React.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Auth System Components                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Backend (FastAPI)         Admin UI (React)             │
│  Port: 8000                Port: 5173                   │
│  ├── OAuth2 + JWT          ├── User Management          │
│  ├── RBAC                  ├── Organization Settings    │
│  ├── License Management    └── License Dashboard        │
│  └── IP Whitelisting                                    │
│                                                          │
│  PostgreSQL               Redis                         │
│  Port: 5432               Port: 6379                    │
│  ├── Users                ├── Sessions                  │
│  └── Organizations        └── Token Cache               │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### 1. Clone and Setup

```bash
cd /Users/nitishpradhan/Documents/data-deployer-auth
```

### 2. Configure Environment

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and set:
# - SECRET_KEY (generate with: openssl rand -hex 32)
# - ADMIN_EMAIL and ADMIN_PASSWORD
```

**Frontend:**
```bash
cd admin-ui
cp .env.example .env
# Set VITE_API_URL if backend is on different host
```

### 3. Run with Docker

```bash
# From project root
docker-compose up -d
```

Services will be available at:
- **Backend API**: http://localhost:8000
- **Admin UI**: http://localhost:5173
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### 4. Initial Login

Default credentials (change immediately):
- **Email**: admin@example.com
- **Password**: changeme123

## 📋 API Endpoints

### Authentication
```
POST   /auth/login          - Login and get tokens
POST   /auth/refresh        - Refresh access token
POST   /auth/validate       - Validate token and license
POST   /auth/logout         - Logout (revoke refresh token)
```

### Admin (Requires Admin Role)
```
POST   /admin/users                    - Create user
GET    /admin/users                    - List all users
PATCH  /admin/users/{user_id}          - Update user
DELETE /admin/users/{user_id}          - Delete user

POST   /admin/organizations            - Create organization
GET    /admin/organizations            - List organizations
PATCH  /admin/organizations/{org_id}   - Update organization
```

### License
```
GET    /license/status                     - Get current user's license
GET    /license/check/{organization_id}    - Check org license (for main app)
```

## 🔐 Security Features

### 1. OAuth2 + JWT
- Access tokens: 15-minute expiry
- Refresh tokens: 7-day expiry
- Token rotation on refresh
- Secure token storage in Redis

### 2. Role-Based Access Control (RBAC)

**Admin**
- Full access to all features
- User management
- Organization management
- Deploy applications

**User**
- View and add validations
- Run validations
- View activity logs

**Viewer**
- Read-only access
- View validations and logs

### 3. IP Whitelisting
- Organization-level IP restrictions
- Supports individual IPs and CIDR ranges
- Example: `["192.168.1.1", "10.0.0.0/24"]`

### 4. License Management
- Per-organization licenses
- Time-based expiration
- Feature toggles (validator, migrator, reconciliator)
- User count limits
- Automatic validation on login and periodic checks

## 🗄️ Database Schema

### Organizations
```sql
- id (UUID)
- name (String)
- license_type (Enum: trial, standard, enterprise)
- license_expires_at (DateTime)
- max_users (Integer)
- features_enabled (JSON Array)
- allowed_ips (JSON Array)
- is_active (Boolean)
- created_at (DateTime)
```

### Users
```sql
- id (UUID)
- email (String, Unique)
- password_hash (String)
- full_name (String)
- role (Enum: admin, user, viewer)
- organization_id (Foreign Key)
- created_by (Foreign Key to Users)
- last_login (DateTime)
- last_ip (String)
- is_active (Boolean)
- created_at (DateTime)
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python -m app.db.init_db

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd admin-ui

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🐳 Docker Deployment

### Build and Run
```bash
docker-compose up --build -d
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f admin-ui
```

### Stop Services
```bash
docker-compose down
```

### Reset Database
```bash
docker-compose down -v
docker-compose up -d
```

## 🔗 Integration with Main App

### Step 1: Install Dependencies (Node.js)

```bash
npm install jsonwebtoken axios node-cache
```

### Step 2: Create Auth Middleware

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const axios = require('axios');
const NodeCache = require('node-cache');

const AUTH_SERVER = 'http://auth-server-ip:8000';
const licenseCache = new NodeCache({ stdTTL: 1800 }); // 30 min cache

async function validateToken(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    // Verify JWT (get public key from auth server)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check license cache
    const cachedLicense = licenseCache.get(decoded.organization_id);
    
    if (!cachedLicense) {
      // Validate with auth server
      const response = await axios.post(`${AUTH_SERVER}/auth/validate`, {
        user_id: decoded.user_id,
        organization_id: decoded.organization_id
      });
      
      if (!response.data.valid) {
        return res.status(403).json({ error: 'License expired or invalid' });
      }
      
      licenseCache.set(decoded.organization_id, response.data);
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Permission check
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { validateToken, requirePermission };
```

### Step 3: Apply Middleware

```javascript
// server/server.js
const { validateToken, requirePermission } = require('./middleware/auth');

// Protect routes
app.use('/api/*', validateToken);

// Specific permission checks
app.post('/api/deploy', requirePermission('deploy'), async (req, res) => {
  // Deploy logic
});

app.post('/api/validations', requirePermission('add_validations'), async (req, res) => {
  // Add validation logic
});
```

### Step 4: Frontend Login Integration

```typescript
// src/api/auth.ts
export async function loginToAuthServer(email: string, password: string) {
  const response = await fetch('http://auth-server-ip:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Database Connection
```bash
docker exec -it auth-postgres psql -U auth_user -d auth_db
```

### Redis Connection
```bash
docker exec -it auth-redis redis-cli
```

## 🔄 Periodic License Check

Set up periodic validation in main app:

```javascript
// Check license every 30 minutes
setInterval(async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const response = await fetch(`${AUTH_SERVER}/auth/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: user.id,
      organization_id: user.organization_id
    })
  });
  
  const data = await response.json();
  
  if (!data.valid) {
    alert('Your license has expired. Please contact your administrator.');
    window.location.href = '/login';
  }
}, 30 * 60 * 1000);
```

## 🛠️ Troubleshooting

### Backend not starting
```bash
# Check PostgreSQL
docker-compose logs postgres

# Check Redis
docker-compose logs redis

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Cannot login
1. Check admin credentials in `.env`
2. Verify database initialization: `docker-compose logs backend`
3. Reset admin password by reinitializing database

### CORS errors
Update `backend/app/config.py` ALLOWED_ORIGINS to include your frontend URL

## 📝 License Types

### Trial
- 30-day expiration
- Max 5 users
- All features enabled
- Free

### Standard
- 1-year expiration
- Max 50 users
- Selected features
- Paid

### Enterprise
- Custom expiration
- Unlimited users
- All features
- Custom pricing

## 🔒 Security Best Practices

1. **Change default admin password immediately**
2. **Use strong SECRET_KEY** (32+ characters)
3. **Enable HTTPS in production**
4. **Set up IP whitelisting** for organizations
5. **Regular database backups**
6. **Monitor failed login attempts**
7. **Rotate JWT secrets periodically**

## 📧 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Verify database: `docker exec -it auth-postgres psql -U auth_user -d auth_db`
3. Test API: `curl http://localhost:8000/health`

---

**Built with ❤️ for Data Deployer**
