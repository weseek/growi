import { PageGrant } from './page';

export type IDataApplicableGroup = {
  applicableGroups?: {_id: string, name: string}[] // TODO: Typescriptize model
}

export type IDataApplicableGrant = null | IDataApplicableGroup;
export type IRecordApplicableGrant = Record<PageGrant, IDataApplicableGrant>
export type IResApplicableGrant = {
  data?: IRecordApplicableGrant
}
type IPageGrantData = {
  grant: number,
  grantedGroup?: {
    id: string,
    name: string
  }
}
export type IResIsGrantNormalizedGrantData = {
  isForbidden: boolean,
  currentPageGrant: IPageGrantData,
  parentPageGrant?: IPageGrantData
}
export type IResIsGrantNormalized = {
  isGrantNormalized: boolean,
  grantData: IResIsGrantNormalizedGrantData
};
