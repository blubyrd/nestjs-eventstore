"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreBus = void 0;
const db_client_1 = require("@eventstore/db-client");
const common_1 = require("@nestjs/common");
const event_store_constants_1 = require("./event-store.constants");
const persistentSubscriptionSettings_1 = require("@eventstore/db-client/dist/persistentSubscription/utils/persistentSubscriptionSettings");
class EventStoreBus {
    constructor(client, subject$, config) {
        var _a, _b;
        this.client = client;
        this.subject$ = subject$;
        this.config = config;
        this.eventHandlers = {};
        this.logger = new common_1.Logger(this.constructor.name);
        this.catchupSubscriptions = [];
        this.catchupSubscriptionCount = 0;
        this.persistentSubscriptions = [];
        this.persistentSubscriptionsCount = 0;
        this.addEventHandlers(this.config.events);
        const catchupSubscriptions = ((_a = this.config.subscriptions) === null || _a === void 0 ? void 0 : _a.filter((s) => {
            return s.type === event_store_constants_1.EventStoreSubscriptionType.CatchUp;
        })) || [];
        this.subscribeToCatchUpSubscriptions(catchupSubscriptions);
        const persistentSubscriptions = ((_b = this.config.subscriptions) === null || _b === void 0 ? void 0 : _b.filter((s) => {
            return s.type === event_store_constants_1.EventStoreSubscriptionType.Persistent;
        })) || [];
        this.subscribeToPersistentSubscriptions(persistentSubscriptions);
    }
    async subscribeToPersistentSubscriptions(subscriptions) {
        this.persistentSubscriptionsCount = subscriptions.length;
        const createSubscriptionResults = await this.createMissingPersistentSubscriptions(subscriptions);
        const availableSubscriptionsCount = createSubscriptionResults.filter((s) => s.isCreated === true).length;
        if (availableSubscriptionsCount === this.persistentSubscriptionsCount) {
            this.persistentSubscriptions = await Promise.all(subscriptions.map(async (sub) => {
                return await this.subscribeToPersistentSubscription(sub.stream, sub.persistentSubscriptionName);
            }));
        }
        else {
            this.logger.error(`Not proceeding with subscribing to persistent subscriptions. Configured subscriptions ${this.persistentSubscriptionsCount} does not equal the created and available subscriptions ${availableSubscriptionsCount}.`);
        }
    }
    async createMissingPersistentSubscriptions(subscriptions) {
        const settings = (0, persistentSubscriptionSettings_1.persistentSubscriptionToStreamSettingsFromDefaults)({
            resolveLinkTos: true,
        });
        try {
            const subs = subscriptions.map(async (sub) => {
                this.logger.verbose(`Starting to verify and create persistent subscription - [${sub.stream}][${sub.persistentSubscriptionName}]`);
                return this.client
                    .createPersistentSubscription(sub.stream, sub.persistentSubscriptionName, settings)
                    .then(() => {
                    this.logger.verbose(`Created persistent subscription - ${sub.persistentSubscriptionName}:${sub.stream}`);
                    return {
                        isLive: false,
                        isCreated: true,
                        stream: sub.stream,
                        subscription: sub.persistentSubscriptionName,
                    };
                })
                    .catch((reason) => {
                    if (reason.type === db_client_1.ErrorType.PERSISTENT_SUBSCRIPTION_EXISTS) {
                        this.logger.verbose(`Persistent Subscription - ${sub.persistentSubscriptionName}:${sub.stream} already exists. Skipping creation.`);
                        return {
                            isLive: false,
                            isCreated: true,
                            stream: sub.stream,
                            subscription: sub.persistentSubscriptionName,
                        };
                    }
                    else {
                        this.logger.error(`[${sub.stream}][${sub.persistentSubscriptionName}] ${reason.message} ${reason.stack}`);
                        return {
                            isLive: false,
                            isCreated: false,
                            stream: sub.stream,
                            subscription: sub.persistentSubscriptionName,
                        };
                    }
                });
            });
            return await Promise.all(subs);
        }
        catch (e) {
            this.logger.error(e);
            return [];
        }
    }
    async subscribeToCatchUpSubscriptions(subscriptions) {
        this.catchupSubscriptionCount = subscriptions.length;
        this.catchupSubscriptions = await Promise.all(subscriptions.map((sub) => {
            return this.subscribeToCatchUpSubscription(sub.stream);
        }));
    }
    get allCatchupSubsriptionsLive() {
        const initialized = this.catchupSubscriptions.length === this.catchupSubscriptionCount;
        return (initialized &&
            this.catchupSubscriptions.every((sub) => {
                return !!sub && sub.isLive;
            }));
    }
    get allPersistentSubscriptionsLive() {
        const initialized = this.persistentSubscriptions.length === this.persistentSubscriptionsCount;
        return (initialized &&
            this.persistentSubscriptions.every((sub) => {
                return !!sub && sub.isLive;
            }));
    }
    get isLive() {
        return this.allCatchupSubsriptionsLive && this.allPersistentSubscriptionsLive;
    }
    async publish(event, stream) {
        try {
            this.logger.debug({
                message: `Publishing event`,
                event,
                stream,
            });
            this.client.writeEventToStream(stream || '$svc-catch-all', event.constructor.name, event);
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    async publishAll(events, stream) {
        try {
            this.logger.debug({
                message: `Publishing events`,
                events,
                stream,
            });
            this.client.writeEventsToStream(stream || '$svc.catch-all', events.map((ev) => {
                return {
                    contentType: 'application/json',
                    eventType: (event === null || event === void 0 ? void 0 : event.constructor.name) || '',
                    payload: event,
                };
            }));
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
    async subscribeToCatchUpSubscription(stream) {
        try {
            const resolved = (await this.client.subscribeToCatchupSubscription(stream));
            resolved
                .on('data', (ev) => this.onEvent(ev))
                .on('confirmation', () => this.logger.log(`[${stream}] Catch-Up subscription confirmation`))
                .on('close', () => this.logger.log(`[${stream}] Subscription closed`))
                .on('error', (err) => {
                this.logger.error({ stream, error: err, msg: `Subscription error` });
                this.onDropped(resolved);
            });
            this.logger.verbose(`Catching up and subscribing to stream ${stream}`);
            resolved.isLive = true;
            return resolved;
        }
        catch (e) {
            this.logger.error(`[${stream}] ${e} ${e}`);
            throw e;
        }
    }
    async subscribeToPersistentSubscription(stream, subscriptionName) {
        try {
            const resolved = await this.client.subscribeToPersistentSubscription(stream, subscriptionName);
            resolved
                .on('data', (ev) => {
                try {
                    this.onEvent(ev);
                    resolved.ack(ev || '');
                }
                catch (err) {
                    this.logger.error({
                        error: err,
                        msg: `Error handling event`,
                        event: ev,
                        stream,
                        subscriptionName,
                    });
                    resolved.nack('retry', err, ev || '');
                }
            })
                .on('confirmation', () => this.logger.log(`[${stream}][${subscriptionName}] Persistent subscription confirmation`))
                .on('close', () => {
                this.logger.log(`[${stream}][${subscriptionName}] Persistent subscription closed`);
                this.onDropped(resolved);
                this.reSubscribeToPersistentSubscription(stream, subscriptionName);
            })
                .on('error', (err) => {
                this.logger.error({ stream, subscriptionName, error: err, msg: `Persistent subscription error` });
                this.onDropped(resolved);
                this.reSubscribeToPersistentSubscription(stream, subscriptionName);
            });
            this.logger.verbose(`Connection to persistent subscription ${subscriptionName} on stream ${stream} established.`);
            const customResolved = Object.assign(Object.assign({}, resolved), { isLive: false, isCreated: true, stream: stream, subscription: subscriptionName });
            return customResolved;
        }
        catch (e) {
            this.logger.error(`[${stream}][${subscriptionName}] ${e}`);
            throw e;
        }
    }
    onEvent(payload) {
        const { event } = payload;
        if (!event || !event.isJson) {
            this.logger.error(`Received event that could not be resolved: ${event === null || event === void 0 ? void 0 : event.id}:${event === null || event === void 0 ? void 0 : event.streamId}`);
            return;
        }
        const { type, id, streamId, data } = event;
        const handler = this.eventHandlers[type];
        if (!handler) {
            this.logger.warn(`Received event that could not be handled: ${type}:${id}:${streamId}`);
            return;
        }
        const rawData = JSON.parse(JSON.stringify(data));
        const parsedData = Object.values(rawData);
        if (this.eventHandlers && this.eventHandlers[type || rawData.content.eventType]) {
            this.subject$.next(this.eventHandlers[type || rawData.content.eventType](...parsedData));
        }
        else {
            this.logger.warn(`Event of type ${type} not able to be handled.`);
        }
    }
    onDropped(sub) {
        sub.isLive = false;
    }
    reSubscribeToPersistentSubscription(stream, subscriptionName) {
        this.logger.warn(`Reconnecting to subscription ${subscriptionName} ${stream}...`);
        setTimeout((st, subName) => this.subscribeToPersistentSubscription(st, subName), 3000, stream, subscriptionName);
    }
    addEventHandlers(eventHandlers) {
        this.eventHandlers = Object.assign(Object.assign({}, this.eventHandlers), eventHandlers);
    }
    onModuleDestroy() {
        var _a;
        (_a = this.persistentSubscriptions) === null || _a === void 0 ? void 0 : _a.forEach((sub) => {
            if (!!(sub === null || sub === void 0 ? void 0 : sub.isLive)) {
                sub.unsubscribe();
            }
        });
    }
}
exports.EventStoreBus = EventStoreBus;
