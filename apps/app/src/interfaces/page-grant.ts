import { PageGrant, GroupType } from '@growi/core';

import { ExternalUserGroupDocument } from '~/features/external-user-group/server/models/external-user-group';
import { UserGroupDocument } from '~/server/models/user-group';

import { IPageGrantData } from './page';

export type IDataApplicableGroup = {
  applicableGroups?: {type: GroupType, item: UserGroupDocument | ExternalUserGroupDocument }[]
}

export type IDataApplicableGrant = null | IDataApplicableGroup;
export type IRecordApplicableGrant = Partial<Record<PageGrant, IDataApplicableGrant>>
export type IResApplicableGrant = {
  data?: IRecordApplicableGrant
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
