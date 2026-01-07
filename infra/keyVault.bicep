@description('Key Vault module')
param location string
param prefix string
param accessPolicies array = []

resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: '${prefix}-kv'
  location: location
  properties: {
    tenantId: subscription().tenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    accessPolicies: accessPolicies
    enableSoftDelete: true
  }
}

output keyVaultUri string = keyVault.properties.vaultUri
output keyVaultResourceId string = keyVault.id
