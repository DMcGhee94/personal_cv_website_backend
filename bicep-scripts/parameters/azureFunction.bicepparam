using '../azureFunction.bicep'

param appInsightsLocation = 'uksouth'

var subscriptionId = '125db55b-2f5a-4d32-bf7b-3c88da7e8565'
var resourceGroup = 'personal-cv-website-backend'
var keyVaultName = 'personal-cvwebsite'

param cosmosReadWriteString = az.getSecret('${subscriptionId}', '${resourceGroup}', '${keyVaultName}', 'COSMOS-ACCOUNT-READWRITE')

param cosmosReadOnlyString = az.getSecret('${subscriptionId}', '${resourceGroup}', '${keyVaultName}', 'COSMOS-ACCOUNT-READONLY')
