require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./src/config/database');
const chatRoutes = require('./src/routes/chat');
const sessionRoutes = require('./src/routes/sessions');
const { errorHandler } = require('./src/middleware/errorHandler');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProduction ? 'combined' : 'dev'));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'curalink-api' }));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date(), version: '1.0.0' }));

app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🧬 Curalink backend running on port ${PORT}`));
};

start().catch(console.error);
