@description('App Service module for backend')
param location string
param prefix string

resource plan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${prefix}-app-plan'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${prefix}-app'
  location: location
  properties: {
    serverFarmId: plan.id
  }
  identity: {
    type: 'SystemAssigned'
  }
}

output appServiceName string = webApp.name
output appPrincipalId string = webApp.identity.principalId
