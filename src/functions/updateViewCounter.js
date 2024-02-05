const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const { json } = require('stream/consumers');

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

const updateCount = async (count) => {
    await client.readWrite.upsertEntity(
        {
            partitionKey: "cv-website", 
            rowKey: "1", 
            count: count
        }
    )
};

app.http('updateViewCounter', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        var recordCount = {};
        var newCount = 0;

        try {
            recordCount = await getCount();
            newCount = recordCount.count + 1;
            await updateCount(newCount);
        } catch (error) {
            if (error.statusCode === 404) {
                await updateCount(1);
    
                recordCount = await getCount();
            } else {
                return { body: JSON.stringify(error) };
            };
        };        

        recordCount = await getCount();
        return { body: recordCount.count };
    }
});