import { AppendResult, PersistentSubscriptionToStream, ReadRevision, StreamSubscription } from '@eventstore/db-client';
import { EventStoreConnectionStringOptions, EventStoreDnsClusterOptions, EventStoreEvent, EventStoreGossipClusterOptions, EventStoreSingleNodeOptions } from '../interfaces';
import { PersistentSubscriptionToStreamSettings } from '@eventstore/db-client/dist/persistentSubscription/utils/persistentSubscriptionSettings';
export declare class EventStoreClient {
    [x: string]: any;
    private logger;
    private client;
    constructor(options: EventStoreConnectionStringOptions | EventStoreDnsClusterOptions | EventStoreGossipClusterOptions | EventStoreSingleNodeOptions);
    writeEventToStream(streamName: string, eventType: string, payload: any, metadata?: any): Promise<AppendResult>;
    writeEventsToStream(streamName: string, events: EventStoreEvent[]): Promise<AppendResult>;
    createPersistentSubscription(streamName: string, persistentSubscriptionName: string, settings: PersistentSubscriptionToStreamSettings): Promise<void>;
    subscribeToPersistentSubscription(streamName: string, persistentSubscriptionName: string): Promise<PersistentSubscriptionToStream>;
    subscribeToCatchupSubscription(streamName: string, fromRevision?: ReadRevision): Promise<StreamSubscription>;
    subscribeToVolatileSubscription(streamName: string): Promise<StreamSubscription>;
}
