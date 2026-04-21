const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://stock-portfolio-tracker-backend-ju48.onrender.com' 
  : 'http://localhost:5000';

export default API_URL;