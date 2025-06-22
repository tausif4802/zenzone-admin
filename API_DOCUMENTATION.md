# ZenZone Admin API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication. Include user credentials in the request body for auth endpoints.

## Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

---

## Authentication APIs

### 1. User Sign In

**Endpoint:** `POST /api/auth/signin`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "regular",
    "phone": "+1234567890",
    "address": "123 Main St",
    "lastWatched": "2024-01-01T00:00:00Z",
    "lastRead": "2024-01-01T00:00:00Z"
  }
}
```

**Error Codes:**

- `400` - Invalid request body
- `401` - Invalid email or password
- `500` - Server error

---

### 2. User Sign Up

**Endpoint:** `POST /api/auth/signup`

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}
```

**Required Fields:** `email`, `password`, `name`
**Optional Fields:** `phone`, `address`

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Doe",
    "phone": "+1234567890",
    "address": "456 Oak Ave"
  }
}
```

**Error Codes:**

- `400` - Invalid request body
- `409` - Email already registered
- `500` - Server error

---

## User Management APIs

### 3. Get All Users

**Endpoint:** `GET /api/users`

**Query Parameters:**

- `search` (optional) - Search term for users (searches in name and email)
- `role` (optional) - Filter by role: `admin` or `user`
- `status` (optional) - Filter by status: `regular` or `premium`

**Example:** `GET /api/users?search=john&role=user`

**Response:**

```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "status": "regular",
      "phone": "+1234567890",
      "address": "123 Main St",
      "lastWatched": "2024-01-01T00:00:00Z",
      "lastRead": "2024-01-01T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 4. Get User by ID

**Endpoint:** `GET /api/users/{id}`

**Path Parameters:**

- `id` - User ID (integer)

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "regular",
    "phone": "+1234567890",
    "address": "123 Main St",
    "lastWatched": "2024-01-01T00:00:00Z",
    "lastRead": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Codes:**

- `400` - Invalid user ID
- `404` - User not found
- `500` - Server error

---

### 5. Update User

**Endpoint:** `PUT /api/users/{id}`

**Path Parameters:**

- `id` - User ID (integer)

**Request Body:**

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+9876543210",
  "address": "789 Pine St",
  "role": "admin",
  "status": "premium"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "updated@example.com",
    "name": "Updated Name",
    "role": "admin",
    "status": "premium",
    "phone": "+9876543210",
    "address": "789 Pine St",
    "lastWatched": "2024-01-01T00:00:00Z",
    "lastRead": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Codes:**

- `400` - Invalid user ID or email already exists
- `404` - User not found
- `500` - Server error

---

### 6. Delete User

**Endpoint:** `DELETE /api/users/{id}`

**Path Parameters:**

- `id` - User ID (integer)

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Codes:**

- `400` - Invalid user ID
- `404` - User not found
- `500` - Server error

---

### 7. Update User Role (Admin Only)

**Endpoint:** `PUT /api/users`

**Request Body:**

```json
{
  "userId": 1,
  "role": "admin"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  }
}
```

---

### 8. Get User Profile

**Endpoint:** `GET /api/users/profile?userId={id}`

**Query Parameters:**

- `userId` - User ID (integer)

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "status": "regular",
    "phone": "+1234567890",
    "address": "123 Main St",
    "lastWatched": "2024-01-01T00:00:00Z",
    "lastRead": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 9. Update User Profile

**Endpoint:** `PUT /api/users/profile`

**Request Body:**

```json
{
  "userId": 1,
  "name": "Updated Name",
  "phone": "+9876543210",
  "address": "789 Pine St"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Updated Name",
    "phone": "+9876543210",
    "address": "789 Pine St"
  }
}
```

---

### 10. Update User Activity

**Endpoint:** `POST /api/users/profile`

**Request Body:**

```json
{
  "userId": 1,
  "type": "watched"
}
```

**Type Options:** `watched` or `read`

**Response:**

```json
{
  "success": true,
  "message": "Last watched updated successfully",
  "user": {
    "id": 1,
    "lastWatched": "2024-01-01T12:00:00Z"
  }
}
```

---

## Blog Management APIs

### 11. Get All Blogs

**Endpoint:** `GET /api/blogs`

**Query Parameters:**

- `featured` (optional) - Filter for featured blogs: `true` or `false`
- `deleted` (optional) - Include deleted blogs: `true` or `false`
- `search` (optional) - Search term for blogs (searches in title, description, and body)

**Example:** `GET /api/blogs?featured=true&search=meditation`

**Response:**

