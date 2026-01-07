const axios = require('axios');
const { getSecret } = require('./azureKeyVault');

// Call AML endpoint using key stored in Key Vault or environment for local dev
async function predict(data) {
  try {
    const vaultUrl = process.env.KEYVAULT_URL;
    let amlEndpoint = process.env.AML_ENDPOINT_URL;
    let amlKey = process.env.AML_ENDPOINT_KEY;

    if (vaultUrl && (!amlEndpoint || !amlKey)) {
      amlEndpoint = amlEndpoint || await getSecret(vaultUrl, 'aml-endpoint-url');
      amlKey = amlKey || await getSecret(vaultUrl, 'aml-endpoint-key');
    }

    if (!amlEndpoint) {
      // Fallback to simple heuristic when no endpoint configured
      return { risk_level: data.spo2 < 92 || data.hr > 140 ? 'high' : 'low', confidence: 0.8 };
    }

    const resp = await axios.post(amlEndpoint, { inputs: data }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${amlKey || ''}` }
    });

    // Expect response: { risk_level, confidence }
    return resp.data;
  } catch (err) {
    console.error('AML call failed', err.message || err);
    return { risk_level: 'low', confidence: 0.0 };
  }
}

module.exports = { predict };
