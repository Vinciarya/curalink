const express = require('express');
const router = express.Router();
const Session = require('../models/Session');

router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({}, 'sessionId patientName disease createdAt totalQueries')
      .sort({ updatedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

router.get('/:sessionId', async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

router.delete('/:sessionId', async (req, res) => {
  try {
    const result = await Session.deleteOne({ sessionId: req.params.sessionId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
