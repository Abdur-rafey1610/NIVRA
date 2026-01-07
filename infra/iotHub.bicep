@description('IoT Hub module')
param location string
param prefix string

resource iothub 'Microsoft.Devices/IotHubs@2021-07-01' = {
  name: '${prefix}-iothub'
  location: location
  sku: {
    name: 'S1'
    capacity: 1
  }
  properties: {
    eventHubEndpoints: {}
    features: 'None'
  }
}

output iothubName string = iothub.name
output iothubHostName string = iothub.properties.hostName
