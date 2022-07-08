import EventEmitter from 'events';

import Xss from '~/services/xss';

import { IGraphViewer } from './graph-viewer';
import { IInterceptorManager } from './interceptor-manager';

export type CustomWindow = Window
                         & typeof globalThis
                         & { interceptorManager: IInterceptorManager }
                         & { globalEmitter: EventEmitter }
                         & { GraphViewer: IGraphViewer };
