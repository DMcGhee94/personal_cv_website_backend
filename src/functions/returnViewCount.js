const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const env = {
    readOnly: {
        connectionString: process.env["COSMOSDB_CONNECTION_READONLY"],
        tableName: "website_visitor_count"
    },
    readWrite: {
        connectionString: process.env["COSMOSDB_CONNECTION_READWRITE"],
        tableName: "website_visitor_count"
    }  
};

const readClient = TableClient.fromConnectionString(
    env.readOnly.connectionString,
    env.readOnly.tableName    
);

const writeClient = TableClient.fromConnectionString(
    env.readWrite.connectionString,
    env.readWrite.tableName
);

app.http('returnViewCount', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        var viewCountRecord = readClient.listEntities();     

        if (!viewCountRecord) {
            await writeClient.upsertEntity({"PartitionKey": "cv-website", "RowKey": "1", "Count": 1});
            viewCountRecord = await readClient.listEntities();
        };

        return { body: viewCountRecord };
    }
});