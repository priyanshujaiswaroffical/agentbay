# Deployment Guide - AgentBay

AgentBay is a static client-side single page application (SPA) built using React, TypeScript, Vite, and Tailwind CSS. It is simple to deploy to any modern web hosting service.

## Prerequisites

Before deploying, ensure you have Node.js installed (version 18 or above recommended).

## Setup Environment Variables

For security, the application retrieves the Gemini API Key from your environment variables. 
1. Copy the example file `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and set your API key:
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

## Production Build

To build the application for production, run:

```bash
npm run build
```

This will run TypeScript checks and build the static assets. The output will be compiled into the `dist/` directory.

---

## Deployment Options

Since the build output consists of static files (HTML, JS, CSS, assets), you can host it using any static provider:

### 1. Vercel (Recommended)
The easiest way to deploy is using the Vercel CLI or via their Git integration:
1. Install the Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Configure the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Add the environment variable `VITE_GEMINI_API_KEY` in the Vercel project settings dashboard.

### 2. Netlify
1. Connect your repository to Netlify.
2. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Add the `VITE_GEMINI_API_KEY` under Site configuration -> Environment variables.

### 3. GitHub Pages
To deploy to GitHub Pages:
1. Install the gh-pages package:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Add a deploy script to your `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Set the base URL path in `vite.config.ts` if your repository is not at the root domain:
   ```typescript
   base: '/repository-name/'
   ```
4. Run `npm run deploy`. Note that for GitHub Pages, since env vars are injected at build time, you will need to set the environment variable in your CI/CD workflow (e.g. GitHub Actions).
