interface BasicInterceptor {
  isInterceptWhen: (contextName: string) => boolean,
  isProcessableParallel: () => boolean,
  process: (contextName: string, args: any) => Promise<any>
}

export interface IInterceptorManager {
  addInterceptor: (inerceptor: BasicInterceptor, order: number) => void,
  addInterceptors: (inerceptors: BasicInterceptor[], order: number) => void,
  process: (contextName: string, args: any) => void,
  doProcess: (inerceptor: BasicInterceptor, contextName: string, args: any) => void
}
