import { IPageForItem } from './page';


type ParentPath = string;
export interface AncestorsChildrenResult {
  ancestorsChildren: Record<ParentPath, Partial<IPageForItem>[]>
}

export type TargetAndAncestors = Partial<IPageForItem>[];

export interface ChildrenResult {
  children: Partial<IPageForItem>[]
}
