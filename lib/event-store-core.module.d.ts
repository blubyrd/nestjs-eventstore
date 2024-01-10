import 'reflect-metadata';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { EventStoreBusConfig } from '.';
import { EventStoreConnectionStringOptions, EventStoreDnsClusterOptions, EventStoreGossipClusterOptions, EventStoreSingleNodeOptions } from './interfaces';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ModuleRef } from '@nestjs/core';
export declare class EventStoreCoreModule implements OnModuleInit {
    private readonly explorerService;
    private readonly eventsBus;
    private readonly moduleRef;
    private readonly commandsBus;
    private readonly queryBus;
    private readonly logger;
    constructor(explorerService: ExplorerService, eventsBus: EventBus, moduleRef: ModuleRef, commandsBus: CommandBus, queryBus: QueryBus);
    onModuleInit(): void;
    static forRoot(options: EventStoreConnectionStringOptions | EventStoreDnsClusterOptions | EventStoreGossipClusterOptions | EventStoreSingleNodeOptions, eventStoreBusConfigs: EventStoreBusConfig[]): DynamicModule;
    private static createEventBusProviders;
}
