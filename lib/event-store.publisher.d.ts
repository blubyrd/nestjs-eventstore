import { AggregateRoot } from '@nestjs/cqrs';
import { Constructor, EventStoreBusProvider } from '.';
export declare class EventStorePublisher {
    private readonly eventBus;
    constructor(eventBus: EventStoreBusProvider);
    mergeClassContext<T extends Constructor<AggregateRoot>>(metatype: T): T;
    mergeObjectContext<T extends AggregateRoot>(object: T): T;
}
