module.exports = async function (context, req) {
  context.log('AlertFunction processed a request.');
  const body = req.body || {};
  const { deviceId, risk_level, confidence, timestamp } = body;

  if (!deviceId || !risk_level || confidence == null) {
    context.res = { status: 400, body: { error: 'Missing fields' } };
    return;
  }

  // Trigger logic: only act on high risk and confidence > 0.85
  if (risk_level === 'high' && confidence > 0.85) {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    try {
      const response = await fetch(`${backendUrl}/iot/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, risk_level, confidence, timestamp, message: `High risk alert: ${confidence} confidence` })
      });
      if (response.ok) {
        context.log(`Alert persisted for ${deviceId}`);
        context.res = { status: 200, body: { alerted: true } };
      } else {
        context.log('Failed to persist alert');
        context.res = { status: 500, body: { error: 'Persistence failed' } };
      }
    } catch (err) {
      context.log('Error calling backend:', err);
      context.res = { status: 500, body: { error: 'Internal error' } };
    }
  } else {
    context.res = { status: 200, body: { alerted: false } };
  }
};
