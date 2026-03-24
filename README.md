# 📈 Stock Portfolio Tracker

A full-stack web app to track your Indian stock portfolio with real-time 
data, Nifty-50 benchmarking and momentum-based sentiment scoring.

## 🚀 Live Demo
[Link here once deployed]

## ✨ Features
- JWT authenticated user accounts
- Real-time stock prices via Alpha Vantage API
- Portfolio performance vs Nifty-50 comparison
- Momentum-based fear/greed sentiment score per stock
- Interactive charts with historical performance

## 🛠️ Tech Stack
**Frontend:** React, Tailwind CSS, Recharts  
**Backend:** Node.js, Express.js  
**Database:** MongoDB  
**API:** Alpha Vantage  
**Deployment:** Vercel + Render

## ⚙️ Run Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/stock-portfolio-tracker

# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```

## 🔑 Environment Variables
Create a `.env` file in /server:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
ALPHA_VANTAGE_KEY=your_api_key
```
```

---

## Two Important Things

**1. Commit every single day** — even tiny changes. Your GitHub contribution graph going green daily looks great to recruiters.

**2. Add a `.gitignore` immediately** — so you never accidentally push your `.env` file with your API keys. Create `server/.gitignore`:
```
node_modules
.env
