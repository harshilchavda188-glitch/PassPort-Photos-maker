# API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## Authentication
Most endpoints require authentication using JWT tokens.

**Header Format:**
```
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

---

## Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email with the OTP sent.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### 2. Login User
**POST** `/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "subscriptionStatus": "free"
  }
}
```

### 3. Verify OTP
**POST** `/api/auth/verify-otp`

**Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Email verified successfully"
}
```

### 4. Forgot Password
**POST** `/api/auth/forgot-password`

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

### 5. Reset Password
**PUT** `/api/auth/reset-password/:resetToken`

**Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

### 6. Get Current User
**GET** `/api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "507f191e810c19729de860ea",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "https://...",
    "subscriptionStatus": "free",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Photo Processing Endpoints (To Be Implemented)

### 7. Upload Image
**POST** `/api/upload`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
image: <file>
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "abc123",
    "format": "jpg",
    "size": 1024000
  }
}
```

### 8. Remove Background
**POST** `/api/photo/remove-background`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "backgroundColor": "#ffffff"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Background removed successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "format": "png"
  }
}
```

### 9. Enhance Photo
**POST** `/api/photo/enhance`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "brightness": 10,
  "contrast": 5,
  "sharpness": 15
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Photo enhanced successfully",
  "data": {
    "url": "https://res.cloudinary.com/...",
    "settings": {
      "brightness": 10,
      "contrast": 5,
      "sharpness": 15
    }
  }
}
```

---

## Download Endpoints (To Be Implemented)

### 10. Download as JPG
**POST** `/api/download/jpg`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "quality": 90
}
```

**Response:** File download (JPG)

### 11. Download as PNG
**POST** `/api/download/png`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/..."
}
```

**Response:** File download (PNG)

### 12. Download as PDF
**POST** `/api/download/pdf`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/...",
  "copies": 4,
  "width": 35,
  "height": 45,
  "unit": "mm"
}
```

**Response:** File download (PDF)

---

## User Endpoints (To Be Implemented)

### 13. Get User Profile
**GET** `/api/user/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "name": "...",
    "email": "...",
    "avatar": "...",
    "subscriptionStatus": "free",
    "projectsCount": 10,
    "downloadsCount": 25
  }
}
```

### 14. Update Profile
**PUT** `/api/user/profile`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://..."
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": { ... }
}
```

### 15. Get User Projects
**GET** `/api/user/projects`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "projects": [ ... ],
    "total": 25,
    "page": 1,
    "pages": 3
  }
}
```

---

## Admin Endpoints (To Be Implemented)

### 16. Get All Users
**GET** `/api/admin/users`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional)
- `limit` (optional)
- `role` (optional): Filter by role

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "users": [ ... ],
    "total": 100,
    "page": 1,
    "pages": 10
  }
}
```

### 17. Get Analytics
**GET** `/api/admin/analytics`

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": {
    "totalUsers": 1000,
    "totalProjects": 5000,
    "totalDownloads": 15000,
    "totalRevenue": 9999.99,
    "activeSubscriptions": 150
  }
}
```

---

## Error Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Authentication endpoints:** 10 requests per 15 minutes
- **Photo processing:** 30 requests per hour (Free), Unlimited (Pro)
- **Downloads:** 50 requests per hour (Free), Unlimited (Pro)

---

## File Upload Limits

- **Max file size:** 10 MB
- **Allowed formats:** JPG, JPEG, PNG
- **Max dimensions:** 4000x4000 pixels
- **Min dimensions:** 600x600 pixels

---

## Notes

1. All timestamps are in ISO 8601 format
2. Passwords must be at least 6 characters
3. OTP expires in 10 minutes
4. Reset tokens expire in 10 minutes
5. JWT tokens expire in 7 days (configurable)
6. Photos are automatically deleted after 24 hours

---

**For support, contact: support@aipassportpro.com**
