import { IPage } from './page';
import { HasObjectId } from './has-object-id';


type ParentPath = string;
export interface AncestorsChildrenResult {
  ancestorsChildren: Record<ParentPath, Partial<IPage & HasObjectId>[]>
}

export type TargetAndAncestors = Partial<IPage & HasObjectId>[];
