# MiniBeast Organization Status Integration

## Overview
This integration ensures that when an organization is paused via the Admin Portal, MiniBeast will instantly show a blurred overlay with a message preventing access.

## Backend Endpoint
```
GET http://139.59.22.121:8000/license/organization/status/{org_id}
```

### Response Format
```json
{
  "status": "paused" | "expired" | "active",
  "message": "Your organization is paused. Please contact Dataction to use MiniBeast.",
  "can_access": false
}
```

## Frontend Integration (React/Next.js)

### 1. Create Organization Status Context

```typescript
// contexts/OrgStatusContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface OrgStatus {
  status: 'active' | 'paused' | 'expired';
  message: string;
  can_access: boolean;
}

interface OrgStatusContextType {
  orgStatus: OrgStatus | null;
  checkStatus: () => Promise<void>;
}

const OrgStatusContext = createContext<OrgStatusContextType | undefined>(undefined);

export const OrgStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orgStatus, setOrgStatus] = useState<OrgStatus | null>(null);

  const checkStatus = async () => {
    try {
      const orgId = localStorage.getItem('organization_id'); // Get from your auth
      if (!orgId) return;

      const response = await axios.get(
        `http://139.59.22.121:8000/license/organization/status/${orgId}`
      );
      setOrgStatus(response.data);
    } catch (error) {
      console.error('Failed to check org status:', error);
    }
  };

  // Check status on mount and every 30 seconds
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <OrgStatusContext.Provider value={{ orgStatus, checkStatus }}>
      {children}
    </OrgStatusContext.Provider>
  );
};

export const useOrgStatus = () => {
  const context = useContext(OrgStatusContext);
  if (!context) throw new Error('useOrgStatus must be used within OrgStatusProvider');
  return context;
};
```

### 2. Create Blocked Overlay Component

```typescript
// components/OrgBlockedOverlay.tsx
import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface Props {
  status: 'paused' | 'expired';
  message: string;
}

export const OrgBlockedOverlay: React.FC<Props> = ({ status, message }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Blurred Background */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg"
        style={{ backdropFilter: 'blur(10px)' }}
      />
      
      {/* Modal */}
      <div className="relative z-10 bg-slate-800 rounded-2xl p-8 max-w-md mx-4 border-2 border-red-500 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            {status === 'paused' ? (
              <XCircle className="w-12 h-12 text-red-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-orange-500" />
            )}
          </div>
          
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            {status === 'paused' ? 'Organization Paused' : 'License Expired'}
          </h2>
          
          {/* Message */}
          <p className="text-slate-300 mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* Contact Info */}
          <div className="w-full p-4 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 mb-2">Contact Support:</p>
            <p className="text-white font-semibold">support@dataction.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3. Wrap App with Status Check

```typescript
// App.tsx or _app.tsx
import { OrgStatusProvider, useOrgStatus } from './contexts/OrgStatusContext';
import { OrgBlockedOverlay } from './components/OrgBlockedOverlay';

function AppContent() {
  const { orgStatus } = useOrgStatus();

  return (
    <>
      {/* Your normal app content */}
      <YourApp />
      
      {/* Overlay when blocked */}
      {orgStatus && !orgStatus.can_access && (
        <OrgBlockedOverlay 
          status={orgStatus.status as 'paused' | 'expired'} 
          message={orgStatus.message} 
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <OrgStatusProvider>
      <AppContent />
    </OrgStatusProvider>
  );
}
```

## Node.js/Express Backend Integration

```javascript
// middleware/checkOrgStatus.js
const axios = require('axios');

async function checkOrgStatus(req, res, next) {
  try {
    const orgId = req.user?.organization_id; // From your auth token
    
    if (!orgId) {
      return res.status(401).json({ error: 'No organization found' });
    }

    const response = await axios.get(
      `http://139.59.22.121:8000/license/organization/status/${orgId}`
    );

    if (!response.data.can_access) {
      return res.status(403).json({
        error: 'Organization access denied',
        status: response.data.status,
        message: response.data.message
      });
    }

    next();
  } catch (error) {
    console.error('Org status check failed:', error);
    next(); // Allow request to continue on error
  }
}

module.exports = checkOrgStatus;
```

### Apply Middleware to Protected Routes

```javascript
// server.js
const checkOrgStatus = require('./middleware/checkOrgStatus');

// Apply to all API routes
app.use('/api', checkOrgStatus, apiRouter);

// Or apply to specific routes
app.get('/api/validator/run', checkOrgStatus, async (req, res) => {
  // Your validator logic
});
```

## Testing

### 1. Test Paused State
1. Login to Admin Portal: http://139.59.22.121:5173
2. Navigate to organization
3. Click "Pause Organization" (orange button)
4. MiniBeast should immediately show overlay

### 2. Test Resume
1. Click "Resume Organization" (blue button)
2. MiniBeast overlay should disappear within 30 seconds (or refresh)

## Instant Response Option

For instant blocking without waiting for polling interval:

```typescript
// Add socket.io or polling on critical actions
const checkStatusBeforeAction = async () => {
  const { orgStatus, checkStatus } = useOrgStatus();
  await checkStatus(); // Force immediate check
  
  if (!orgStatus?.can_access) {
    // Show overlay
    return false;
  }
  
  return true;
};

// Use before important operations
async function runValidator() {
  const canProceed = await checkStatusBeforeAction();
  if (!canProceed) return;
  
  // Proceed with validator
}
```

## Notes
- Status checks run every 30 seconds automatically
- Overlay prevents all interaction when shown
- Backend also validates on API calls
- Users see consistent message across all touchpoints
