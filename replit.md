# Running the project

This project is a Node.js/Express personal portfolio site. Install dependencies and start the server with:

```bash
npm install
npm run dev
```

The Replit workflow runs the same server on port 5000 so it is available in Preview. The app also supports the `PORT` environment variable when started outside Replit.

The admin login uses `ADMIN_PASSWORD` when that environment variable is set; otherwise the server's current fallback password is used.