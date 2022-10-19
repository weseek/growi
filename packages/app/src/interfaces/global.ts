import EventEmitter from 'events';

import { IGraphViewer } from './graph-viewer';

export type CustomWindow = Window
                         & typeof globalThis
                         & { globalEmitter: EventEmitter }
                         & { GraphViewer: IGraphViewer };
