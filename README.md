# DevPulse Issue Tracker API

A RESTful API built with Node.js, Express, TypeScript, and PostgreSQL for managing issues with authentication and role-based authorization.

---

## Live URL

- Backend API: https://your-deployed-url.vercel.app
- Github repo Link :https://github.com/DeveloperDishan/assignment-l2
- Video Link:https://docs.google.com/document/d/1zo5yjKUrwXaEyQBTOhuJu32eh6YyEsod_P0nm7yQLz8/edit?tab=t.0

## Features

- User Registration & Login (JWT Authentication)
- Role-based Access Control (Maintainer / Contributor)
- Create Issue
- Get All Issues (filter + sort support)
- Get Single Issue
- Update Issue (permission-based)
- Delete Issue (maintainer only)
- Input validation with database constraints

---

## Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- JWT (Authentication)
- bcrypt (Password hashing)

---

## Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── issues/
├── middleware/
├── config/
├── db/
└── app.ts
```

---

## Authentication

All protected routes require JWT token.

### Header Format:

```
Authorization: <JWT_TOKEN>
```

---

## Roles & Permissions

### Contributor
- Create issue
- View issues
- Update own issue (only if status = open)
- Cannot delete issue

### Maintainer
- Full access (create, update, delete any issue)

---

## API Endpoints

### Auth

- POST `/api/auth/login`

### Users

- POST `/api/auth/signup`

### Issues

- POST `/api/issues` (Protected)
- GET `/api/issues?sort=newest`(All Issues)
- GET `/api/issues/:id`
- PATCH `/api/issues/:id` (Protected + Role check)
- DELETE `/api/issues/:id` (Maintainer only)

---

## Issue Schema Rules

- `title` → required
- `description` → minimum 20 characters
- `type` → `bug | feature_request`
- `status` → `open | in_progress | resolved`
- `reporter_id` → from JWT token

---

## Environment Variables

Create `.env` file:

```
PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
```

---

## Installation & Run

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

---

## Author

Built by Dishanur Rahman ✌️