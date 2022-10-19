import { OptionsToSave } from '~/interfaces/editor-settings';

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