```json
{
  "success": true,
  "blogs": [
    {
      "id": 1,
      "title": "Meditation Guide",
      "description": "A comprehensive guide to meditation",
      "body": "Meditation is a practice...",
      "imageUrl": "https://example.com/image.jpg",
      "isFeatured": true,
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "deletedAt": null
    }
  ]
}
```

---

### 12. Create Blog

**Endpoint:** `POST /api/blogs`

**Request Body:**

```json
{
  "title": "New Blog Post",
  "description": "A brief description of the blog",
  "body": "The main content of the blog post...",
  "imageUrl": "https://example.com/image.jpg",
  "isFeatured": false
}
```

**Required Fields:** `title`, `description`, `body`
**Optional Fields:** `imageUrl`, `isFeatured`

**Response:**

```json
{
  "success": true,
  "blog": {
    "id": 2,
    "title": "New Blog Post",
    "description": "A brief description of the blog",
    "body": "The main content of the blog post...",
    "imageUrl": "https://example.com/image.jpg",
    "isFeatured": false,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "deletedAt": null
  }
}
```

---

### 13. Get Blog by ID

**Endpoint:** `GET /api/blogs/{id}`

**Path Parameters:**

- `id` - Blog ID (integer)

**Response:**

```json
{
  "success": true,
  "blog": {
    "id": 1,
    "title": "Meditation Guide",
    "description": "A comprehensive guide to meditation",
    "body": "Meditation is a practice...",
    "imageUrl": "https://example.com/image.jpg",
    "isFeatured": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "deletedAt": null
  }
}
```

**Error Codes:**

- `400` - Invalid blog ID
- `404` - Blog not found
- `500` - Server error

---

### 14. Update Blog

**Endpoint:** `PUT /api/blogs/{id}`

**Path Parameters:**

- `id` - Blog ID (integer)

**Request Body:**

```json
{
  "title": "Updated Blog Title",
  "description": "Updated description",
  "body": "Updated blog content...",
  "imageUrl": "https://example.com/new-image.jpg",
  "isFeatured": true
}
```

**Response:**

```json
{
  "success": true,
  "blog": {
    "id": 1,
    "title": "Updated Blog Title",
    "description": "Updated description",
    "body": "Updated blog content...",
    "imageUrl": "https://example.com/new-image.jpg",
    "isFeatured": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "deletedAt": null
  }
}
```

**Error Codes:**

- `400` - Invalid blog ID
- `404` - Blog not found
- `500` - Server error

---

### 15. Delete Blog (Soft Delete)

**Endpoint:** `DELETE /api/blogs/{id}`

**Path Parameters:**

- `id` - Blog ID (integer)

**Response:**

