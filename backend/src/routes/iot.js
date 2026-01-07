const express = require('express');
const router = express.Router();
const mlClient = require('../services/mlClient');

// POST /iot/telemetry
// Expected payload: { deviceId, hr, spo2, motion, timestamp }
router.post('/telemetry', async (req, res) => {
  try {
    const { deviceId, hr, spo2, motion, timestamp } = req.body;
    if (!deviceId || hr == null || spo2 == null || motion == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Range validation (simple)
    if (hr < 20 || hr > 250 || spo2 < 60 || spo2 > 110) {
      return res.status(400).json({ error: 'Sensor values out of range' });
    }

    // Normalize and call ML endpoint
    const mlResp = await mlClient.predict({ hr, spo2, motion, deviceId, timestamp });

    // Persist sensor log and risk event (if desired)
    // try {
    //   const sqlClient = require('../services/sqlClient');
    //   await sqlClient.insertSensorLog({ deviceId, hr, spo2, motion, timestamp });
    //   if (mlResp && mlResp.risk_level) {
    //     await sqlClient.insertRiskEvent({ deviceId, risk_level: mlResp.risk_level, confidence: mlResp.confidence, timestamp });
    //   }
    // } catch (err) {
    //   console.warn('SQL persistence skipped or failed:', err.message || err);
    // }

    return res.json({ success: true, prediction: mlResp });
  } catch (err) {
    console.error('Telemetry handling failed', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /iot/alert
// Expected payload: { deviceId, risk_level, confidence, timestamp, message? }
router.post('/alert', async (req, res) => {
  try {
    const { deviceId, risk_level, confidence, timestamp, message } = req.body;
    if (!deviceId || !risk_level || confidence == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Persist alert
    // const sqlClient = require('../services/sqlClient');
    // await sqlClient.insertAlert({ deviceId, message: message || `Alert: ${risk_level} risk with confidence ${confidence}`, timestamp });

    // TODO: Send push notification or SMS here
    console.log(`Alert logged for ${deviceId}: ${message}`);

    return res.json({ success: true });
  } catch (err) {
    console.error('Alert handling failed', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
