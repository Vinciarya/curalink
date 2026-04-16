const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}: ${err.message}`);
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.message && err.message.includes('GROQ')) {
    return res.status(503).json({ error: 'AI service temporarily unavailable. Try again.' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({ error: isProduction ? 'Internal server error' : err.message });
};

module.exports = { errorHandler };
