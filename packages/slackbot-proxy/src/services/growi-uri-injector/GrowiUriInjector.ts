
export interface GrowiUriInjector {

  handleInject(type:string):boolean

  inject(body: any, growiUri:string): void;

  extract(body: any):any;
}
