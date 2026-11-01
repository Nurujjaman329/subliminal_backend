# Souliminal Backend (NestJS)

Modular NestJS API for the Souliminal Flutter app and future Admin UI.

## Stack

- NestJS (modular feature modules)
- MongoDB + Mongoose
- JWT auth (email + password)
- Local file serving via `/uploads`

## Project layout

```
src/
  common/           # roles, ownership enums, decorators
  modules/
    auth/
    users/
    boards/
    board-images/
    media/
    flash-settings/
    health/
uploads/
```

## Setup

1. Install MongoDB locally and ensure it is running.
2. Copy env:

```bash
cp .env.example .env
```

3. Install & run:

```bash
npm install
npm run start:dev
```

API base: `http://localhost:3000/api`  
Health: `GET /api/health`

## MVP endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/register` | no | Register user |
| POST | `/api/auth/login` | no | Login → JWT |
| GET | `/api/users/me` | JWT | Current profile |
| GET | `/api/users` | JWT + admin | List users |
| GET | `/api/boards` | JWT | System + my personal boards |
| POST | `/api/boards` | JWT | Create personal board |
| PATCH | `/api/boards/:id` | JWT | Update own personal board |
| DELETE | `/api/boards/:id` | JWT | Delete own personal board |
| GET | `/api/boards/:boardId/images` | JWT | Admin images + my images |
| POST | `/api/boards/:boardId/images` | JWT | Add my image (URL for now) |
| DELETE | `/api/board-images/:id` | JWT | Delete my image only |
| GET | `/api/media/meditation` | JWT | Active meditation image/video |
| GET | `/api/flash-settings` | JWT | Global flash options (auto-seeded) |

## Ownership rules (enforced in services)

- System boards cannot be deleted by users
- Admin images cannot be deleted by users
- Personal boards/images: owner only
- User images on system boards are private to that user

## Next steps

- Admin write APIs (system boards, meditation upload, flash settings edit)
- Multipart file upload to `uploads/`
- Seed script for 4 system boards
- React + Vite admin UI

Docs live in the Flutter repo: `subliminal/docs/`.
