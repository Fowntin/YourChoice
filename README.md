# YourChoice — Modern E-Commerce Platform & Management Console

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248.svg?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Backend Host](https://img.shields.io/badge/Backend-Render-46E3B7.svg?logo=render&logoColor=white)](https://render.com/)
[![Frontend Host](https://img.shields.io/badge/Frontend-GitHub%20Pages-222222.svg?logo=githubpages&logoColor=white)](https://pages.github.com/)
[![CI / Tests](https://img.shields.io/badge/Tests-16%20Passed-success.svg)](backend/test/health.test.js)
[![Security](https://img.shields.io/badge/Security-OWASP%20Hardened-blueviolet.svg)](#security-architecture)

**A high-performance, mobile-responsive e-commerce platform and administrative console engineered with Ghanaian commerce localization, dual-environment architecture, and automated inventory reconciliation.**

[Live Storefront](https://fosterawor.github.io/YourChoice/) • [Admin Console](https://fosterawor.github.io/YourChoice/admin-login.html) • [API Documentation](#rest-api-reference) • [Deployment Guide](#production-deployment)

</div>

---

## Table of Contents

- [1. Executive Overview](#1-executive-overview)
- [2. System Architecture](#2-system-architecture)
  - [Dual-Hosting Topology](#dual-hosting-topology)
  - [Universal Client Endpoint Resolver](#universal-client-endpoint-resolver)
- [3. Key Platform Capabilities](#3-key-platform-capabilities)
  - [Ghanaian Localization & Address Intelligence](#ghanaian-localization--address-intelligence)
  - [Decoupled Hybrid Product Catalog](#decoupled-hybrid-product-catalog)
  - [Frictionless Multi-Channel Checkout](#frictionless-multi-channel-checkout)
  - [Identity, Session Lifecycle & Anti-Enumeration](#identity-session-lifecycle--anti-enumeration)
  - [Protected Administration Dashboard](#protected-administration-dashboard)
- [4. REST API Reference](#4-rest-api-reference)
  - [Authentication & User Management](#authentication--user-management)
  - [Shopping Cart & Wishlist Synchronization](#shopping-cart--wishlist-synchronization)
  - [Orders & Checkout Processing](#orders--checkout-processing)
  - [Product Catalog & Inventory](#product-catalog--inventory)
  - [Administrative Operations](#administrative-operations)
  - [Customer Inquiries & Diagnostics](#customer-inquiries--diagnostics)
- [5. Repository Structure](#5-repository-structure)
- [6. Local Development & Setup](#6-local-development--setup)
  - [Prerequisites](#prerequisites)
  - [Installation & Quickstart](#installation--quickstart)
  - [Environment Configuration](#environment-configuration)
  - [Administrative Provisioning CLI](#administrative-provisioning-cli)
  - [Automated Testing & Linting](#automated-testing--linting)
- [7. Security Architecture](#7-security-architecture)
- [8. Production Deployment](#8-production-deployment)
  - [Deploying the Frontend to GitHub Pages](#deploying-the-frontend-to-github-pages)
  - [Deploying the Backend to Render](#deploying-the-backend-to-render)
- [9. Planned Integrations & Roadmap](#9-planned-integrations--roadmap)
  - [Localized Payment Gateway (Paystack / Hubtel)](#localized-payment-gateway-paystack--hubtel)
  - [On-Demand Courier Dispatch & Logistics API](#on-demand-courier-dispatch--logistics-api)
- [10. Contributing & License](#10-contributing--license)

---

## 1. Executive Overview

**YourChoice** is a production-grade e-commerce application tailored specifically for retail commerce in Ghana while adhering to global software engineering standards. It pairs a ultra-lightweight, zero-framework, dependency-free frontend with an Express.js and MongoDB Atlas micro-backend.

Unlike standard e-commerce templates that rely on generic international postal codes, YourChoice incorporates **Ghanaian National Communications Authority (NCA) telco prefix parsing**, **GhanaPost GPS format validation**, and **official administrative regional mapping** directly into the customer checkout journey.

### Engineering Highlights

- **Dual-Hosting Decoupling**: Completely decoupled static frontend (hosted on GitHub Pages) and auto-scaling REST API (hosted on Render), unified by an environment-agnostic endpoint resolution layer (`config.js`).
- **Resilient Fallback Engine**: If the cloud database is disconnected or unreachable during local development, the backend automatically falls back to an in-memory data store with seeded test accounts, preventing developer lockouts.
- **Strict Zero-Trust Security**: Multi-origin CORS enforcement with preflight caching, salted bcrypt password hashing, JWT stateless sessions, IP-based anti-brute-force rate limiting, and public sanitization of administrative endpoints.
- **Cache-Busting Asset Pipeline**: Integrated build script that stamps version hashes onto local CSS and JavaScript tags to eliminate browser caching staleness on static CDNs.

---

## 2. System Architecture

### Dual-Hosting Topology

The platform is designed to operate seamlessly across two distinct hosting tiers without code changes:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Production Topology                             │
└────────────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────┐     ┌───────────────────────────┐
 │        GitHub Pages (Static)         │     │  Local Dev / Cloud Run    │
 │  https://<user>.github.io/YourChoice │     │  localhost:5000/3000           │
 └──────────────────┬───────────────────┘     └─────────────┬─────────────┘
                    │                                       │
                    ▼ (config.js auto-detect)               ▼ (Same-Origin /api)
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      Express.js REST API (Node 18+)                    │
 │               Hosted on Render (yourchoice-g473.onrender.com)          │
 │                                                                        │
 │  ├── Security Middlewares (CORS Origin Whitelisting, Helmet headers)   │
 │  ├── Rate Limiter (5 Failed Login Attempts -> 15-Minute IP Lockout)    │
 │  ├── JWT Authentication & Role-Based Authorization Guard               │
 │  └── Address & Ghana Telecom Validation Engine                         │
 └──────────────────┬─────────────────────────────────────────────────────┘
                    │
         ┌──────────┴───────────────────────┐
         ▼                                  ▼
 ┌───────────────────────────┐  ┌────────────────────────────────────────┐
 │   MongoDB Atlas (Cloud)   │  │   In-Memory Fallback Engine (Dev/Test) │
 │  - Users & Hashed Auth    │  │  - Instant zero-config local startup   │
 │  - Orders & Delivery PII  │  │  - Seeded admin & customer accounts    │
 │  - Live Inventory Metrics │  │  - Automatic product catalog seeding   │
 └───────────────────────────┘  └────────────────────────────────────────┘
```

### Universal Client Endpoint Resolver

Frontend network calls route through a single environment resolver (`config.js`):
1. **GitHub Pages Deployment (`*.github.io`)**: Automatically directs all `/api/*` traffic cross-origin to the Render backend (`https://yourchoice-g473.onrender.com`).
2. **Local Development / Preview / Cloud Run**: Dynamically resolves endpoints as same-origin relative paths (`/api/*`), enabling seamless full-stack execution on port 3000.
3. **Anti-Tampering Storage Purge**: Defensively clears any unauthenticated client `localStorage` overrides on initialization to prevent URL redirection or session hijacking attacks.

---

## 3. Key Platform Capabilities

### Ghanaian Localization & Address Intelligence

Standard foreign checkout flows cause high cart abandonment in West Africa due to missing street names or postal code requirements. YourChoice solves this via `ghana-validation.js`:

- **NCA Telco Prefix Detection**: Analyzes Ghana phone numbers in real time, identifies the telecom operator (MTN, Telecel, AT), displays an operator badge, and formats the number into standard Ghanaian notation (`024 XXX XXXX` or `+233 24 XXX XXXX`).
- **16 Administrative Regions**: Native select controls populated with all sixteen recognized Ghanaian regions (Greater Accra, Ashanti, Western, Central, Eastern, Northern, Volta, etc.).
- **GhanaPost GPS Digital Addressing**: Formats and validates digital address codes (e.g., `GA-183-9024`, `AK-039-5028`) with real-time regex parsing.
- **Landmark-Centric Delivery**: Captures local landmarks and delivery notes, providing couriers with actionable physical directions.

### Decoupled Hybrid Product Catalog

Products are maintained with high-availability static fallbacks while inventory metrics stay dynamic:
- Static metadata (titles, descriptions, categories, specifications, image arrays) guarantees instantaneous storefront rendering and zero layout shifts.
- Dynamic metrics (real-time stock quantities, total sales counts, active promotional discounts) are synchronized asynchronously from MongoDB on page load.
- In-flight inventory checks at checkout prevent overselling and decrement stock authoritatively upon order placement.

### Frictionless Multi-Channel Checkout

- **Guest Mode**: Customers can complete orders without forced account creation. Contact and delivery preferences are safely cached in client session storage to pre-fill future visits.
- **Authenticated Sessions**: Logged-in users benefit from synchronized server-side carts and wishlists across devices, plus preloaded delivery profiles.
- **Cart Expiration Window**: Local carts maintain a rolling 14-day expiration window (`CART_TTL_MS`), keeping storage tidy while respecting customer intent.

### Identity, Session Lifecycle & Anti-Enumeration

- **Salted Password Hashing**: Passwords are encrypted using bcrypt with an adaptive salt work factor of 10.
- **Anti-User-Enumeration**: Forgot-password submissions always return a uniform generic HTTP 200 response regardless of whether the email exists in the database.
- **Secure Token Expiration**: Password reset tokens are generated using cryptographically strong hexadecimal bytes (`crypto.randomBytes(32)`), expire after 15 minutes, and are single-use.
- **Email Dispatching**: Transports emails via Nodemailer with direct SMTP support, complete with an automated terminal preview fallback for local testing.

### Protected Administration Dashboard

- **KPI Analytics**: Real-time sales revenue (GH₵), total orders counter, low-stock inventory warnings, and customer support inquiry queues.
- **Order Lifecycle Management**: Filter, inspect, and update order statuses across five discrete states: `Pending`, `Processing`, `Shipped`, `Delivered`, and `Cancelled`.
- **Administrator Role Guard**: Strict JWT authorization (`role: 'admin'`) required for all administrative actions.
- **Brute-Force Lockout**: Five consecutive invalid login attempts trigger an immediate 15-minute IP address ban (HTTP 429).
- **Hardened Login Surface**: The admin login page is stripped of all public configuration inputs, preventing unauthorized endpoint redirection.

---

## 4. REST API Reference

All requests and responses use the `application/json` content type. Authenticated routes require an `Authorization: Bearer <token>` header.

### Authentication & User Management

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/users/register` | None | Register a customer account with localized delivery details |
| `POST` | `/api/users/login` | None | Authenticate customer credentials; returns JWT and merges guest cart |
| `GET` | `/api/user/profile` | User | Retrieve current authenticated user profile and saved delivery data |
| `PUT` | `/api/user/profile` | User | Update customer profile, phone number, and delivery preferences |
| `POST` | `/api/auth/forgot-password` | None | Request a secure 15-minute single-use password reset token |
| `GET` | `/api/auth/verify-token` | None | Pre-validate reset token before rendering password reset form |
| `POST` | `/api/auth/reset-password` | None | Execute password reset using verified token and new password |

### Shopping Cart & Wishlist Synchronization

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/user/cart-wishlist` | User | Fetch remote saved cart and wishlist items for authenticated user |
| `POST` | `/api/user/cart-wishlist` | User | Background synchronize in-memory cart and wishlist items to cloud |

### Orders & Checkout Processing

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/orders` | Optional | Place an order; validates inventory and decrements stock |
| `GET` | `/api/user/orders` | User | Retrieve historical orders placed by the authenticated customer |

### Product Catalog & Inventory

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/products` | None | Retrieve hybrid product catalog with live stock and sales metrics |
| `GET` | `/api/products/:id` | None | Retrieve specific product details, stock availability, and discounts |

### Administrative Operations

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/admin/login` | None | Administrator authentication; protected by brute-force IP rate limiter |
| `GET` | `/api/admin/stats` | Admin | Aggregate dashboard KPIs (Revenue, Orders, Products, Messages) |
| `GET` | `/api/admin/orders` | Admin | List all store orders with customer contact and delivery details |
| `PUT` | `/api/admin/orders/:id/status` | Admin | Transition an order status (`Processing`, `Shipped`, etc.) |
| `POST` | `/api/admin/create` | Admin | Create a new administrator account (restricted to active admins) |
| `GET` | `/api/admin/messages` | Admin | Retrieve all customer support messages and inquiries |
| `PUT` | `/api/admin/messages/:id/status` | Admin | Update status of a customer inquiry (`Read`, `Archived`) |

### Customer Inquiries & Diagnostics

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/contact` | None | Submit a customer support inquiry with offline-resilient queuing |
| `GET` | `/api/health` | None | Service liveness probe returning database status and active DB name |

---

## 5. Repository Structure

```
YourChoice/
├── index.html                   # Customer storefront (catalog, search, modals, cart)
├── checkout.html                # Frictionless checkout with Ghana address validation
├── login.html                   # Customer login with guest cart auto-merging
├── register.html                # Customer registration with Ghana post-code checks
├── orders.html                  # Customer order history and status tracking
├── reset-password.html          # Tokenized single-use password reset interface
├── admin-login.html             # Hardened administrator authentication portal
├── admin-dashboard.html         # Administrator operational console and order manager
├── config.js                    # Universal environment-agnostic API resolver
├── script.js                    # Core frontend business logic and reactive state
├── ghana-validation.js          # Ghanaian telco prefix and GhanaPost GPS validator
├── style.css                    # Storefront visual styling and responsive rules
├── admin-style.css              # Administrator console styling and KPI widgets
│
├── backend/
│   ├── server.js                # Express API server, MongoDB models, and security middleware
│   └── test/
│       └── health.test.js       # Node native test runner (16 comprehensive test suites)
│
├── scripts/
│   ├── cache-bust.js            # Automated build script stamping version query strings
│   └── create-admin.js          # Direct CLI utility to securely provision administrators
│
├── package.json                 # Project dependencies, test scripts, and build tasks
├── .env.example                 # Production-ready environment variable blueprint
├── .gitignore                   # Ignore rules for secrets, nodes, and builds
└── README.md                    # Project documentation
```

---

## 6. Local Development & Setup

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB Atlas** connection URI (optional; an in-memory fallback runs automatically if unset)

### Installation & Quickstart

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fosterawor/YourChoice.git
   cd YourChoice
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   *(See the [Environment Configuration](#environment-configuration) section below for recommended values).*

4. **Launch the development server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5000`.
   - Storefront: `http://localhost:5000`
   - Admin Login: `http://localhost:5000/admin-login.html`
   - Health Diagnostic: `http://localhost:5000/api/health`

### Environment Configuration

Configure your `.env` file based on `.env.example`:

```ini
# Server Settings
PORT=5000
NODE_ENV=development

# Cross-Origin Resource Sharing (CORS)
# Comma-separated list of additional allowed origins
ALLOWED_ORIGINS=https://fosterawor.github.io

# Database Connection (MongoDB Atlas)
# Leave blank to use the instant in-memory fallback store during local development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/yourchoice?retryWrites=true&w=majority
MONGODB_DB_NAME=yourchoice

# Administrator Security (Used to seed the initial admin in MongoDB)
ADMIN_USERNAME=admin_ops
ADMIN_INITIAL_PASSWORD=ChooseAStrongPassword2026!

# Cryptographic JWT Secret (Minimum 32 characters required in production)
JWT_SECRET=super_secret_cryptographic_random_key_min_32_characters

# Application Base URL (Used in password reset emails)
APP_URL=http://localhost:5000

# Optional SMTP Email Configuration (Nodemailer)
# If left blank, password reset links log to the terminal console
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
FROM_EMAIL="YourChoice Support" <no-reply@yourchoice.com>
```

### Administrative Provisioning CLI

If you connect a new MongoDB Atlas cluster and need to seed or update an administrator account without running the web server, use the secure CLI utility:

```bash
# Interactive or parameterized provisioning
node scripts/create-admin.js <username> <password>

# Example:
node scripts/create-admin.js operations ManagerPass2026!
```

### Automated Testing & Linting

YourChoice includes an automated test runner built on Node.js's native test engine and Supertest:

```bash
# Execute the full 16-suite integration test pipeline
npm test

# Run ESLint validation across backend code
npm run lint

# Execute cache-busting asset versioning
npm run build
```

---

## 7. Security Architecture

- **Zero Hardcoded Secrets**: In production (`NODE_ENV=production`), the application refuses to start if `JWT_SECRET` is unset or using a default placeholder. In local preview mode, an ephemeral 32-byte cryptographic secret is generated automatically at boot.
- **Anti-Brute-Force IP Lockout**: Login endpoints track client IPs (`X-Forwarded-For` aware). Five consecutive bad attempts lock out the client for 15 minutes, returning HTTP 429.
- **Dynamic CORS Origin Gate**: Restricts cross-origin requests to explicit production domains (`*.github.io`, `*.run.app`, `localhost`), while returning clean HTTP 403 JSON payloads to unauthorized origins.
- **Input Sanitization & ReDoS Prevention**: Regex inputs for catalog search and email validation are escaped (`escapeRegex`) before query compilation to eliminate Regular Expression Denial of Service (ReDoS) vectors.
- **Role-Based Middleware Guards**: Customer routes (`authenticateUser`) and administrative routes (`authenticateAdmin`) enforce discrete cryptographic claims, preventing horizontal privilege escalation.

---

## 8. Production Deployment

### Deploying the Frontend to GitHub Pages

1. In your GitHub repository, navigate to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch** (or **GitHub Actions**).
3. Select the `main` branch and `/ (root)` folder, then click **Save**.
4. The storefront will be served at `https://<your-username>.github.io/YourChoice/`.
5. `config.js` will automatically detect `github.io` and route API traffic to your Render web service.

### Deploying the Backend to Render

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *A cryptographically random 64-character string*
   - `ADMIN_USERNAME`: *Your preferred initial admin username*
   - `ADMIN_INITIAL_PASSWORD`: *Your initial strong admin password*
   - `ALLOWED_ORIGINS`: `https://<your-username>.github.io`
   - `APP_URL`: `https://<your-username>.github.io/YourChoice`
5. Click **Deploy Web Service**.

---

## 9. Planned Integrations & Roadmap

The platform architecture is designed to integrate the following production extensions:

### Localized Payment Gateway (Paystack / Hubtel)

- **Target Providers**: [Paystack](https://paystack.com/gh/) / [Hubtel](https://hubtel.com/)
- **Scope**:
  - Integration of Ghanaian Mobile Money (MTN MoMo, Telecel Cash, AT Money) and local card processing.
  - Server-side transaction initialization via `/api/checkout/initialize-payment`.
  - Secure webhook endpoint (`/api/webhooks/payment`) with cryptographic HMAC SHA-512 signature validation.
  - Automated transition of order status from `Pending` to `Processing` upon confirmed payment settlement.

```
 [ Customer Checkout ]
          │
          ▼
   POST /api/checkout/initialize-payment
          │
          ▼
 [ Render Backend ] ──(Secure API Key)──► [ Paystack / Hubtel API ]
          │                                         │
          ▼ (Redirect URL)                          ▼
 [ Payment Modal / USSD Prompt ] ◄──────────────────┘
          │
          ▼ (Customer authorizes Mobile Money on phone)
 [ Payment Settlement Webhook ]
          │
          ▼
   POST /api/webhooks/payment (HMAC SHA-512 signature verified)
          │
          ▼
 [ MongoDB Atlas Order updated to 'Processing' ]
```

### On-Demand Courier Dispatch & Logistics API

- **Target Providers**: Local Ghanaian on-demand dispatch APIs (e.g., Sendy, Fez Delivery, or local courier fleet webhooks).
- **Scope**:
  - Automated parcel dispatch creation as soon as an order is approved by an administrator in `admin-dashboard.html`.
  - Dynamic delivery fee computation based on region, town, and GhanaPost GPS district codes.
  - Real-time customer delivery tracking links embedded in order confirmation emails and `orders.html`.

---

## 10. Contributing & License

Contributions are welcome. Please ensure that all pull requests maintain 100% test pass rates and comply with the ESLint configuration:

```bash
# 1. Fork and create your feature branch
git checkout -b feature/amazing-feature

# 2. Verify code quality and automated tests
npm run lint
npm test

# 3. Commit and push your changes
git commit -m 'feat: implement amazing feature'
git push origin feature/amazing-feature
```

### License

This project is licensed under the **ISC License**. See the [LICENSE](LICENSE) file for complete details.

---

<div align="center">
  <sub>Engineered with precision for Ghanaian e-commerce and open-source excellence.</sub>
</div>
