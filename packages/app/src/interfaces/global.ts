import EventEmitter from 'events';

import { GrowiFacade } from '@growi/core';

import { IGraphViewer } from './graph-viewer';

export type CustomWindow = Window
                        & typeof globalThis
                        & {
                          pluginActivators: {
                            [key: string]: {
                              activate: () => void,
                              deactivate: () => void,
                            },
                          },
                          growiFacade: GrowiFacade,
                          globalEmitter: EventEmitter,
                          GraphViewer: IGraphViewer,
                        }
