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

const client = {
    readOnly: TableClient.fromConnectionString(
        env.readOnly.connectionString,
        env.readOnly.tableName
    ),
    readWrite: TableClient.fromConnectionString(
        env.readWrite.connectionString,
        env.readWrite.tableName
    )
};

const getCount = () => {
    return client.readOnly.getEntity("cv-website", "1");
};

const initialRecord = async () => {
    await client.readWrite.upsertEntity(
        {
            partitionKey: "cv-website", 
            rowKey: "1", 
            count: 1
        }
    );
};

app.http('returnViewCount', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        var recordCount = {};

        try {
            recordCount = await getCount();
        } catch (error) {
            if (error.statusCode === 404) {
                await initialRecord();
    
                recordCount = await getCount();
            } else {
                return { body: JSON.stringify(error) };
            };
        };

        return { body: recordCount.count };
    }
});