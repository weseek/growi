import EventEmitter from 'events';

import GrowiRenderer from '~/services/renderer/growi-renderer';
import Xss from '~/services/xss';

import { IGraphViewer } from './graph-viewer';
import { IInterceptorManager } from './interceptor-manager';

export type CustomWindow = Window
                         & typeof globalThis
                         & { interceptorManager: IInterceptorManager }
                         & { globalEmitter: EventEmitter }
                         & { GraphViewer: IGraphViewer }
                         & { growiRenderer: GrowiRenderer }
                         & { previewRenderer: GrowiRenderer }; // TODO: Remove this code when reveal.js is omitted. see: https://github.com/weseek/growi/pull/6223
