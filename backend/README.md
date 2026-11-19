# Blogverse Backend – Node.js & Express RESTful API

A secure, scalable RESTful API backend for the **Blogverse** modern responsive blog application, built using **Node.js, Express.js, MongoDB, Mongoose, and JSON Web Tokens (JWT)**.

---

## 🏗️ Architecture & Directory Structure

```text
backend/
│
├── config/
│   ├── db.js                 # MongoDB connection logic (Local, Atlas, or embedded fallback)
│   └── seed.js               # Auto-seeder for demo users and initial sample articles
│
├── controllers/
│   ├── authController.js     # User registration, login, and profile logic
│   └── blogController.js     # Blog CRUD, status toggling, likes, and filtering logic
│
├── middleware/
│   └── authMiddleware.js     # JWT verification and route protection middleware
│
├── models/
│   ├── User.js               # Mongoose User model with bcrypt password hashing
│   └── Blog.js               # Mongoose Blog model with author reference and auto-slug/readTime
│
├── routes/
│   ├── authRoutes.js         # /api/auth routes
│   └── blogRoutes.js         # /api/blogs routes
│
├── .env                      # Environment configuration
├── .gitignore                # Ignored files (node_modules, .env, logs)
├── package.json              # Project dependencies and npm scripts
├── server.js                 # Main Express server entry point
├── test-backend.js           # Automated test suite for all 15 API scenarios
└── README.md                 # Backend documentation and API guide
```

---

## ⚙️ Environment Configuration (`.env`)

Create or edit `.env` in the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/blogverse
JWT_SECRET=blogverse_super_secret_jwt_key_2026_dev
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:8080
```

- **`PORT`**: Port number for Express server (default: `5000`).
- **`MONGO_URI`**: Connection string for your MongoDB Atlas cluster or local instance.
- **`JWT_SECRET`**: Private key used to sign and verify JSON Web Tokens.
- **`JWT_EXPIRE`**: Token validity period (e.g., `7d` or `24h`).
- **`CLIENT_URL`**: Allowed origin for frontend client CORS requests (`http://localhost:8080`).

---

## 🍃 MongoDB Atlas Setup Instructions

To connect your application to a free, cloud-hosted MongoDB Atlas database:

1. **Create an Atlas Account & Cluster**:
   - Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
   - Click **"Create a Deployment"** and select the free **M0 (Shared)** tier.
   - Choose your preferred cloud provider and region (e.g., AWS / Mumbai or N. Virginia).

2. **Configure Database Access (User Credentials)**:
   - Navigate to **Security > Database Access** in the Atlas sidebar.
   - Click **"Add New Database User"**.
   - Choose **Password** authentication, specify a username (e.g., `db_user`) and a secure password.
   - Assign the **"Read and write to any database"** built-in role.

3. **Configure Network Access (IP Whitelist)**:
   - Navigate to **Security > Network Access**.
   - Click **"Add IP Address"**.
   - Select **"Allow Access from Anywhere"** (`0.0.0.0/0`) for development, or add your current public IP address.
   - Confirm and save.

4. **Obtain Connection String**:
   - Go to **Database > Clusters** and click **"Connect"**.
   - Select **"Drivers"** (Node.js).
   - Copy the SRV connection URI:
     ```text
     mongodb+srv://<username>:<password>@<cluster-domain>/blogverse?retryWrites=true&w=majority
     ```

5. **Configure `backend/.env`**:
   - Paste the connection string into `backend/.env` under `MONGO_URI`, replacing `<username>` and `<password>` with your database user credentials.
   - The backend validates the connection on boot and logs:
     `✅ MongoDB Atlas Connected: <host>`
     `📁 Database Name: blogverse`

---

## 📡 REST API Reference

### 🔐 Authentication Endpoints (`/api/auth`)

