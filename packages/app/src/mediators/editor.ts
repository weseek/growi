import EditorContainer from '~/client/services/EditorContainer';

type OptionsToSave = {
  isSlackEnabled: boolean;
  slackChannels: string;
  grant: number;
  pageTags: string[];
  grantUserGroupId?: string;
};

// TODO: Remove editorContainer upon migration to SWR
export const getOptionsToSave = (isSlackEnabled: boolean, slackChannels: string, editorContainer: EditorContainer): OptionsToSave => {
  const optionsToSave = editorContainer.getCurrentOptionsToSave();
  return { ...optionsToSave, ...{ isSlackEnabled }, ...{ slackChannels } };
};
