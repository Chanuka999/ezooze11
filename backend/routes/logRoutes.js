const express = require('express');
const router = express.Router();

// In-memory log storage (replace with database in production)
let logs = [];
const MAX_LOGS = 10000; // Store max 10,000 logs

// POST - Log a visit
router.post('/', (req, res) => {
  try {
    const { timestamp, page, action, userAgent, referrer } = req.body;

    if (!timestamp || !page) {
      return res.status(400).json({ error: 'Missing required fields: timestamp, page' });
    }

    const logEntry = {
      id: logs.length + 1,
      timestamp,
      page,
      action: action || 'visit',
      userAgent,
      referrer,
      createdAt: new Date().toISOString(),
    };

    logs.push(logEntry);

    // Keep only recent logs in memory
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    console.log(`[${timestamp}] ${action || 'VISIT'} - Page: ${page}`);

    res.status(201).json({
      success: true,
      message: 'Log recorded successfully',
      log: logEntry,
    });
  } catch (error) {
    console.error('Error recording log:', error);
    res.status(500).json({
      error: 'Failed to record log',
      details: error.message,
    });
  }
});

// GET - Retrieve all logs
router.get('/', (req, res) => {
  try {
    const { limit = 100, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const paginatedLogs = logs.slice(-skip - limit, -skip || undefined).reverse();

    res.json({
      success: true,
      total: logs.length,
      limit: parseInt(limit),
      page: parseInt(page),
      data: paginatedLogs,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve logs',
      details: error.message,
    });
  }
});

// GET - Get logs by page
router.get('/page/:page', (req, res) => {
  try {
    const { page } = req.params;
    const pageLogs = logs.filter(log => log.page === page);

    res.json({
      success: true,
      page,
      total: pageLogs.length,
      data: pageLogs,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve page logs',
      details: error.message,
    });
  }
});

// GET - Get analytics summary
router.get('/analytics/summary', (req, res) => {
  try {
    const pageStats = {};
    const actionStats = {};

    logs.forEach(log => {
      // Count by page
      pageStats[log.page] = (pageStats[log.page] || 0) + 1;

      // Count by action
      actionStats[log.action] = (actionStats[log.action] || 0) + 1;
    });

    res.json({
      success: true,
      totalLogs: logs.length,
      uniquePages: Object.keys(pageStats).length,
      pageStats,
      actionStats,
      mostVisitedPage: Object.keys(pageStats).reduce((a, b) =>
        pageStats[a] > pageStats[b] ? a : b, 'none'),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate analytics',
      details: error.message,
    });
  }
});

// DELETE - Clear all logs
router.delete('/clear', (req, res) => {
  try {
    const count = logs.length;
    logs = [];

    res.json({
      success: true,
      message: `Cleared ${count} logs`,
      remaining: logs.length,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear logs',
      details: error.message,
    });
  }
});

module.exports = router;
