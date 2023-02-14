interface BasicInterceptor {
  getId: () => string,
  isInterceptWhen: (contextName: string) => boolean,
  isProcessableParallel: () => boolean,
  process: (contextName: string, args: any) => Promise<any>
}

export interface IInterceptorManager {
  interceptorAndOrders: {interceptor: BasicInterceptor, order: number}[],
  interceptors: BasicInterceptor[],
  addInterceptor: (inerceptor: BasicInterceptor, order: number) => void,
  addInterceptors: (inerceptors: BasicInterceptor[], order: number) => void,
  process: (contextName: string, args: any) => Promise<void>,
  doProcess: (inerceptor: BasicInterceptor, contextName: string, args: any) => Promise<void>
}
