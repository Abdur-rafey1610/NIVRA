const sql = require('mssql');

let pool = null;

async function getPool() {
  if (pool) return pool;
  const connStr = process.env.SQL_CONNECTION_STRING;
  if (!connStr) throw new Error('SQL_CONNECTION_STRING not set');
  pool = await sql.connect(connStr);
  return pool;
}

async function insertSensorLog({ deviceId, hr, spo2, motion, timestamp }) {
  const p = await getPool();
  const query = `INSERT INTO sensor_logs (device_id, hr, spo2, motion, timestamp) VALUES (@deviceId, @hr, @spo2, @motion, @timestamp)`;
  await p.request()
    .input('deviceId', sql.NVarChar(100), deviceId)
    .input('hr', sql.Float, hr)
    .input('spo2', sql.Float, spo2)
    .input('motion', sql.Float, motion)
    .input('timestamp', sql.DateTimeOffset, timestamp ? new Date(timestamp) : new Date())
    .query(query);
}

async function insertRiskEvent({ deviceId, risk_level, confidence, timestamp }) {
  const p = await getPool();
  const query = `INSERT INTO risk_events (device_id, risk_level, confidence, timestamp) VALUES (@deviceId, @risk_level, @confidence, @timestamp)`;
  await p.request()
    .input('deviceId', sql.NVarChar(100), deviceId)
    .input('risk_level', sql.NVarChar(50), risk_level)
    .input('confidence', sql.Float, confidence)
    .input('timestamp', sql.DateTimeOffset, timestamp ? new Date(timestamp) : new Date())
    .query(query);
}

async function insertAlert({ deviceId, message, timestamp }) {
  const p = await getPool();
  const query = `INSERT INTO alerts (device_id, message, timestamp) VALUES (@deviceId, @message, @timestamp)`;
  await p.request()
    .input('deviceId', sql.NVarChar(100), deviceId)
    .input('message', sql.NVarChar(1000), message || 'High risk alert triggered')
    .input('timestamp', sql.DateTimeOffset, timestamp ? new Date(timestamp) : new Date())
    .query(query);
}

module.exports = { insertSensorLog, insertRiskEvent, insertAlert };
