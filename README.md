# 🎓 APITutor — AI-Powered Interactive Math Tutor

> An intelligent, step-by-step mathematical problem solving and tutoring platform powered by Node.js, Express, React, MongoDB, Redis, and Gemini AI.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)
![Express](https://img.shields.io/badge/Backend-Node.js_/_Express-000000?logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)
![Redis](https://img.shields.io/badge/Caching-Redis-DC382D?logo=redis)

🌐 **Live Vercel Deployment:** [https://apitutor.vercel.app](https://apitutor.vercel.app)  
⚙️ **Live Render Backend API:** [https://apitutor.onrender.com/api](https://apitutor.onrender.com/api)

---

## 🌟 Key Features

- 🧠 **Step-by-Step AI Tutor:** Validates student steps in real-time using symbolic math logic with an **Agentic Gemini AI Fallback** when steps deviate.
- ⚡ **Redis Caching & Performance:** Caches problem sets and global leaderboard metrics with 300-second TTL for instantaneous response times.
- 🔒 **Secure Authentication:** Complete Auth system with JWT Access Tokens and `HttpOnly` Refresh Cookie rotation.
- 📊 **Interactive Analytics Dashboard:** Real-time topic mastery graphs powered by `recharts` and MongoDB Aggregation pipelines.
- 📐 **LaTeX Math Rendering:** Instant real-time preview of mathematical expressions using `KaTeX`.
- 📱 **Fully Responsive Dark Mode:** Sleek dark slate UI designed for seamless use across desktop and mobile browsers.

---

## 🛠️ Architecture & Tech Stack

```text
┌─────────────────────────┐          ┌─────────────────────────┐
│     React Frontend      │ ───────> │     Express Backend     │
│   Vite + React Router   │ <─────── │   Node.js + REST API    │
└─────────────────────────┘          └────────────┬────────────┘
                                                  │
                      ┌───────────────────────────┼───────────────────────────┐
                      ▼                           ▼                           ▼
            ┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
            │   MongoDB Atlas  │        │   Redis Cache    │        │  Gemini AI API   │
            │   (Database)     │        │  (Caching/Leader)│        │ (Agentic Engine) │
            └──────────────────┘        └──────────────────┘        └──────────────────┘
```

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, KaTeX, Recharts, Axios |
| **Backend** | Node.js, Express, Helmet, Morgan, Rate-Limit, Cookie-Parser |
| **Database** | MongoDB Atlas, Mongoose (Aggregation Pipelines) |
| **Caching** | Redis (Upstash / Redis Cloud) |
| **AI Engine** | Google Gemini Generative AI API (`@google/generative-ai`) |
| **Deployment** | Vercel (Frontend SPA), Render (Backend API Service) |

---

## 🚀 Getting Started locally

### Prerequisites
- **Node.js** (v18.x or higher)
- **MongoDB** (Local instance or MongoDB Atlas cluster URI)
- **Redis** (Local instance or Upstash Redis URL)
- **Google Gemini API Key**

### 1. Clone the Repository
```bash
git clone https://github.com/vineethkumar39228-afk/apitutor.git
cd apitutor
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/apitutor
REDIS_URL=redis://default:<password>@redis-server-url:6379
JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_even_more_secret_refresh_key
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env.development` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite frontend development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to start tutoring!

---

## 📖 API Documentation

Complete REST API documentation including request payloads and response schemas is available in [`API.md`](./API.md).

---

## 🛡️ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
