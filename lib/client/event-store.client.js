"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreClient = void 0;
const db_client_1 = require("@eventstore/db-client");
const common_1 = require("@nestjs/common");
const guid_typescript_1 = require("guid-typescript");
const event_store_constants_1 = require("../event-store.constants");
let EventStoreClient = class EventStoreClient {
    constructor(options) {
        this.logger = new common_1.Logger(this.constructor.name);
        try {
            if (options) {
                if (options.connectionString) {
                    const { connectionString, parts } = options;
                    this.client = db_client_1.EventStoreDBClient.connectionString(connectionString, ...(parts || []));
                }
                else {
                    const { connectionSettings, channelCredentials, defaultUserCredentials } = options;
                    if (connectionSettings.discover) {
                        this.client = new db_client_1.EventStoreDBClient(connectionSettings, channelCredentials, defaultUserCredentials);
                    }
                    else if (connectionSettings.endpoints) {
                        this.client = new db_client_1.EventStoreDBClient(connectionSettings, channelCredentials, defaultUserCredentials);
                    }
                    else if (connectionSettings.endpoint) {
                        this.client = new db_client_1.EventStoreDBClient(connectionSettings, channelCredentials, defaultUserCredentials);
                    }
                    else {
                        throw Error('The connectionSettings property appears to be incomplete or malformed.');
                    }
                }
            }
            else {
                throw Error('Connection information not provided.');
            }
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    async writeEventToStream(streamName, eventType, payload, metadata) {
        const event = (0, db_client_1.jsonEvent)({
            id: guid_typescript_1.Guid.create().toString(),
            type: eventType,
            data: payload,
            metadata,
        });
        return this.client.appendToStream(streamName, event);
    }
    async writeEventsToStream(streamName, events) {
        const jsonEvents = events.map((e) => {
            return (0, db_client_1.jsonEvent)({
                id: guid_typescript_1.Guid.create().toString(),
                type: e.eventType,
                data: e.payload,
                metadata: e.metadata,
            });
        });
        return this.client.appendToStream(streamName, [...jsonEvents]);
    }
    async createPersistentSubscription(streamName, persistentSubscriptionName, settings) {
        return this.client.createPersistentSubscriptionToStream(streamName, persistentSubscriptionName, settings);
    }
    async subscribeToPersistentSubscription(streamName, persistentSubscriptionName) {
        return this.client.subscribeToPersistentSubscriptionToStream(streamName, persistentSubscriptionName);
    }
    async subscribeToCatchupSubscription(streamName, fromRevision) {
        return this.client.subscribeToStream(streamName, {
            fromRevision: fromRevision || db_client_1.START,
            resolveLinkTos: true,
        });
    }
    async subscribeToVolatileSubscription(streamName) {
        return this.client.subscribeToStream(streamName, {
            fromRevision: db_client_1.END,
            resolveLinkTos: true,
        });
    }
};
EventStoreClient = __decorate([
    __param(0, (0, common_1.Inject)(event_store_constants_1.EVENT_STORE_CONNECTION_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], EventStoreClient);
exports.EventStoreClient = EventStoreClient;
