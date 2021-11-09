import { IPage } from './page';


type ParentPath = string;
export interface AncestorsChildrenResult {
  ancestorsChildren: Record<ParentPath, Partial<IPage>[]>
}


export interface TargetAndAncestorsResult {
  targetAndAncestors: Partial<IPage>[]
}
