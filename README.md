# Gunuo — Luxury Furniture E-Commerce Platform

A full-stack e-commerce demo built to showcase a luxury furniture retail experience and to serve as an integration testbed for [SupportNest](https://github.com/) (an AI customer support widget). The project consists of a TypeScript/Express/MongoDB API and a React + Vite storefront.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Features](#features)
- [Security Notes](#security-notes)

---

## Overview

Gunuo is a dummy luxury furniture brand used to demonstrate a production-style full-stack architecture:

- A REST API with product catalog, order management (with MongoDB transactions for stock integrity), dual-mode authentication (session JWT + long-lived API keys), and auto-generated Swagger documentation.
- A React storefront with browsing, cart, checkout, an authenticated profile/orders dashboard, and a "Developer API Studio" for minting API keys.
- An embedded SupportNest AI chat widget for live customer support.

## Tech Stack

**Backend**
- Node.js, Express 5, TypeScript
- MongoDB + Mongoose 9
- JWT (`jsonwebtoken`) + bcrypt-hashed API keys for dual authentication
- `express-validator` for request validation
- `swagger-ui-express` for auto-generated API docs
- `tsx` for dev, `tsc` for production builds

**Frontend**
- React 19 + Vite
- React Router v7
- Tailwind CSS v4
- Framer Motion for animation
- `lucide-react` for icons
- Cart persistence via `localStorage`

## Project Structure

```
backend/
├── src/
│   ├── config/          # db.ts, swagger.ts
│   ├── middlewares/      # auth, admin, validate, error
│   ├── models/           # User, Product, Order (Mongoose schemas)
│   ├── modules/
│   │   ├── auth/         # routes, controller, service, validator
│   │   ├── products/
│   │   └── orders/
│   ├── utils/             # apiKey.ts (key generation/verification)
│   └── app.ts
└── package.json

frontend/
├── src/
│   ├── components/        # Navbar, Footer, ProtectedRoute, common/Button, common/Input
│   ├── context/            # AuthContext, CartContext
│   ├── features/
│   │   ├── home/, products/, Cart/, auth/, profile/, about/
│   ├── hooks/               # useLocalStorage
│   ├── utils/                # formatters
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Getting Started

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run dev             # runs via tsx on http://localhost:5000
```

Build for production:

```bash
npm run build
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev   # http://localhost:5173 by default
```

Update the `API_BASE` constant in the frontend's page/context files (or refactor to an env variable — see [Security Notes](#security-notes)) to point at your backend deployment.

## Environment Variables

Backend `.env`:

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign session JWTs |
| `JWT_EXPIRES_IN` | No | JWT expiry (default `7d`) |
| `COOKIE_SECRET` | Yes | Secret for signed cookies |
| `PORT` | No | Server port (default `5000`) |
| `CLIENT_URL` | No | Additional allowed CORS origin |
| `NODE_ENV` | No | `development` enables stack traces in error responses and disables `secure` cookies |
| `SUPPORTNEST_API_KEY` | Yes (if widget enabled) | SupportNest SDK key — see [Security Notes](#security-notes) |

## API Overview

Interactive Swagger documentation is available once the server is running:

- UI: `GET /api/docs`
- Raw OpenAPI JSON: `GET /api/docs.json`

Key route groups:

| Resource | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST/GET /api/auth/api-keys`, `DELETE /api/auth/api-keys/:prefix` |
| Products | `GET /api/products`, `GET /api/products/:id`, `GET /api/products/stats` (admin), `POST /api/products` (admin), `PUT /api/products/:id` (admin), `DELETE /api/products/:id` (admin, soft or `?permanent=true` hard delete) |
| Orders | `POST /api/orders`, `GET /api/orders/user`, `GET /api/orders/:id`, `DELETE /api/orders/:id` (cancel), `GET /api/orders/admin` (admin), `GET /api/orders/stats` (admin), `PUT /api/orders/:id` (admin status update) |

## Authentication

The API supports **two parallel authentication strategies**, checked in this order by the `protect` middleware:

1. **API Key** (`x-api-key` header) — long-lived keys prefixed `lxr_`, bcrypt-hashed at rest, looked up via an indexed prefix for fast verification, with configurable expiry and a 10-key-per-user cap.
2. **Session JWT** — issued at login/register, sent via either an `Authorization: Bearer <token>` header or an `httpOnly` cookie, and re-validated against the database on every request.

Two roles are supported: `customer` and `admin`. Admin-only routes are gated by a separate `requireAdmin` middleware chained after `protect`.

## Features

- **Order placement with stock integrity** — order creation and stock decrements happen inside a single MongoDB transaction, with full rollback on failure.
- **Status transition guard** — order status updates follow a strict state machine (`Pending → Processing → Shipped → Delivered`, with `Cancelled` available from non-terminal states) to prevent invalid transitions.
- **Stock restoration on cancellation** — cancelling a non-shipped order automatically restores inventory, also inside a transaction.
- **Soft delete for products** — products are deactivated (`isActive: false`) by default to preserve referential integrity with historical orders; a `?permanent=true` flag performs a hard delete.
- **Developer API Key Studio** — authenticated users can mint, list, and revoke their own API keys directly from the frontend profile page.
- **Embedded AI support widget** — the storefront loads the SupportNest widget script and initializes it with a per-session customer token fetched from the backend.
