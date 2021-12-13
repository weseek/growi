import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import loggerFactory from '~/utils/logger';

import PageContainer from '~/client/services/PageContainer';
import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';

import { withUnstatedContainers } from './UnstatedUtils';
import GrantSelector from './SavePageControls/GrantSelector';

// TODO: remove this when omitting unstated is completed
import { useEditorMode } from '~/stores/ui';

import {
  useIsEditable, useSlackChannels, useGrant, useGrantGroupId, useGrantGroupName,
} from '~/stores/context';
import { useIsSlackEnabled } from '~/stores/editor';

const logger = loggerFactory('growi:SavePageControls');

class SavePageControls extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.appContainer.getConfig();
    this.isAclEnabled = config.isAclEnabled;

    this.updateGrantHandler = this.updateGrantHandler.bind(this);

    this.save = this.save.bind(this);
    this.saveAndOverwriteScopesOfDescendants = this.saveAndOverwriteScopesOfDescendants.bind(this);

  }

  updateGrantHandler(data) {
    const { mutateGrant, mutateGrantGroupId, mutateGrantGroupName } = this.props;
    // this.props.editorContainer.setState(data);
    mutateGrant(data.grant);
    mutateGrantGroupId(data.grantGroupId);
    mutateGrantGroupName(data.grantGroupName);
  }

  // TODO: Create mediator and remove this when omitting unstated is completed
  getCurrentOptionsToSave() {
    const { isSlackEnabled, slackChannels, editorContainer } = this.props;
    const optionsToSave = editorContainer.getCurrentOptionsToSave();
    return { ...optionsToSave, ...{ isSlackEnabled }, ...{ slackChannels } };
  }

  async save() {
    const { pageContainer, editorContainer } = this.props;
    // disable unsaved warning
    editorContainer.disableUnsavedWarning();

    try {
      // save
      await pageContainer.saveAndReload(this.getCurrentOptionsToSave(), this.props.editorMode);
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
    }
  }

  saveAndOverwriteScopesOfDescendants() {
    const { pageContainer, editorContainer } = this.props;
    // disable unsaved warning
    editorContainer.disableUnsavedWarning();
    // save
    const optionsToSave = Object.assign(this.getCurrentOptionsToSave(), {
      overwriteScopesOfDescendants: true,
    });
    pageContainer.saveAndReload(optionsToSave, this.props.editorMode);
  }

  render() {

    const {
      t, pageContainer, grant, grantGroupId, grantGroupName, editorContainer,
    } = this.props;

    const isRootPage = pageContainer.state.path === '/';
    const labelSubmitButton = pageContainer.state.pageId == null ? t('Create') : t('Update');
    const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

    return (
      <div className="d-flex align-items-center form-inline flex-nowrap">

        {this.isAclEnabled
          && (
            <div className="mr-2">
              <GrantSelector
                disabled={isRootPage}
                grant={editorContainer.state.grant}
                grantGroupId={editorContainer.state.grantGroupId}
                grantGroupName={editorContainer.state.grantGroupName}
                // grant={grant}
                // grantGroupId={grantGroupId}
                // grantGroupName={grantGroupName}
                onUpdateGrant={this.updateGrantHandler}
              />
            </div>
          )
        }

        <UncontrolledButtonDropdown direction="up">
          <Button id="caret" color="primary" className="btn-submit" onClick={this.save}>{labelSubmitButton}</Button>
          <DropdownToggle caret color="primary" />
          <DropdownMenu right>
            <DropdownItem onClick={this.saveAndOverwriteScopesOfDescendants}>
              {labelOverwriteScopes}
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledButtonDropdown>

      </div>
    );
  }

}

/**
 * Wrapper component for using unstated
 */
const SavePageControlsHOCWrapper = withUnstatedContainers(SavePageControls, [AppContainer, PageContainer, EditorContainer]);

const SavePageControlsWrapper = (props) => {
  const { data: isEditable } = useIsEditable();
  const { data: editorMode } = useEditorMode();
  const { data: isSlackEnabled } = useIsSlackEnabled();
  const { data: slackChannels } = useSlackChannels();
  const { data: grant, mutate: mutateGrant } = useGrant();
  const { data: grantGroupId, mutate: mutateGrantGroupId } = useGrantGroupId();
  const { data: grantGroupName, mutate: mutateGrantGroupName } = useGrantGroupName();

  if (isEditable == null || editorMode == null || grant == null || grantGroupId == null || grantGroupName == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  return (
    <SavePageControlsHOCWrapper
      {...props}
      editorMode={editorMode}
      isSlackEnabled={isSlackEnabled}
      slackChannels={slackChannels}
      grant={grant}
      grantGroupId={grantGroupId}
      grantGroupName={grantGroupName}
      mutateGrant={mutateGrant}
      mutateGrantGroupId={mutateGrantGroupId}
      mutateGrantGroupName={mutateGrantGroupName}
    />
  );
};

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  editorContainer: PropTypes.instanceOf(EditorContainer).isRequired,

  // TODO: remove this when omitting unstated is completed
  editorMode: PropTypes.string.isRequired,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string.isRequired,
  grantGroupName: PropTypes.string.isRequired,
  mutateGrant: PropTypes.func.isRequired,
  mutateGrantGroupId: PropTypes.func.isRequired,
  mutateGrantGroupName: PropTypes.func.isRequired,
};

export default withTranslation()(SavePageControlsWrapper);
