import EditorContainer from '~/client/services/EditorContainer';

type OptionsToSave = {
  isSlackEnabled: boolean;
  slackChannels: string;
  grant: number;
  pageTags: string[];
  grantUserGroupId?: string;
};

type UseOptionsToSaveProps = {
  isSlackEnabled: boolean;
  slackChannels: string;
  editorContainer: EditorContainer;
};

// TODO: Remove editorContainer upon migration to SWR
export const getOptionsToSave = ({ isSlackEnabled, slackChannels, editorContainer }: UseOptionsToSaveProps): OptionsToSave => {
  const optionsToSave = editorContainer.getCurrentOptionsToSave();
  return { ...optionsToSave, ...{ isSlackEnabled }, ...{ slackChannels } };
};
