# Artisans' Canvas — Full System Workflow

This document explains how the entire application works end-to-end, from the
browser to the database and back.

---

## Project Structure

```
artisim/
├── frontend/          React + Tailwind (Vite) — the user interface
├── backend/           Node.js + Express API — business logic & data
├── route.md           API route reference (this level)
└── workflow.md        This file — end-to-end system overview
```

---

## Technology Overview

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | Component-based SPA |
| Styling | Tailwind CSS v3 | Brand-consistent utility styling |
| HTTP Client | Axios | API calls with interceptors |
| Routing | React Router v6 | Client-side navigation |
| State | React Context | Auth state (user, token) |
| Backend | Node.js + Express | REST API |
| Database | MongoDB + Mongoose | Flexible document storage |
| Auth | JWT (access + refresh) | Stateless authentication |
| Media | Cloudinary + Multer | Cloud image storage |
| Modules | ES Modules (import/export) | Modern JS syntax throughout |

---

## Color Palette Used

| Name | Hex | Usage |
|------|-----|-------|
| Golden Sandlewood | `#857861` | Accents, borders, highlights |
| Almond Light | `#E7D4BB` | Primary text on dark backgrounds |
| Plum Wine | `#48252F` | Cards, buttons, dark tones |
| Carbon Powder | `#101211` | Page background |

---

## How the Two Apps Communicate

```
Browser (React + Vite)
       │
       │  HTTP requests via Axios
       │  Base URL: http://localhost:8000/api
       │  JWT sent as: Authorization: Bearer <token>
       │
       ▼
Backend (Express on port 8000)
       │
       │  Mongoose queries
       │  MongoDB Atlas / Local MongoDB
       │
       ▼
MongoDB (Database)

       │  Cloudinary SDK calls (image upload/delete)
       ▼
Cloudinary (CDN for images)
```

---

## Authentication Workflow

### Registration
```
User fills Register form
      │
      ▼
POST /api/users/register
      │  { fullName, username, email, password }
      ▼
Backend validates → bcrypt hashes password → User created in MongoDB
      │
      ▼
201 Created → user object returned (no password)
      │
      ▼
Frontend redirects to /login
```

### Login
```
User fills Login form
      │
      ▼
POST /api/users/login
      │  { email, password }
      ▼
Backend: findOne({ email }) → bcrypt.compare(password, hash)
      │
      ▼
generateAccessToken()  → JWT signed with JWT_SECRET, expires in JWT_EXPIRY
generateRefreshToken() → JWT signed with REFRESH_TOKEN_SECRET, expires in REFRESH_TOKEN_EXPIRY
refreshToken saved to DB
      │
      ▼
Response: { user, accessToken, refreshToken }
Cookies: accessToken (httpOnly), refreshToken (httpOnly)
      │
      ▼
Frontend: localStorage.setItem("accessToken", token)
Auth context: setUser(user)
Redirect → /dashboard
```

### Protected Request
```
Component calls API (e.g. GET /api/posts)
      │
      ▼
Axios request interceptor adds: Authorization: Bearer <localStorage token>
      │
      ▼
Backend: verifyJWT middleware runs
  ├── Extracts token from header or cookie
  ├── jwt.verify(token, JWT_SECRET)
  └── User.findById(decoded._id) → attaches req.user
      │
      ▼
Controller runs with req.user available
```

### Token Refresh (Auto)
```
API returns 401
      │
      ▼
Axios response interceptor catches it
      │
      ▼
POST /api/users/refresh-token (sends cookie or stored refreshToken)
      │
      ▼
Backend verifies refresh token, checks it matches DB
Issues new access + refresh tokens
      │
      ▼
Frontend stores new accessToken, retries original request
```

---

## Artwork Upload Flow

```
User selects image in WorkUploadModal
      │
      ▼
FormData constructed:
  - image: File object
  - title, caption, tags: strings
      │
      ▼
POST /api/posts (multipart/form-data)
      │
      ▼
multer.middleware.js writes file to backend/public/temp/
req.file.path = "/absolute/path/backend/public/temp/image-12345.jpg"
      │
      ▼
post.controller.js receives req.file.path
      │
      ▼
uploadOnCloudinary(localFilePath):
  1. cloudinary.uploader.upload(path, { folder: "artisans_canvas" })
  2. fs.unlinkSync(localFilePath)  ← temp file deleted
  3. Returns { url, public_id, ... }
      │
      ▼
Post.create({
  title, caption, tags,
  imageUrl: response.url,
  imagePublicId: response.public_id,
  owner: req.user._id
})
      │
      ▼
201 Created → post object returned to frontend
      │
      ▼
Frontend closes modal, refreshes artwork grid
```

## Artwork Deletion Flow

```
User clicks Delete → confirms → DELETE /api/posts/:postId
      │
      ▼
verifyJWT → ownership check (post.owner === req.user._id)
      │
      ▼
deleteFromCloudinary(post.imagePublicId)
      │
      ▼
Post.findByIdAndDelete(postId)
      │
      ▼
200 OK → frontend removes card from grid
```

---

## Frontend Routing

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | Redirect | — | Redirects to `/dashboard` |
| `/login` | Login | Public | Sign-in form |
| `/register` | Register | Public | Account creation |
| `/dashboard` | Dashboard | **Private** | Artist's management panel |
| `/portfolio/:username` | PublicPortfolio | Public | Read-only portfolio viewer |

`ProtectedRoute` wraps private routes. If no valid token → redirect to `/login`.

---

## Frontend State Management

```
AuthContext (React Context)
  ├── user: { _id, username, fullName, avatar, bio, ... }
  ├── isAuthenticated: boolean
  ├── isLoading: boolean
  ├── login(credentials) → calls API, stores token, sets user
  ├── logout() → calls API, clears token, resets user
  ├── register(data) → calls API
  └── updateUser(partial) → merges updated fields into user state

Axios (services/api.js)
  ├── Request interceptor: attaches JWT from localStorage
  └── Response interceptor: catches 401, auto-refreshes token
```

---

## Running the Project

### 1. Backend
```bash
cd backend
# Fill in .env with your MongoDB URI, JWT secrets, and Cloudinary credentials
npm run dev        # Starts with node --watch (auto-restart on changes)
# Server: http://localhost:8000
```

### 2. Frontend
```bash
cd frontend
# .env already has VITE_API_BASE_URL=http://localhost:8000/api
npm run dev        # Starts Vite dev server
# App: http://localhost:5173
```

### 3. First Use
1. Open `http://localhost:5173/register`
2. Create an account
3. Log in → you're taken to the Dashboard
4. Upload artwork, edit profile
5. Share your portfolio link: `http://localhost:5173/portfolio/<your-username>`