#### 1. Register User
- **Method**: `POST`
- **URL**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully! Welcome to Blogverse.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "673b5a8...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "Author",
      "avatar": "JD"
    }
  }
  ```

#### 2. User Login
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "demo@example.com",
    "password": "password123"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Welcome back, Alex Rivera!",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "673b5a8...",
      "name": "Alex Rivera",
      "email": "demo@example.com",
      "role": "Author & Senior Engineer",
      "avatar": "AR"
    }
  }
  ```

#### 3. Get Authenticated User Profile
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Access**: Private (Requires `Authorization: Bearer <token>`)

---

### 📝 Blog Endpoints (`/api/blogs`)

#### 1. Get All Published Blogs
- **Method**: `GET`
- **URL**: `/api/blogs?category=Technology&search=frontend`
- **Access**: Public
- **Query Params**:
  - `category` *(optional)*: Filter by category (`Technology`, `Design`, `Coding`, `Lifestyle`, etc.)
  - `search` *(optional)*: Case-insensitive search keyword across title, excerpt, and content.
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "count": 4,
    "blogs": [ ... ]
  }
  ```

#### 2. Get Single Blog by ID
- **Method**: `GET`
- **URL**: `/api/blogs/:id`
- **Access**: Public
- **Behavior**: Returns populated author details and atomically increments view count.

#### 3. Get Logged-in User's Blogs (Dashboard)
- **Method**: `GET`
- **URL**: `/api/blogs/user/my-blogs`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Behavior**: Returns all articles (both `published` and `draft`) authored by the token holder.

#### 4. Create New Blog Post
- **Method**: `POST`
- **URL**: `/api/blogs`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Request Body**:
  ```json
  {
    "title": "Mastering Fullstack Web Development",
    "category": "Technology",
    "content": "<p>Rich HTML or markdown content goes here...</p>",
    "excerpt": "Brief summary...",
    "image": "https://images.unsplash.com/...",
    "status": "published"
  }
  ```
- **Response** (`201 Created`)

#### 5. Update Blog Post
- **Method**: `PUT`
- **URL**: `/api/blogs/:id`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Security**: Verifies that the requesting user is the original author of the blog post. Returns `403 Forbidden` if another user attempts to modify it.

#### 6. Delete Blog Post
- **Method**: `DELETE`
- **URL**: `/api/blogs/:id`
- **Access**: Private (Requires `Authorization: Bearer <token>`)
- **Security**: Author verification check; permanently removes post from database.

#### 7. Toggle Blog Like
- **Method**: `PATCH`
- **URL**: `/api/blogs/:id/like`
- **Access**: Public
- **Body**: `{ "increment": true }`

---

## 🛡️ Security Implementation

1. **Password Hashing**: Passwords hashed with `bcryptjs` using a salt work factor of 10. Passwords are never stored in plaintext and excluded from default queries via Mongoose `select: false`.
2. **JWT Authentication**: Protected routes require valid JSON Web Token sent in the HTTP `Authorization: Bearer <token>` header.
3. **Resource Ownership Authorization**: Users cannot edit or delete posts created by other authors.
4. **CORS Policy**: Configured to allow cross-origin requests from the frontend client.
5. **Input Validation**: Strict validation for emails, password length, and required blog fields with clear JSON error responses.

---

## 🚀 Running the Backend

### Prerequisites
- Node.js (v18+)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
npm start
# Or for live auto-reload during development:
npm run dev
```

Server output:
```text
======================================================
🚀 Blogverse Backend Server running on port 5000
📡 Base API URL: http://localhost:5000/api
🩺 Health Check: http://localhost:5000/api/health
======================================================
```

### 3. Run Automated API Tests
```bash
node test-backend.js
```
Expected output:
```text
=============================================
📊 TEST SUMMARY: 20 Passed, 0 Failed
=============================================
```

---

## 🔑 Pre-Seeded Demo Account

| Email | Password | Role |
|---|---|---|
| `demo@example.com` | `password123` | Author & Senior Engineer (Alex Rivera) |
