import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import EditorContainer from '~/client/services/EditorContainer';
import PageContainer from '~/client/services/PageContainer';
import { getOptionsToSave } from '~/client/util/editor';

// TODO: remove this when omitting unstated is completed
import { useIsEditable, useCurrentPageId } from '~/stores/context';
import { usePageTagsForEditors } from '~/stores/editor';
import {
  useEditorMode, useSelectedGrant, useSelectedGrantGroupId, useSelectedGrantGroupName,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import GrantSelector from './SavePageControls/GrantSelector';
import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:SavePageControls');

class SavePageControls extends React.Component {

  constructor(props) {
    super(props);

    const config = this.props.appContainer.getConfig();
    this.isAclEnabled = config.isAclEnabled;

    this.updateGrantHandler = this.updateGrantHandler.bind(this);

    this.save = this.save.bind(this);

  }

  updateGrantHandler(data) {
    const { mutateGrant, mutateGrantGroupId, mutateGrantGroupName } = this.props;

    mutateGrant(data.grant);
    mutateGrantGroupId(data.grantGroupId);
    mutateGrantGroupName(data.grantGroupName);
  }

  async save(overwriteScopesOfDescendants = false) {
    const {
      isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageContainer, editorContainer, pageTags,
    } = this.props;
    // disable unsaved warning
    editorContainer.disableUnsavedWarning();

    try {
      // save
      const optionsToSave = {
        ...getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags),
        overwriteScopesOfDescendants,
      };
      await pageContainer.saveAndReload(optionsToSave, this.props.editorMode);
    }
    catch (error) {
      logger.error('failed to save', error);
      pageContainer.showErrorToastr(error);
      if (error.code === 'conflict') {
        pageContainer.setState({
          remoteRevisionId: error.data.revisionId,
          remoteRevisionBody: error.data.revisionBody,
          remoteRevisionUpdateAt: error.data.createdAt,
          lastUpdateUser: error.data.user,
        });
      }
    }
  }

  render() {

    const {
      t, pageContainer, grant, grantGroupId, grantGroupName,
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
                grant={grant}
                grantGroupId={grantGroupId}
                grantGroupName={grantGroupName}
                onUpdateGrant={this.updateGrantHandler}
              />
            </div>
          )
        }

        <UncontrolledButtonDropdown direction="up">
          <Button data-testid="save-page-btn" id="caret" color="primary" className="btn-submit" onClick={() => this.save()}>{labelSubmitButton}</Button>
          <DropdownToggle caret color="primary" />
          <DropdownMenu right>
            <DropdownItem onClick={() => this.save(true)}>
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
  const { t } = useTranslation();
  const { data: isEditable } = useIsEditable();
  const { data: editorMode } = useEditorMode();
  const { data: grant, mutate: mutateGrant } = useSelectedGrant();
  const { data: grantGroupId, mutate: mutateGrantGroupId } = useSelectedGrantGroupId();
  const { data: grantGroupName, mutate: mutateGrantGroupName } = useSelectedGrantGroupName();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags } = usePageTagsForEditors(pageId);


  if (isEditable == null || editorMode == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  return (
    <SavePageControlsHOCWrapper
      t={t}
      {...props}
      editorMode={editorMode}
      grant={grant}
      grantGroupId={grantGroupId}
      grantGroupName={grantGroupName}
      mutateGrant={mutateGrant}
      mutateGrantGroupId={mutateGrantGroupId}
      mutateGrantGroupName={mutateGrantGroupName}
      pageTags={pageTags}
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
  pageTags: PropTypes.arrayOf(PropTypes.string),
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,
  mutateGrant: PropTypes.func,
  mutateGrantGroupId: PropTypes.func,
  mutateGrantGroupName: PropTypes.func,
};

export default SavePageControlsWrapper;
