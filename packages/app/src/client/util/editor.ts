type OptionsToSave = {
  isSlackEnabled: boolean;
  slackChannels: string;
  grant: number;
  pageTags: string[];
  grantUserGroupId: string | null;
  grantUserGroupName: string | null;
};

export const getOptionsToSave = (
    isSlackEnabled: boolean,
    slackChannels: string,
    grant: number,
    grantUserGroupId: string | null,
    grantUserGroupName: string | null,
    pageTags: string[],
): OptionsToSave => {
  return {
    isSlackEnabled,
    slackChannels,
    grant,
    grantUserGroupId,
    grantUserGroupName,
    pageTags,
  };
};
