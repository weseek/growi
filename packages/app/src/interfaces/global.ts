import InterceptorManager from '~/services/interceptor-manager';
import Xss from '~/services/xss';

export type CustomWindow = Window & typeof globalThis & { xss: Xss } & { interceptorManager: InterceptorManager };
