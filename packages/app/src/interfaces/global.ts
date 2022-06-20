import Xss from '~/services/xss';

import { IInterceptorManager } from './interceptor-manager';

export type CustomWindow = Window & typeof globalThis & { xss: Xss } & { interceptorManager: IInterceptorManager };
