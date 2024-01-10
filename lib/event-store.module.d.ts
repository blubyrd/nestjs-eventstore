import { DynamicModule } from '@nestjs/common';
import { EventStoreConnectionStringOptions, EventStoreDnsClusterOptions, EventStoreGossipClusterOptions, EventStoreSingleNodeOptions } from './interfaces';
export declare class EventStoreModule {
    static forRoot(options: EventStoreConnectionStringOptions | EventStoreDnsClusterOptions | EventStoreGossipClusterOptions | EventStoreSingleNodeOptions): DynamicModule;
}
