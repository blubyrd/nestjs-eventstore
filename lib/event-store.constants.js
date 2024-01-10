"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreSubscriptionType = exports.EVENT_STORE_CLIENT = exports.EVENT_STORE_CONNECTION_OPTIONS = void 0;
exports.EVENT_STORE_CONNECTION_OPTIONS = 'EVENT_STORE_CONNECTION_OPTIONS';
exports.EVENT_STORE_CLIENT = 'EventStoreClient';
var EventStoreSubscriptionType;
(function (EventStoreSubscriptionType) {
    EventStoreSubscriptionType[EventStoreSubscriptionType["Persistent"] = 0] = "Persistent";
    EventStoreSubscriptionType[EventStoreSubscriptionType["CatchUp"] = 1] = "CatchUp";
})(EventStoreSubscriptionType = exports.EventStoreSubscriptionType || (exports.EventStoreSubscriptionType = {}));
