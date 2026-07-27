# IEEE Student Branch Backend

Production-style Express API for the IEEE Student Branch website CMS.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in MongoDB Atlas, JWT, Cloudinary, and SMTP values.

3. Seed the first admin:

```bash
npm run seed
```

4. Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:5000/api/v1`.

## Core Routes

| Module | Public | Admin |
| --- | --- | --- |
| Auth | `POST /auth/login` | `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password` |
| Events | `GET /events`, `GET /events/featured`, `GET /events/:identifier` | `GET /events/admin`, `POST /events`, `PUT /events/:id`, `DELETE /events/:id` |
| Blogs | `GET /blogs`, `GET /blogs/featured`, `GET /blogs/:identifier` | `GET /blogs/admin`, `POST /blogs`, `PATCH /blogs/:id/publish`, `PUT /blogs/:id`, `DELETE /blogs/:id` |
| Gallery | `GET /gallery` | `POST /gallery`, `PUT /gallery/:id`, `DELETE /gallery/:id` |
| Members | `GET /members`, `GET /members/:id` | `POST /members`, `PUT /members/:id`, `DELETE /members/:id` |
| Announcements | `GET /announcements` | `GET /announcements/admin`, `POST /announcements`, `PATCH /announcements/:id/pin`, `PUT /announcements/:id`, `DELETE /announcements/:id` |
| Contact | `POST /contact` | `GET /contact`, `PATCH /contact/:id/read`, `DELETE /contact/:id` |
| Dashboard | None | `GET /dashboard/overview`, `GET /dashboard/search?q=term` |

Admin endpoints require `Authorization: Bearer <token>` or the secure `jwt` cookie set by login.
