const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

const credential = new DefaultAzureCredential();

async function getSecret(vaultUrl, secretName) {
  const client = new SecretClient(vaultUrl, credential);
  const secret = await client.getSecret(secretName);
  return secret.value;
}

module.exports = { getSecret };
