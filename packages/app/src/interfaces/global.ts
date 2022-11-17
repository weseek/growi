import EventEmitter from 'events';

export type CustomWindow = Window
                         & typeof globalThis
                         & { globalEmitter: EventEmitter };
