import { IPage } from './page';

export interface ChildrenResult {
  pages: Partial<IPage>[]
}


type ParentPath = string;
export interface AncestorsChildrenResult {
  ancestorsChildren: Record<ParentPath, Partial<IPage>[]>
}


export interface TargetAndAncestorsResult {
  targetAndAncestors: Partial<IPage>[]
}
