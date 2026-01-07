@description('Location for all resources')
param location string = resourceGroup().location
param prefix string = 'nivra'

// Key Vault
// Storage (used by Function App)
module storage 'storageAccount.bicep' = {
  name: '${prefix}-storage'
  params: {
    location: location
    prefix: prefix
    storageAccountName: toLower('${prefix}storage')
  }
}

// IoT Hub
module iothub 'iotHub.bicep' = {
  name: '${prefix}-iothub'
  params: {
    location: location
    prefix: prefix
  }
}

// Azure SQL
module sql 'sql.bicep' = {
  name: '${prefix}-sql'
  params: {
    location: location
    prefix: prefix
    administratorLogin: 'sqladmin'
    administratorLoginPassword: 'REPLACE_WITH_SECURE_PASSWORD'
  }
}

// App Service (backend) - create before Key Vault so we can grant access policies
module app 'appService.bicep' = {
  name: '${prefix}-app'
  params: {
    location: location
    prefix: prefix
  }
}

// Function App (alerts) - create before Key Vault
module fn 'functionApp.bicep' = {
  name: '${prefix}-fn'
  params: {
    location: location
    prefix: prefix
    storageAccountName: storage.outputs.storageAccountName
  }
}

// Key Vault - include access policies for the App Service and Function principal IDs
var accessPolicies = [
  {
    tenantId: subscription().tenantId
    objectId: app.outputs.appPrincipalId
    permissions: {
      secrets: [ 'get', 'list' ]
    }
  }
  {
    tenantId: subscription().tenantId
    objectId: fn.outputs.functionPrincipalId
    permissions: {
      secrets: [ 'get', 'list' ]
    }
  }
]

module keyVault 'keyVault.bicep' = {
  name: '${prefix}-kv'
  params: {
    location: location
    prefix: prefix
    accessPolicies: accessPolicies
  }
}

// AML workspace
module aml 'aml_workspace.bicep' = {
  name: '${prefix}-aml'
  params: {
    location: location
    prefix: prefix
  }
}
