# Running the project

This project is a Node.js/Express personal portfolio site. Install dependencies and start the server with:

```bash
npm install
npm run dev
```

The Replit workflow runs the same server on port 5000 so it is available in Preview. The app also supports the `PORT` environment variable when started outside Replit.

The development workflow uses a local contact-data file only when Replit App Storage is unavailable. Published runs require Replit App Storage, a strong `ADMIN_PASSWORD`, and a `SESSION_SECRET` configured in Replit Secrets; the server does not use a default admin password or local-file fallback in production.