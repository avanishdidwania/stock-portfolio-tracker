const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // loads .env

const authRoutes = require('./routes/auth');

const app = express();

app.use(cors()); // cors() allows frontend to talk to backend
app.use(express.json()); // allows server to read json data sent in requests

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('DB Error:', err));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));