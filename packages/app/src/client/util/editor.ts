type OptionsToSave = {
  isSlackEnabled: boolean;
  slackChannels: string;
  grant: number;
  pageTags: string[] | null;
  grantUserGroupId?: string | null;
  grantUserGroupName?: string | null;
  isSyncRevisionToHackmd?: boolean;
};

export const getOptionsToSave = (
    isSlackEnabled: boolean,
    slackChannels: string,
    grant: number,
    grantUserGroupId: string | null | undefined,
    grantUserGroupName: string | null | undefined,
    pageTags: string[],
    isSyncRevisionToHackmd?: boolean,
): OptionsToSave => {
  return {
    pageTags,
    isSlackEnabled,
    slackChannels,
    grant,
    grantUserGroupId,
    grantUserGroupName,
    isSyncRevisionToHackmd,
  };
};
