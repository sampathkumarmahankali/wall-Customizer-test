# Authentication Setup Guide

This guide explains the JWT authentication and bcrypt password hashing implementation.

## Features Added

### 1. JWT Authentication
- **Token-based authentication** using JSON Web Tokens
- **24-hour token expiration** for security
- **Protected routes** that require valid tokens
- **Automatic token verification** on protected endpoints

### 2. Bcrypt Password Hashing
- **Secure password hashing** using bcrypt with salt rounds of 10
- **Password migration script** to hash existing plain text passwords
- **Secure password comparison** for login verification

## Setup Instructions

### 1. Install Dependencies
```bash
npm install jsonwebtoken
```

### 2. Environment Variables
Create a `.env` file in the backend directory:
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=wallora
```

### 3. Database Migration
Run the password migration script to hash existing plain text passwords:
```bash
npm run migrate-passwords
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user (returns JWT token)
- `POST /api/auth/login` - Login user (returns JWT token)
- `POST /api/auth/update-password` - Update user password
- `POST /api/auth/verify-password` - Verify current password
- `GET /api/auth/profile` - Get user profile (protected route)
- `GET /api/auth/verify-token` - Verify JWT token (protected route)

### Protected Routes
Protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Frontend Integration

### Token Management
The frontend now includes token management utilities in `frontend/lib/auth.ts`:
- `getToken()` - Get stored JWT token
- `setToken(token)` - Store JWT token
- `removeToken()` - Remove all auth data
- `isAuthenticated()` - Check if user is authenticated
- `getAuthHeaders()` - Get headers with auth token
- `authenticatedFetch()` - Make authenticated API requests
- `logout()` - Logout and redirect to login

### Updated Components
- **LoginForm**: Now stores JWT token on successful login
- **RegisterForm**: Now stores JWT token on successful registration
- **ProfileForm**: Uses authenticated requests and includes logout functionality

## Security Features

### Password Security
- **Bcrypt hashing** with 10 salt rounds
- **Secure password comparison** using bcrypt.compare()
- **No plain text passwords** stored in database

### JWT Security
- **24-hour token expiration**
- **Secret key configuration** via environment variables
- **Token verification** on protected routes
- **Automatic token validation** middleware

### Database Security
- **Parameterized queries** to prevent SQL injection
- **Input validation** on all endpoints
- **Error handling** without exposing sensitive information

## Migration Process

### For Existing Users
1. Run the migration script: `npm run migrate-passwords`
2. Existing plain text passwords will be hashed
3. Users can continue logging in with their original passwords
4. New registrations will automatically use hashed passwords

### For New Users
- All new registrations automatically use bcrypt hashing
- JWT tokens are generated and returned on registration/login
- Frontend stores tokens for authenticated requests

## Testing

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Troubleshooting

### Common Issues
1. **Token expired**: Re-login to get a new token
2. **Invalid token**: Check token format and expiration
3. **Migration failed**: Check database connection and permissions
4. **CORS issues**: Ensure frontend and backend ports are configured correctly

### Debug Mode
Enable debug logging by setting environment variable:
```env
DEBUG=true
```

## Production Considerations

1. **Change JWT_SECRET** to a strong, unique secret
2. **Use HTTPS** in production
3. **Set appropriate CORS** origins
4. **Implement rate limiting** for auth endpoints
5. **Add password strength validation**
6. **Consider refresh tokens** for better security
7. **Monitor failed login attempts** 