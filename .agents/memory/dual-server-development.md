---
name: Dual-server development
description: Why the Replit development command runs the React frontend and Express API together.
---

The main preview should use Vite for the React app while Express stays available for API requests through Vite's same-origin `/api` proxy.

**Why:** This repository contains both a React portfolio and an Express-backed legacy site. Running only Express hides the React app; running only Vite disconnects API routes.

**How to apply:** When changing the development command or frontend port, keep the API process and `/api` proxy aligned, with Vite serving the Replit preview on port 5000.