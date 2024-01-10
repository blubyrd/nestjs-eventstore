"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const event_store_client_1 = require("./event-store.client");
test('instantiate eventstoreclient with insecure connection string', () => {
    const esClient = new event_store_client_1.EventStoreClient({
        connectionString: 'esdb://eventstore:2113?tls=false',
    });
    expect(esClient).toBeDefined();
});
test('instantiate eventstoreclient with secure connection string and credentials', () => {
    const esClient = new event_store_client_1.EventStoreClient({
        connectionString: 'esdb://admin:changeit@eventstore:2113?tls=true',
    });
    expect(esClient).toBeDefined();
});
test('instantiate eventstoreclient with non-connection string DNS cluster configuration', () => {
    const esClient = new event_store_client_1.EventStoreClient({
        connectionSettings: {
            discover: {
                address: 'eventstore',
                port: 2113,
            },
            nodePreference: 'random',
        },
        channelCredentials: {
            certChain: undefined,
            insecure: true,
            privateKey: undefined,
            rootCertificate: undefined,
            verifyOptions: undefined,
        },
        defaultUserCredentials: {
            username: 'admin',
            password: 'changeit',
        },
    });
    expect(esClient).toBeDefined();
});
test('instantiate eventstoreclient with non-connection string gossip cluster configuration', () => {
    const esClient = new event_store_client_1.EventStoreClient({
        connectionSettings: {
            endpoints: [
                {
                    address: 'eventstore',
                    port: 2113,
                },
            ],
            nodePreference: 'random',
        },
        channelCredentials: {
            certChain: undefined,
            insecure: true,
            privateKey: undefined,
            rootCertificate: undefined,
            verifyOptions: undefined,
        },
        defaultUserCredentials: {
            username: 'admin',
            password: 'changeit',
        },
    });
    expect(esClient).toBeDefined();
});
test('instantiate eventstoreclient with non-connection string single node configuration', () => {
    const esClient = new event_store_client_1.EventStoreClient({
        connectionSettings: {
            endpoint: {
                address: 'eventstore',
                port: 2113,
            },
        },
        channelCredentials: {
            certChain: undefined,
            insecure: true,
            privateKey: undefined,
            rootCertificate: undefined,
            verifyOptions: undefined,
        },
        defaultUserCredentials: {
            username: 'admin',
            password: 'changeit',
        },
    });
    expect(esClient).toBeDefined();
});
