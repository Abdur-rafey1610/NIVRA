@description('Azure SQL module')
param location string
param prefix string
param administratorLogin string = 'sqladmin'
param administratorLoginPassword securestring

resource sqlServer 'Microsoft.Sql/servers@2022-02-01-preview' = {
  name: '${prefix}-sqlserver'
  location: location
  properties: {
    administratorLogin: administratorLogin
    administratorLoginPassword: administratorLoginPassword
  }
  sku: {
    name: 'GP_Gen5_2'
  }
}

resource sqlDb 'Microsoft.Sql/servers/databases@2022-02-01-preview' = {
  parent: sqlServer
  name: '${prefix}-sqldb'
  location: location
  properties: {
    sku: {
      name: 'Standard'
    }
  }
}

output sqlServerName string = sqlServer.name
output sqlDatabaseName string = sqlDb.name
