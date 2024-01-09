/* tslint:disable:max-classes-per-file */
import { AggregateRoot, IEvent } from '@nestjs/cqrs';
import { Constructor, EventStoreBusProvider } from '.';

import { AggregateEvent } from './interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventStorePublisher {
  constructor(private readonly eventBus: EventStoreBusProvider) {}

  mergeClassContext<T extends Constructor<AggregateRoot>>(metatype: T): T {
    const eventBus = this.eventBus;
    return class extends metatype {
      publish(event: IEvent) {
        eventBus.publish(event, (event as AggregateEvent).streamName);
      }

      publishAll(events: IEvent[]) {
        eventBus.publishAll(events);
      }
    };
  }

  mergeObjectContext<T extends AggregateRoot>(object: T): T {
    const eventBus = this.eventBus;
    object.publish = (event: IEvent) => {
      eventBus.publish(event, (event as AggregateEvent).streamName);
    };
    object.publishAll = (events: IEvent[]) => {
      eventBus.publishAll(events);
    };
    return object;
  }
}
