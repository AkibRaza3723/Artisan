# Backend Workflow — Artisans' Canvas

## Overview

This document explains the architecture of the backend, how every piece connects, and the data flow from an incoming HTTP request all the way to the database and back.

---

## Technology Stack

| Package | Role |
|---|---|
| `express` | HTTP server & routing |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT access & refresh tokens |
| `cloudinary` | Cloud image hosting |
| `multer` | Multipart form parsing + temp disk storage |
| `cors` | Cross-origin header management |
| `cookie-parser` | Parse `accessToken` / `refreshToken` cookies |
| `dotenv` | Environment variable loading |

---

## Folder Structure Explained

```
backend/
├── src/
│   ├── DB/
│   │   └── index.js          ← Mongoose.connect() wrapped in async function
│   ├── Middleware/
│   │   ├── auth.middleware.js ← verifyJWT — extracts & validates JWT
│   │   └── multer.middleware.js ← diskStorage → public/temp/
│   ├── User/
│   │   ├── user.model.js     ← Schema with bcrypt hook + JWT generators
│   │   ├── user.controller.js← All user logic (register/login/profile)
│   │   └── user.routes.js    ← Mounts controllers on Express Router
│   ├── posts/
│   │   ├── post.model.js     ← Schema with owner ref + Cloudinary fields
│   │   ├── post.controller.js← CRUD with Cloudinary upload/delete
│   │   └── post.routes.js    ← Mounts controllers on Express Router
│   ├── Utils/
│   │   ├── asyncHandler.js   ← HOF: Promise.resolve().catch(next)
│   │   ├── ApiError.js       ← Custom Error extending Error class
│   │   ├── ApiResponse.js    ← Standard { statusCode, data, message }
│   │   └── cloudinary.js     ← upload + delete helpers
│   ├── app.js                ← Express config: CORS, body parsing, routes
│   ├── constant.js           ← DB_NAME, PORT
│   └── server.js             ← Entry point: dotenv → DB connect → listen
├── public/
│   └── temp/                 ← Multer writes files here before Cloudinary
│       └── .gitkeep
├── .env                      ← Secrets (git-ignored)
└── .env.example              ← Documented placeholder for team members
```

---

## Boot Sequence (server.js)

```
dotenv.config()
    ↓
connectDB()          ← src/DB/index.js — mongoose.connect()
    ↓
app.listen(PORT)     ← src/app.js — Express server starts
```

The IIFE (Immediately Invoked Function Expression) in `server.js` ensures Express only starts listening AFTER MongoDB is connected. If the DB connection fails, `process.exit(1)` is called so the process manager (nodemon / PM2) can restart it.

---

## Request Lifecycle

```
Client
  │
  ▼
CORS middleware         ← Checks Origin header against CORS_ORIGIN env
  │
  ▼
Body / Cookie parsers   ← express.json(), urlencoded(), cookieParser()
  │
  ▼
Router (app.js)
  │  /api/users  →  user.routes.js
  │  /api/posts  →  post.routes.js
  ▼
[Optional] verifyJWT    ← Extracts token → jwt.verify() → attaches req.user
  │
  ▼
[Optional] upload       ← multer writes file to public/temp/
  │
  ▼
Controller Function
  │  wrapped in asyncHandler → catches any thrown ApiError
  ▼
Mongoose / Cloudinary
  │
  ▼
ApiResponse             ← { statusCode, data, message, success }
  │
  ▼
Client
```

---

## Authentication Flow

### Register
1. Client `POST /api/users/register` with `{ username, email, password, fullName }`
2. Controller checks for duplicate username/email
3. `User.create()` — bcrypt `pre("save")` hook hashes the password automatically
4. Returns the new user object (password & refreshToken excluded via `.select()`)

### Login
1. Client `POST /api/users/login` with `{ email, password }`
2. Controller finds the user, calls `user.isPasswordCorrect(password)` (bcrypt.compare)
3. Calls `generateTokens(userId)`:
   - Calls `user.generateAccessToken()` → signs JWT with `JWT_SECRET`, expiry `JWT_EXPIRY`
   - Calls `user.generateRefreshToken()` → signs JWT with `REFRESH_TOKEN_SECRET`, expiry `REFRESH_TOKEN_EXPIRY`
   - Saves `refreshToken` field on the user document
4. Sets both tokens as `httpOnly` cookies AND returns them in the JSON body (client can use either)

### Protected Request
1. `verifyJWT` middleware runs before the controller
2. Reads token from `req.cookies.accessToken` OR `Authorization: Bearer <token>` header
3. `jwt.verify(token, JWT_SECRET)` — throws `ApiError(401)` if invalid/expired
4. Fetches the user from DB to confirm they still exist
5. Attaches `req.user` for use in the controller

### Token Refresh
1. Client `POST /api/users/refresh-token` with the refresh token (cookie or body)
2. Controller verifies it against `REFRESH_TOKEN_SECRET` AND checks it matches what's stored in DB (rotation security)
3. Issues a new access token + new refresh token, updates DB

---

## File Upload Flow (Cloudinary + Multer)

```
Client sends multipart/form-data
        │
        ▼
multer.middleware.js       ← Saves file to public/temp/<fieldname>-<timestamp>.<ext>
        │
        ▼
Controller receives req.file.path
        │
        ▼
uploadOnCloudinary(localFilePath)
  ├── cloudinary.uploader.upload(path, { folder: "artisans_canvas" })
  ├── fs.unlinkSync(localFilePath)   ← Always delete temp file (success or failure)
  └── Returns { url, public_id, ... }
        │
        ▼
Store { imageUrl: url, imagePublicId: public_id } in MongoDB Post document
```

### Deletion Flow
```
Client DELETE /api/posts/:postId
        │
        ▼
verifyJWT → ownership check (post.owner === req.user._id)
        │
        ▼
deleteFromCloudinary(post.imagePublicId)   ← Removes from Cloudinary
        │
        ▼
Post.findByIdAndDelete(postId)             ← Removes from MongoDB
```

---

## Error Handling

All controller functions are wrapped with `asyncHandler`:
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

When a controller throws an `ApiError` or any other error, it propagates to the **global error handler** in `app.js`:
```js
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    errors: err.errors || [],
  });
});
```

---

## Import Pattern (ES Modules)

All files use `"type": "module"` and `import/export` syntax:
```js
// Correct — always include the .js extension in relative imports
import { User } from "../User/user.model.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { upload } from "../Middleware/multer.middleware.js";
```

---

## How to Run

```bash
# 1. Fill in backend/.env
# 2. From the backend/ directory:
npm run dev     # Development (node --watch auto-restarts on file changes)
npm start       # Production
```
