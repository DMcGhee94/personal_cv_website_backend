using '../azureFunction.bicep'

param appInsightsLocation = 'uksouth'

var subscriptionId = 'personal-projects'
var resourceGroup = 'dev-personal-cv-website-backend'
var keyVaultName = 'personal-cvwebsite-vault'

param cosmosReadWriteString = az.getSecret('${subscriptionId}', '${resourceGroup}', '${keyVaultName}', 'COMSOS-ACCOUNT-READWRITE')

param cosmosReadOnlyString = az.getSecret('${subscriptionId}', '${resourceGroup}', '${keyVaultName}', 'COMSOS-ACCOUNT-READONLY')
