# SKG Admin CMS

React, Vite, and Tailwind admin frontend for the SKG platform. Authentication, permissions,
CRM records, leads, CMS content, dashboard data, users, and settings are provided by the
separate Node.js/MongoDB backend in `../skg-admin-backend`.

## Local setup

```bash
npm install
copy .env.example .env
npm run dev
```

The default API URL is `https://skg-backenf.onrender.com/api/v1`. Override `VITE_API_URL` when the
backend is hosted elsewhere.

## Checks

```bash
npm test
npm run build
```

Start the backend before signing in. Login credentials are documented in the backend README
and can be changed through backend environment variables.
