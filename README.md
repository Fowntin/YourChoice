<div align="center">

## YourChoice

An e-commerce demo with a static frontend and a Node.js + MongoDB backend.

[![Backend CI](https://github.com/Fowntin/YourChoice/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/Fowntin/YourChoice/actions/workflows/backend-ci.yml)
[![Pages](https://github.com/Fowntin/YourChoice/actions/workflows/pages.yml/badge.svg)](https://github.com/Fowntin/YourChoice/actions/workflows/pages.yml)

</div>

---

### Features

- Static frontend (HTML/CSS/JS) deployed to GitHub Pages
- Express backend with MongoDB for users and orders
- Admin endpoints for orders and stats
- CI checks for linting and tests on each PR/push

### Live Demo

- Frontend: will be available at GitHub Pages once enabled (Settings → Pages)

### Repository Structure

```
backend/               # Express server
  server.js            # API routes and Mongo connection
  package.json         # scripts: start, lint, test
  test/                # Node test runner + supertest
.github/workflows/     # CI and Pages workflows
index.html, ...        # Frontend files
```

### Backend

Prerequisites:
- Node.js 18+
- MongoDB connection string

Setup:
1) Copy env template and fill values:
```
cp backend/.env.example backend/.env
```
2) Install and run backend:
```
cd backend
npm ci
npm run lint
npm test
npm start
```

The server listens on `PORT` (default 5000). Health check: `GET /`.

### Frontend (Pages)

The workflow `.github/workflows/pages.yml` publishes the repository root. After the first successful run, go to Settings → Pages and select GitHub Actions as the source. The site URL will appear on the workflow run and in the environment.

### Contributing

- Open issues using templates and submit PRs using the PR template.
- CI must pass before merge.

### License

ISC


