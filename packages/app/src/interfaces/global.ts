import EventEmitter from 'events';

import { GrowiFacade } from '@growi/core';

import { IGraphViewer } from './graph-viewer';

export type CustomWindow = Window
                         & typeof globalThis
                         & { growiFacade: GrowiFacade }
                         & { globalEmitter: EventEmitter }
                         & { GraphViewer: IGraphViewer };
