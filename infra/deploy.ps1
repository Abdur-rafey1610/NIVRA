param(
  [string] $resourceGroupName = 'nivra-rg',
  [string] $location = 'eastus'
)

# Deploy the main Bicep (edit params as needed)
az deployment group create --resource-group $resourceGroupName --template-file main.bicep --parameters location=$location prefix='nivra'
