
export interface GrowiUriInjector {

  inject(body: any, growiUri:string): any;

  extract(body: any): string;
}
