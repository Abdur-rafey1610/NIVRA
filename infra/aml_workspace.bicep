@description('AML Workspace module (skeleton)')
param location string
param prefix string

resource amlWorkspace 'Microsoft.MachineLearningServices/workspaces@2023-04-01' = {
  name: '${prefix}-aml'
  location: location
  properties: {
    friendlyName: '${prefix}-aml'
  }
}

output amlWorkspaceName string = amlWorkspace.name
