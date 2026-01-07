@description('Storage Account module')
param location string
param prefix string
param storageAccountName string

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {}
}

output storageAccountName string = storage.name
output storageAccountResourceId string = storage.id
