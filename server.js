const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express(); // ✅ Initialize app first

// ✅ Enable CORS for your frontend URL
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use FRONTEND_URL from .env or default to localhost
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
  credentials: true, // Allow credentials (cookies, HTTP authentication)
}));

// ✅ Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API Routes
app.use('/api', authRoutes);

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Test Route
app.get('/', (req, res) => {
  res.send('Backend API is running.');
});

app.get('/api/test', (req, res) => {
  res.json({ message: "API is working!" });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
