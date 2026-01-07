module.exports = async function (context, eventHubMessages) {
  context.log('IoTHubProcessor triggered with', eventHubMessages.length, 'messages');

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
  const alertFunctionUrl = process.env.ALERT_FUNCTION_URL || 'http://localhost:7071/api/AlertFunction'; // Adjust for deployed

  for (const msg of eventHubMessages) {
    try {
      // IoT Hub messages are usually JSON strings
      const body = typeof msg === 'string' ? JSON.parse(msg) : msg;
      const { deviceId, hr, spo2, motion, timestamp } = body;

      context.log(`Received telemetry from ${deviceId}: hr=${hr}, spo2=${spo2}, motion=${motion}`);

      // Simple normalization/validation
      if (!deviceId || hr == null || spo2 == null || motion == null) {
        context.log('Skipping invalid message');
        continue;
      }

      // Call backend for ML prediction and persistence
      const response = await fetch(`${backendUrl}/iot/telemetry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, hr, spo2, motion, timestamp })
      });

      if (!response.ok) {
        context.log('Backend call failed:', response.status);
        continue;
      }

      const result = await response.json();
      const { prediction } = result;
      if (prediction && prediction.risk_level === 'high' && prediction.confidence > 0.85) {
        context.log(`High risk detected for ${deviceId} (confidence=${prediction.confidence}). Triggering alert.`);
        // Call Alert Function
        await fetch(alertFunctionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId, risk_level: prediction.risk_level, confidence: prediction.confidence, timestamp })
        });
      }

    } catch (err) {
      context.log('Failed processing message', err);
    }
  }
};