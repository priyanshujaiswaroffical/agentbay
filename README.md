# 🖥️ AgentBay — AI-Powered Autonomous Marketplace

> **Windows XP-style autonomous commerce platform** where AI agents negotiate, buy, and sell hardware on your behalf using Google Gemini AI.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-blue.svg)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-teal.svg)](https://tailwindcss.com)

---

## 🚀 Live Demo

> Deploy your own instance → See [Deploy](#-deploy) section below.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Buyer Agent** | Gemini-powered agent autonomously negotiates prices down for you |
| 🏪 **AI Seller Agent** | Auto-responds to buyer offers based on your minimum price floor |
| 💬 **Negotiation Messenger** | MSN-style real-time chat window showing the full negotiation |
| 🧠 **Human Override** | Type during negotiation to override the AI with your own bid |
| 🧾 **Smart Receipt** | Tamper-evident printed receipt with negotiation audit log |
| 📁 **Transaction Registry** | Full history of all completed purchases |
| 🛡️ **Trust Center** | Fraud detection and security verification system |
| ⚙️ **Admin Panel** | Full control over AI behavior, categories, and system settings |
| 🏷️ **Dynamic Categories** | Admin can add/remove product categories for sellers |
| 🖼️ **Product Photo Upload** | Sellers can upload hardware photos to listings |
| 🔒 **Private Login** | Username + password auth, each device sees only its own accounts |

---

## 👤 User Roles

| Role | Can Do |
|---|---|
| **Buyer** | Browse marketplace, deploy AI negotiation agents, view receipts & transactions |
| **Seller** | Create product listings, upload photos, set minimum acceptable price |
| **Admin** | Everything above + manage categories, delete listings, change AI config, view all transactions |

### Default Admin Credentials
```
Username: admin
Password: admin
```
> ⚠️ Change the password after first login via Settings → My Account.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript 6
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 + Custom Windows XP CSS
- **AI**: Google Gemini API (`gemini-2.0-flash`)
- **Storage**: `localStorage` (browser-side, no backend required)
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 📦 Project Structure

```
agentbay/
├── src/
│   ├── apps/              # All application windows (Marketplace, ShoppingAgent, etc.)
│   ├── components/        # Shared UI (Desktop, WindowFrame, LoginScreen, etc.)
│   ├── services/          # Gemini API service
│   ├── types/             # TypeScript types
│   ├── data/              # Mock product data
│   ├── App.tsx            # Root app + state management
│   └── index.css          # Global styles + print CSS
├── public/                # Static assets
├── index.html
├── vite.config.ts
├── vercel.json            # Vercel SPA routing
├── .env.example           # Environment variable template
└── package.json
```

---

## ⚡ Quick Start (Local)

```bash
# 1. Clone the repo
git clone https://github.com/priyanshujaiswar/agentbay.git
cd agentbay

# 2. Install dependencies
npm install

# 3. Set up environment (optional — app works in demo mode without key)
cp .env.example .env.local
# Edit .env.local and add your Gemini API key

# 4. Start dev server
npm run dev
# Open http://localhost:5173
```

### Getting a Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a free API key
3. Enter it in the app: **Settings → AI Config → Gemini API Key**

---

## 🌐 Deploy

### ✅ Vercel (Recommended — 1 Click)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Framework: **Vite** (auto-detected)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Click **Deploy** ✅

> `vercel.json` is already configured for SPA routing.

### 🟣 Render

1. Go to [render.com](https://render.com) → **New Static Site**
2. Connect GitHub repo
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. Deploy ✅

### 🔵 Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

Or drag-and-drop the `dist/` folder at [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 🗃️ Supabase (Optional — for Real Database)

Currently all data is stored in `localStorage`. To add a real database:

1. Create a project at [supabase.com](https://supabase.com)
2. Create tables: `users`, `products`, `transactions`
3. Replace `localStorage` calls in `LoginScreen.tsx`, `App.tsx`, and `MarketplaceApp.tsx` with Supabase client calls
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your `.env.local`

---

## 🔒 Environment Variables

```env
# .env.local (not committed to git)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> The API key can also be entered directly inside the app UI (Settings → AI Config).

---

## 🧪 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run linter (oxlint)
```

---

## 📸 Screenshots

> Windows XP-style desktop with draggable, resizable windows, Start Menu, and taskbar.

---

## 🗺️ Roadmap

- [ ] Supabase integration for real persistent database
- [ ] Multi-user real-time negotiation (WebSockets)
- [ ] Email receipt delivery
- [ ] Seller analytics dashboard
- [ ] Mobile responsive layout
- [ ] Multiple AI model support (GPT-4, Claude)

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — Copyright (c) 2026 [Priyanshu Jaiswar](https://github.com/priyanshujaiswar)

See [LICENSE](LICENSE) for full text.

---

## 👨‍💻 Author

**Priyanshu Jaiswar**
- GitHub: [@priyanshujaiswar](https://github.com/priyanshujaiswar)

---

*Built with ❤️ and Google Gemini AI*
