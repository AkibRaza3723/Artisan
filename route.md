# Artisans' Canvas — API Route Reference

All routes are prefixed with the backend base URL (e.g. `http://localhost:8000`).

---

## User Routes — `/api/users`

### Public (No Auth Required)

| Method | Endpoint | Description | Body / Params |
|--------|----------|-------------|---------------|
| `POST` | `/api/users/register` | Create a new artist account | `{ fullName, username, email, password }` |
| `POST` | `/api/users/login` | Authenticate and receive JWT tokens | `{ email, password }` |
| `POST` | `/api/users/refresh-token` | Get a new access token using refresh token | Cookie `refreshToken` OR `{ refreshToken }` in body |
| `GET` | `/api/users/portfolio/:username` | Fetch public profile by username slug | URL param `:username` |

---

### Protected (Requires `Authorization: Bearer <accessToken>` header)

| Method | Endpoint | Description | Body / File |
|--------|----------|-------------|-------------|
| `POST` | `/api/users/logout` | Invalidate refresh token and clear cookies | — |
| `GET` | `/api/users/me` | Get the currently authenticated user | — |
| `PATCH` | `/api/users/profile` | Update profile fields | `{ fullName?, bio?, visionStatement?, contactInfo?, education?, experience? }` |
| `PATCH` | `/api/users/avatar` | Replace profile avatar image | `multipart/form-data` — field name: `avatar` |

---

## Post Routes — `/api/posts`

### Public (No Auth Required)

| Method | Endpoint | Description | Params / Query |
|--------|----------|-------------|----------------|
| `GET` | `/api/posts/public/:username` | Fetch all posts for a public portfolio | `:username`, `?page=1&limit=12` |

---

### Protected (Requires `Authorization: Bearer <accessToken>` header)

| Method | Endpoint | Description | Body / File |
|--------|----------|-------------|-------------|
| `POST` | `/api/posts/` | Upload a new artwork post | `multipart/form-data` — fields: `image` (file), `title`, `caption?`, `tags?` |
| `GET` | `/api/posts/` | Get the authenticated user's posts (paginated) | `?page=1&limit=12` |
| `PATCH` | `/api/posts/:postId` | Update a post's title, caption, or tags | `{ title?, caption?, tags? }` |
| `DELETE` | `/api/posts/:postId` | Delete a post and remove its image from Cloudinary | URL param `:postId` |

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check — returns `{ status: "ok", timestamp }` |

---

## Standard Response Shape

Every response (success or error) follows this shape:

```json
// Success
{
  "statusCode": 200,
  "data": { ... },
  "message": "Description of result",
  "success": true
}

// Error
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": []
}
```

---

## Auth Token Usage

### Where to get tokens
- **Login** response → `data.accessToken` + `data.refreshToken`
- Both are also set as `httpOnly` cookies automatically

### How to send (protected routes)
```
Authorization: Bearer <accessToken>
```

### Token Expiry
| Token | Default Expiry |
|-------|---------------|
| Access Token | 1 day (`JWT_EXPIRY` in `.env`) |
| Refresh Token | 10 days (`REFRESH_TOKEN_EXPIRY` in `.env`) |

### Refresh Flow
When `401` is received → `POST /api/users/refresh-token` → get new `accessToken` → retry original request

---

## Multipart Upload Notes

For **POST `/api/posts/`** — send as `multipart/form-data`:
- `image` — the image file (required)
- `title` — string (required)
- `caption` — string (optional, max 300 chars)
- `tags` — comma-separated string OR JSON array string (optional)

For **PATCH `/api/users/avatar`** — send as `multipart/form-data`:
- `avatar` — the image file (required)

Accepted image types: `jpeg`, `jpg`, `png`, `webp`, `gif` (max 10 MB)