```json
{
  "success": true,
  "message": "Blog deleted successfully",
  "blog": {
    "id": 1,
    "title": "Meditation Guide",
    "isDeleted": true,
    "deletedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Error Codes:**

- `400` - Invalid blog ID
- `404` - Blog not found
- `500` - Server error

---

## Breathing Guide Management APIs

### 16. Get All Breathing Guides

**Endpoint:** `GET /api/breathing-guides`

**Query Parameters:**

- `featured` (optional) - Filter for featured guides: `true` or `false`
- `deleted` (optional) - Include deleted guides: `true` or `false`
- `search` (optional) - Search term for guides (searches in title, description, guide content, or serial number)

**Example:** `GET /api/breathing-guides?featured=true&search=box`

**Response:**

```json
{
  "success": true,
  "breathingGuides": [
    {
      "id": 1,
      "serial": 1,
      "title": "Box Breathing",
      "guide": "Inhale for 4 seconds, hold for 4 seconds...",
      "description": "A calming breathing technique",
      "audioUrl": "https://example.com/audio.mp3",
      "duration": 300,
      "isFeatured": true,
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "deletedAt": null
    }
  ]
}
```

---

### 17. Create Breathing Guide

**Endpoint:** `POST /api/breathing-guides`

**Request Body:**

```json
{
  "serial": 2,
  "title": "Deep Breathing",
  "guide": "Take a deep breath in through your nose...",
  "description": "A simple deep breathing exercise",
  "audioUrl": "https://example.com/deep-breathing.mp3",
  "duration": 180,
  "isFeatured": false
}
```

**Required Fields:** `serial`, `title`, `guide`, `description`
**Optional Fields:** `audioUrl`, `duration`, `isFeatured`

**Response:**

```json
{
  "success": true,
  "guide": {
    "id": 2,
    "serial": 2,
    "title": "Deep Breathing",
    "guide": "Take a deep breath in through your nose...",
    "description": "A simple deep breathing exercise",
    "audioUrl": "https://example.com/deep-breathing.mp3",
    "duration": 180,
    "isFeatured": false,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "deletedAt": null
  }
}
```

**Error Codes:**

- `400` - Invalid request body or duplicate serial number
- `500` - Server error

---

### 18. Get Breathing Guide by ID

**Endpoint:** `GET /api/breathing-guides/{id}`

**Path Parameters:**

- `id` - Guide ID (integer)

**Response:**

```json
{
  "success": true,
  "guide": {
    "id": 1,
    "serial": 1,
    "title": "Box Breathing",
    "guide": "Inhale for 4 seconds, hold for 4 seconds...",
    "description": "A calming breathing technique",
    "audioUrl": "https://example.com/audio.mp3",
    "duration": 300,
    "isFeatured": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "deletedAt": null
  }
}
```

**Error Codes:**

- `400` - Invalid guide ID
- `404` - Guide not found
- `500` - Server error

---

### 19. Update Breathing Guide

**Endpoint:** `PUT /api/breathing-guides/{id}`

**Path Parameters:**

- `id` - Guide ID (integer)

**Request Body:**

```json
{
  "serial": 1,
  "title": "Updated Box Breathing",
  "guide": "Updated breathing instructions...",
  "description": "Updated description",
  "audioUrl": "https://example.com/updated-audio.mp3",
  "duration": 240,
  "isFeatured": true
}
```

**Response:**

```json
{
  "success": true,
  "guide": {
    "id": 1,
    "serial": 1,
    "title": "Updated Box Breathing",
    "guide": "Updated breathing instructions...",
    "description": "Updated description",
    "audioUrl": "https://example.com/updated-audio.mp3",
    "duration": 240,
    "isFeatured": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "deletedAt": null
  }
}
```

**Error Codes:**

- `400` - Invalid guide ID or duplicate serial number
- `404` - Guide not found
- `500` - Server error

---

### 20. Delete Breathing Guide (Soft Delete)

**Endpoint:** `DELETE /api/breathing-guides/{id}`

**Path Parameters:**

- `id` - Guide ID (integer)

**Response:**

```json
{
  "success": true,
  "message": "Breathing guide deleted successfully",
  "guide": {
    "id": 1,
    "title": "Box Breathing",
    "isDeleted": true,
    "deletedAt": "2024-01-01T12:00:00Z"
  }
}
```

**Error Codes:**

- `400` - Invalid guide ID
- `404` - Guide not found
- `500` - Server error

---

## Utility APIs

### 21. Get API Documentation

**Endpoint:** `GET /api/docs`

**Response:**

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "ZenZone Admin API",
    "version": "1.0.0"
  },
  "paths": {
    // Swagger/OpenAPI specification
  }
}
```

---

### 22. Initialize Database

**Endpoint:** `POST /api/init-db`

**Response:**

```json
{
  "success": true,
  "message": "Database initialized successfully"
}
```

---

### 23. Test Database Connection

**Endpoint:** `GET /api/test-db`

**Response:**

```json
{
  "success": true,
  "message": "Database connection successful"
}
```

---

## Data Models

### User Model

```typescript
{
  id: number;
  email: string;
  passwordHash: string; // Not returned in responses
  name: string;
  role: 'admin' | 'user';
  status: 'regular' | 'premium';
  phone?: string;
  address?: string;
  lastWatched?: Date;
  lastRead?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Blog Model

```typescript
{
  id: number;
  title: string;
  description: string;
  body: string;
  imageUrl?: string;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### Breathing Guide Model

```typescript
{
  id: number;
  serial: number; // Unique serial number
  title: string;
  guide: string; // Instructions/guide text
  description: string;
  audioUrl?: string;
  duration?: number; // Duration in seconds
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

---

## Error Handling

All endpoints return consistent error responses:

**Validation Error (400):**

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

**Not Found Error (404):**

```json
{
  "success": false,
  "error": "Resource not found"
}
```

**Server Error (500):**

```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Additional error information"
}
```

---

## Authentication & Authorization

- **Public Endpoints:** `/api/auth/signin`, `/api/auth/signup`
- **Admin Only:** User role management endpoints
- **User Specific:** Profile management endpoints require valid user ID
- **General Access:** Blog and breathing guide endpoints (depending on implementation)

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## File Upload

File uploads are handled through the UploadThing integration. Audio files for breathing guides and images for blogs can be uploaded through the frontend interface.

---

## Notes

1. All timestamps are in ISO 8601 format with timezone information
2. Soft deletes are used for blogs and breathing guides (records are marked as deleted but not physically removed)
3. User passwords are hashed using bcrypt
4. Serial numbers for breathing guides must be unique
5. Email addresses must be unique across all users
6. The API uses Zod for request validation
7. All database operations use Drizzle ORM with PostgreSQL
