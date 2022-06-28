type OptionsToSave = {
  isSlackEnabled: boolean;
  slackChannels: string;
  grant: number;
  pageTags: string[] | null;
  grantUserGroupId?: string | null;
  grantUserGroupName?: string | null;
};

export const getOptionsToSave = (
    isSlackEnabled: boolean,
    slackChannels: string,
    grant: number,
    grantUserGroupId: string | null | undefined,
    grantUserGroupName: string | null | undefined,
    pageTags: string[],
): OptionsToSave => {
  return {
    pageTags,
    isSlackEnabled,
    slackChannels,
    grant,
    grantUserGroupId,
    grantUserGroupName,
  };
};

export const isEnabledShowUnsavedWarning = (bool = false) => {
  return bool;
}

export const showAlertDialog = (msg): void => {
  if(isEnabledShowUnsavedWarning()){
    return window.alert(msg);
  }
};
