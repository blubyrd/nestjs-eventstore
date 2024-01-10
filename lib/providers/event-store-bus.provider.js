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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventStoreBusProvider = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const constants_1 = require("@nestjs/cqrs/dist/decorators/constants");
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const event_store_bus_1 = require("../event-store.bus");
const client_1 = require("../client");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
let EventStoreBusProvider = class EventStoreBusProvider extends cqrs_1.ObservableBus {
    constructor(commandBus, moduleRef, client, config) {
        super();
        this.commandBus = commandBus;
        this.moduleRef = moduleRef;
        this.client = client;
        this.config = config;
        this.logger = new common_1.Logger(this.constructor.name);
        this.subscriptions = [];
        this._publisher = new event_store_bus_1.EventStoreBus(this.client, this.subject$, this.config);
    }
    get publisher() {
        return this._publisher;
    }
    set publisher(_publisher) {
        this._publisher = _publisher;
    }
    onModuleDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }
    publish(event, stream) {
        this._publisher.publish(event, stream);
    }
    publishAll(events) {
        (events || []).forEach((ev) => this._publisher.publish(ev, ev.streamName || '$svc-catch-all'));
    }
    bind(handler, name) {
        const stream$ = name ? this.ofEventName(name) : this.subject$;
        const subscription = stream$.subscribe((ev) => handler.handle(ev));
        this.subscriptions.push(subscription);
    }
    registerSagas(types = []) {
        const sagas = types
            .map((target) => {
            const metadata = Reflect.getMetadata(constants_1.SAGA_METADATA, target) || [];
            const instance = this.moduleRef.get(target, { strict: false });
            if (!instance) {
                throw new cqrs_1.InvalidSagaException();
            }
            return metadata.map((k) => instance[k]);
        })
            .reduce((a, b) => a.concat(b), []);
        sagas.forEach((saga) => this.registerSaga(saga));
    }
    register(handlers = []) {
        handlers.forEach((hand) => this.registerHandler(hand));
    }
    registerHandler(handler) {
        const instance = this.moduleRef.get(handler, { strict: false });
        if (!instance) {
            return;
        }
        const eventsNames = this.reflectEventsNames(handler);
        eventsNames.map((ev) => this.bind(instance, ev.name));
    }
    ofEventName(name) {
        return this.subject$.pipe((0, operators_1.filter)((ev) => this.getEventName(ev) === name));
    }
    getEventName(event) {
        const { constructor } = Object.getPrototypeOf(event);
        return constructor.name;
    }
    registerSaga(saga) {
        if (!(typeof saga === 'function')) {
            throw new cqrs_1.InvalidSagaException();
        }
        const stream$ = saga(this);
        this.logger.log(stream$ instanceof rxjs_1.Observable);
        // if (!(stream$ instanceof Observable)) {
        //   throw new InvalidSagaException();
        // }
        const subscription = stream$.pipe((0, operators_1.filter)((e) => !!e)).subscribe((command) => this.commandBus.execute(command));
        this.subscriptions.push(subscription);
    }
    reflectEventsNames(handler) {
        return Reflect.getMetadata(constants_1.EVENTS_HANDLER_METADATA, handler);
    }
};
EventStoreBusProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        core_1.ModuleRef,
        client_1.EventStoreClient, Object])
], EventStoreBusProvider);
exports.EventStoreBusProvider = EventStoreBusProvider;
