import { IPageForItem, IPageHasId } from './page';


type ParentPath = string;

export interface RootPageResult {
  rootPage: IPageHasId
}

export interface AncestorsChildrenResult {
  ancestorsChildren: Record<ParentPath, Partial<IPageForItem>[]>
}


export interface ChildrenResult {
  children: Partial<IPageForItem>[]
}


export interface TargetAndAncestors {
  targetAndAncestors: Partial<IPageForItem>[]
  rootPage: Partial<IPageForItem>,
}


export interface V5MigrationStatus {
  isV5Compatible : boolean,
  migratablePagesCount: number
}
