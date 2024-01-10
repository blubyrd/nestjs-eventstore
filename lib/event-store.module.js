"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventStoreModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreModule = void 0;
const common_1 = require("@nestjs/common");
const event_store_constants_1 = require("./event-store.constants");
const client_1 = require("./client");
const cqrs_1 = require("@nestjs/cqrs");
let EventStoreModule = EventStoreModule_1 = class EventStoreModule {
    static forRoot(options) {
        const connectionProviders = [
            {
                provide: event_store_constants_1.EVENT_STORE_CONNECTION_OPTIONS,
                useValue: Object.assign({}, options),
            },
        ];
        const clientProvider = {
            provide: client_1.EventStoreClient,
            useClass: client_1.EventStoreClient,
        };
        return {
            module: EventStoreModule_1,
            providers: [...connectionProviders, clientProvider],
            exports: [...connectionProviders, clientProvider],
        };
    }
};
EventStoreModule = EventStoreModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [client_1.EventStoreClient, cqrs_1.CqrsModule],
        exports: [client_1.EventStoreClient],
    })
], EventStoreModule);
exports.EventStoreModule = EventStoreModule;
