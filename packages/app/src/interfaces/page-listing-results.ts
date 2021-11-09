import { IPage } from './page';

export interface SiblingsResult {
  targetAndSiblings: Partial<IPage>[]
}


export interface AncestorsResult {
  ancestors: Partial<IPage>[]
}
