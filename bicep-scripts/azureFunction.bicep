@description('The name of the function app that you wish to create.')
param appName string = 'fnapp${uniqueString(resourceGroup().id)}'

@description('Storage Account type')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_RAGRS'
])
param storageAccountType string = 'Standard_LRS'

@description('Location for all resources.')
param location string = resourceGroup().location

@description('Location for Application Insights')
param appInsightsLocation string

@description('The language worker runtime to load in the function app.')
@allowed([
  'node'
  'dotnet'
  'java'
])
param runtime string = 'node'

param keyVaultName string

var functionAppName = appName
var hostingPlanName = appName
var applicationInsightsName = appName
var storageAccountName = '${uniqueString(resourceGroup().id)}azfunctions'
var functionWorkerRuntime = runtime

var allowedCorsOrigins = [
          'http://127.0.0.1:3000'
          'https://dmcvvgmmu3kqkdxgq.z33.web.core.windows.net'
          'https://darren-mcghee.com'
        ]

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-05-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageAccountType
  }
  kind: 'Storage'
  properties: {
    supportsHttpsTrafficOnly: true
    defaultToOAuthAuthentication: true
  }
}

resource hostingPlan 'Microsoft.Web/serverfarms@2021-03-01' = {
  name: hostingPlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  properties: {}
}

module functionApp './modules/functionApp.bicep' ={
  name: 'deployFunctionApp'
  params: {
    functionAppName: functionAppName
    location: location
    hostingPlanId: hostingPlan.id
    functionWorkerRuntime: functionWorkerRuntime
    cosmosReadOnlyString: keyVault.getSecret('COSMOS-ACCOUNT-READONLY')
    cosmosReadWriteString: keyVault.getSecret('COSMOS-ACCOUNT-READWRITE')
    storageAccountName: storageAccountName
    applicationInsightsName: applicationInsightsName
    allowedCorsOrigins: allowedCorsOrigins
  }
}

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: appInsightsLocation
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
}

output funcName string = functionAppName
