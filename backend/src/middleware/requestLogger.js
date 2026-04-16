const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.get('user-agent') || 'No User-Agent'}`);

  res.on('finish', () => {
    const elapsedMs = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${elapsedMs}ms)`);
  });

  next();
};

module.exports = requestLogger;
