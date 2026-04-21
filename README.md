# Infinity Stock Portfolio Tracker

A premium, full-stack financial dashboard designed to track personal equity portfolios, monitor real-time stock market data, and provide deep historical visualizations. Built with the MERN stack and styled with a custom dark-mode glassmorphic aesthetic.

## Features

- **Real-Time Market Data**: Integrates with the Alpha Vantage API to stream live stock prices, daily changes, and historical trends.
- **Intelligent API Rate Handling**: Custom backend logic with caching and data-fallbacks to gracefully manage 3rd-party API rate limits without breaking the UI.
- **Interactive Data Visualization**: Dynamic, responsive area charts built with Recharts, featuring custom tooltips, crosshairs, and live value tracking on hover.
- **Secure Authentication**: End-to-end user authentication using JWT (JSON Web Tokens) and BCrypt password hashing.
- **Portfolio & Watchlist Management**: Easily add, track, and remove assets from your active portfolio or watchlist. Calculates total invested amount, absolute returns, and asset allocation percentages automatically.
- **Premium UI/UX**: Designed from scratch using vanilla CSS to achieve a sleek, highly responsive "dark glassmorphism" aesthetic.

## Tech Stack

**Frontend:**
- React.js
- Lucide React (Icons)
- Recharts (Data Visualization)
- Axios
- Vanilla CSS

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & BCrypt
- Alpha Vantage API

## Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine. You will also need a free API key from [Alpha Vantage](https://www.alphavantage.co/).

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stock-portfolio-tracker.git
   cd stock-portfolio-tracker
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `/server` directory and add the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

You will need to run the client and server concurrently in two separate terminal windows.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm start
```

The frontend will start on `http://localhost:3000` and communicate with the backend on `http://localhost:5000`.

## Deployment

The application is configured to be easily deployed to modern cloud hosting platforms.

- **Frontend**: Designed to be deployed on Vercel or Netlify. The `client/src/config.js` automatically detects the environment and switches the API URL to production.
- **Backend**: Designed to be deployed on Render, Heroku, or DigitalOcean.

## License
This project is open-source and available under the [MIT License](LICENSE).
