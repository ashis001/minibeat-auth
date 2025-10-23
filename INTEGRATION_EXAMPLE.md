# Integration Example for Main App

This guide shows how to integrate the auth system with your main Data Deployer app.

## 📦 Step 1: Install Dependencies in Main App

```bash
cd /Users/nitishpradhan/Documents/data-deployer-main/server
npm install jsonwebtoken axios node-cache
```

## 🔐 Step 2: Create Auth Middleware

Create `/Users/nitishpradhan/Documents/data-deployer-main/server/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');
const axios = require('axios');
const NodeCache = require('node-cache');

// Configuration
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Cache for license validation (30 min TTL)
const licenseCache = new NodeCache({ stdTTL: 1800 });

/**
 * Middleware to validate JWT token and check permissions
 */
async function authenticateToken(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }

    // Check license validity (use cache)
    const cacheKey = `license:${decoded.organization_id}`;
    let licenseValid = licenseCache.get(cacheKey);

    if (licenseValid === undefined) {
      // Validate with auth server
      try {
        const response = await axios.post(
          `${AUTH_SERVER_URL}/auth/validate`,
          {
            user_id: decoded.user_id,
            organization_id: decoded.organization_id
          }
        );

        licenseValid = response.data.valid;
        licenseCache.set(cacheKey, licenseValid);
      } catch (error) {
        console.error('License validation failed:', error.message);
        return res.status(503).json({ 
          success: false, 
          error: 'Authentication service unavailable' 
        });
      }
    }

    if (!licenseValid) {
      return res.status(403).json({ 
        success: false, 
        error: 'License expired or invalid' 
      });
    }

    // Attach user info to request
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      role: decoded.role,
      organizationId: decoded.organization_id,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }
    
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
}

/**
 * Middleware to check specific permission
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        success: false, 
        error: `Permission denied: ${permission} required` 
      });
    }

    next();
  };
}

/**
 * Middleware to check if user is admin
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      error: 'Admin access required' 
    });
  }

  next();
}

module.exports = {
  authenticateToken,
  requirePermission,
  requireAdmin
};
```

## 🔌 Step 3: Apply Middleware to Routes

Update `/Users/nitishpradhan/Documents/data-deployer-main/server/server.js`:

```javascript
const { authenticateToken, requirePermission, requireAdmin } = require('./middleware/auth');

// ... existing code ...

// Apply authentication to all API routes
app.use('/api/*', authenticateToken);

// Protected routes with specific permissions

// Deployment routes (admin only)
app.post('/api/deploy', requirePermission('deploy'), async (req, res) => {
  // Your existing deploy logic
});

// Validation routes
app.get('/api/validations', requirePermission('view_validations'), async (req, res) => {
  // Your existing view validations logic
});

app.post('/api/validations', requirePermission('add_validations'), async (req, res) => {
  // Your existing add validation logic
});

app.put('/api/validations/:id', requirePermission('edit_validations'), async (req, res) => {
  // Your existing edit validation logic
});

app.delete('/api/validations/:id', requirePermission('delete_validations'), async (req, res) => {
  // Your existing delete validation logic
});

app.post('/api/run-validation', requirePermission('run_validations'), async (req, res) => {
  // Your existing run validation logic
});

// Activity logs
app.get('/api/activity', requirePermission('view_activity'), async (req, res) => {
  // Your existing activity log logic
});

// User management (admin only)
app.get('/api/users', requireAdmin, async (req, res) => {
  // User management logic
});
```

## 🎨 Step 4: Update Frontend Login

Create `/Users/nitishpradhan/Documents/data-deployer-main/src/components/Login.tsx`:

```typescript
import React, { useState } from 'react';
import axios from 'axios';

const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:8000';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${AUTH_SERVER_URL}/auth/login`, {
        email,
        password
      });

      // Store tokens and user info
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('license', JSON.stringify(response.data.license));

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6">Login</h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};
```

## 🔄 Step 5: API Client with Auto Token Refresh

Create `/Users/nitishpradhan/Documents/data-deployer-main/src/api/client.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = '/api';
const AUTH_SERVER_URL = import.meta.env.VITE_AUTH_SERVER_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${AUTH_SERVER_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

## ⏰ Step 6: Periodic License Check

Add to main app startup:

```typescript
// src/App.tsx or main.tsx

// Check license every 30 minutes
useEffect(() => {
  const checkLicense = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!user.id) return;

    try {
      const response = await axios.post(`${AUTH_SERVER_URL}/auth/validate`, {
        user_id: user.id,
        organization_id: user.organization_id
      });

      if (!response.data.valid) {
        alert('Your license has expired. Please contact your administrator.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('License check failed:', error);
    }
  };

  // Initial check
  checkLicense();

  // Periodic check every 30 minutes
  const interval = setInterval(checkLicense, 30 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

## 🌐 Step 7: Environment Variables

Add to `/Users/nitishpradhan/Documents/data-deployer-main/.env`:

```bash
# Auth Server
AUTH_SERVER_URL=http://your-auth-server-ip:8000
JWT_SECRET=your-secret-key-change-this-in-production

# Frontend
VITE_AUTH_SERVER_URL=http://your-auth-server-ip:8000
```

## ✅ Step 8: Test Integration

```bash
# 1. Start auth server
cd /Users/nitishpradhan/Documents/data-deployer-auth
docker-compose up -d

# 2. Start main app
cd /Users/nitishpradhan/Documents/data-deployer-main
npm run dev

# 3. Test login flow
# - Go to http://localhost:5173
# - Login with admin credentials
# - Should redirect to dashboard
# - All API calls should include Bearer token
```

## 🔍 Verify Integration

Check browser console for:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Check server logs for:
```
User authenticated: { id: '...', email: '...', role: 'admin' }
```

## 📊 Permission Mapping

Match these permissions in your routes:

| Feature | Permission | Role Required |
|---------|-----------|---------------|
| Deploy modules | `deploy` | Admin |
| View validations | `view_validations` | All |
| Add validations | `add_validations` | User, Admin |
| Edit validations | `edit_validations` | User, Admin |
| Run validations | `run_validations` | User, Admin |
| View activity | `view_activity` | All |
| Manage users | `manage_users` | Admin |

---

**Integration Complete!** Your main app now uses enterprise auth with RBAC and license management.
