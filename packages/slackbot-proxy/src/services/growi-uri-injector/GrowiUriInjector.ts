
export interface GrowiUriInjector {

  inject(body: any, growiUri:string): void;

  extract(body: any): string|void;
}
