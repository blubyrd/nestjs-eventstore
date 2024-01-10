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
var EventStoreCoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreCoreModule = void 0;
require("reflect-metadata");
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const _1 = require(".");
const client_1 = require("./client");
const event_store_module_1 = require("./event-store.module");
const event_store_publisher_1 = require("./event-store.publisher");
const explorer_service_1 = require("@nestjs/cqrs/dist/services/explorer.service");
const core_1 = require("@nestjs/core");
let EventStoreCoreModule = EventStoreCoreModule_1 = class EventStoreCoreModule {
    constructor(explorerService, eventsBus, moduleRef, commandsBus, queryBus) {
        this.explorerService = explorerService;
        this.eventsBus = eventsBus;
        this.moduleRef = moduleRef;
        this.commandsBus = commandsBus;
        this.queryBus = queryBus;
        this.logger = new common_1.Logger(this.constructor.name);
    }
    onModuleInit() {
        const { events, queries, sagas, commands } = this.explorerService.explore();
        this.eventsBus.register(events);
        this.commandsBus.register(commands);
        this.queryBus.register(queries);
        this.eventsBus.registerSagas(sagas);
    }
    static forRoot(options, eventStoreBusConfigs) {
        const eventBusProvider = this.createEventBusProviders(eventStoreBusConfigs);
        return {
            module: EventStoreCoreModule_1,
            imports: [event_store_module_1.EventStoreModule.forRoot(options)],
            providers: [
                cqrs_1.CommandBus,
                cqrs_1.QueryBus,
                event_store_publisher_1.EventStorePublisher,
                explorer_service_1.ExplorerService,
                eventBusProvider,
                {
                    provide: _1.EventStoreBusProvider,
                    useExisting: cqrs_1.EventBus,
                },
            ],
            exports: [
                event_store_module_1.EventStoreModule,
                _1.EventStoreBusProvider,
                cqrs_1.EventBus,
                cqrs_1.CommandBus,
                cqrs_1.QueryBus,
                explorer_service_1.ExplorerService,
                event_store_publisher_1.EventStorePublisher,
            ],
        };
    }
    static createEventBusProviders(configs) {
        let events = {};
        configs.forEach((c) => {
            events = Object.assign(Object.assign({}, events), c.events);
        });
        const subscriptions = configs
            .map((c) => {
            return c.subscriptions;
        })
            .reduce((a, b) => a.concat(b), []);
        return {
            provide: cqrs_1.EventBus,
            useFactory: (commandBus, moduleRef, client) => {
                return new _1.EventStoreBusProvider(commandBus, moduleRef, client, {
                    subscriptions,
                    events,
                });
            },
            inject: [cqrs_1.CommandBus, core_1.ModuleRef, client_1.EventStoreClient],
        };
    }
};
EventStoreCoreModule = EventStoreCoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({}),
    __metadata("design:paramtypes", [explorer_service_1.ExplorerService,
        cqrs_1.EventBus,
        core_1.ModuleRef,
        cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EventStoreCoreModule);
exports.EventStoreCoreModule = EventStoreCoreModule;
