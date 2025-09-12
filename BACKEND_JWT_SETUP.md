# Backend JWT Authentication Setup with Clerk

## Overview

Your frontend is now configured to send Clerk JWT tokens to your backend. Here's how to set up your backend to validate these tokens.

## Frontend Changes Made

✅ **Updated API client** (`src/lib/api.ts`):

- Automatically includes Clerk JWT token in Authorization header
- Uses `Bearer ${token}` format
- Handles token retrieval gracefully

## Backend Implementation Options

### Option 1: Clerk JWT Validation (Recommended)

Use Clerk's official libraries to validate JWT tokens on your backend.

#### Node.js/Express Backend

```bash
npm install @clerk/backend
```

```javascript
// middleware/auth.js
import { verifyToken } from '@clerk/backend';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    req.user = {
      id: payload.sub, // Clerk user ID
      email: payload.email,
      // Add other claims as needed
    };

    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

#### Python/FastAPI Backend

```bash
pip install clerk-sdk-python
```

```python
# middleware/auth.py
from clerk_sdk import Clerk
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

clerk = Clerk(secret_key=os.getenv("CLERK_SECRET_KEY"))
security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = clerk.verify_token(token)
        return {
            "id": payload["sub"],
            "email": payload.get("email"),
            # Add other claims as needed
        }
    except Exception as e:
        raise HTTPException(status_code=403, detail="Invalid token")
```

### Option 2: Manual JWT Validation

If you prefer to validate JWT tokens manually:

```javascript
// For Node.js
import jwt from 'jsonwebtoken';

export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify with Clerk's public key
    const decoded = jwt.verify(token, process.env.CLERK_JWT_PUBLIC_KEY, {
      algorithms: ['RS256'],
    });

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}
```

## Environment Variables for Backend

Add these to your backend `.env`:

```env
# Clerk Backend Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_JWT_PUBLIC_KEY=your_clerk_jwt_public_key_here  # If using manual validation
```

## API Route Protection

### Express.js Example

```javascript
// routes/swings.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(authenticateToken);

router.get('/', async (req, res) => {
  // req.user.id contains the Clerk user ID
  const userId = req.user.id;

  try {
    const swings = await getSwingsByUserId(userId);
    res.json({ data: swings });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch swings' });
  }
});

router.post('/', async (req, res) => {
  const userId = req.user.id;
  const swingData = { ...req.body, userId };

  try {
    const swing = await createSwing(swingData);
    res.json({ data: swing });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create swing' });
  }
});
```

### FastAPI Example

```python
# routes/swings.py
from fastapi import APIRouter, Depends
from middleware.auth import verify_token

router = APIRouter()

@router.get("/swings")
async def get_swings(user: dict = Depends(verify_token)):
    user_id = user["id"]
    swings = await get_swings_by_user_id(user_id)
    return {"data": swings}

@router.post("/swings")
async def create_swing(swing_data: dict, user: dict = Depends(verify_token)):
    user_id = user["id"]
    swing_data["user_id"] = user_id
    swing = await create_swing(swing_data)
    return {"data": swing}
```

## Database Schema Considerations

When storing user-related data, use the Clerk user ID:

```sql
-- Example: swings table
CREATE TABLE swings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  title VARCHAR(255) NOT NULL,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient user-based queries
CREATE INDEX idx_swings_user_id ON swings(user_id);
```

## Testing Your Setup

1. **Frontend**: Make sure your API calls include the Authorization header
2. **Backend**: Verify that protected routes require valid tokens
3. **Database**: Ensure user data is properly associated with Clerk user IDs

## Security Best Practices

1. **Always validate tokens** on the backend
2. **Use HTTPS** in production
3. **Set appropriate token expiration** (Clerk handles this)
4. **Log authentication failures** for monitoring
5. **Rate limit** authentication endpoints

## Troubleshooting

- **401 Unauthorized**: Check if Authorization header is being sent
- **403 Forbidden**: Verify token is valid and not expired
- **CORS issues**: Ensure your backend allows credentials and the correct origin

## Next Steps

1. Set up your backend with one of the authentication methods above
2. Test the integration with your frontend
3. Implement user-specific data filtering in your API endpoints
4. Add proper error handling for authentication failures
