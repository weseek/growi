import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

// import PageContainer from '~/client/services/PageContainer';
import { getOptionsToSave } from '~/client/util/editor';
import { useIsEditable, useCurrentPageId, useIsAclEnabled } from '~/stores/context';
import { usePageTagsForEditors, useIsEnabledUnsavedWarning } from '~/stores/editor';
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

    this.updateGrantHandler = this.updateGrantHandler.bind(this);

    this.save = this.save.bind(this);
    this.saveAndOverwriteScopesOfDescendants = this.saveAndOverwriteScopesOfDescendants.bind(this);

  }

  updateGrantHandler(data) {
    const { mutateGrant, mutateGrantGroupId, mutateGrantGroupName } = this.props;

    mutateGrant(data.grant);
    mutateGrantGroupId(data.grantGroupId);
    mutateGrantGroupName(data.grantGroupName);
  }

  async save() {
    const {
      isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, /* pageContainer, */ pageTags, mutateIsEnabledUnsavedWarning,
    } = this.props;
    // disable unsaved warning
    mutateIsEnabledUnsavedWarning(false);

    try {
      // save
      const optionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);
      // await pageContainer.saveAndReload(optionsToSave, this.props.editorMode);
    }
    catch (error) {
      logger.error('failed to save', error);
      // pageContainer.showErrorToastr(error);
      if (error.code === 'conflict') {
        // pageContainer.setState({
        //   remoteRevisionId: error.data.revisionId,
        //   remoteRevisionBody: error.data.revisionBody,
        //   remoteRevisionUpdateAt: error.data.createdAt,
        //   lastUpdateUser: error.data.user,
        // });
      }
    }
  }

  saveAndOverwriteScopesOfDescendants() {
    const {
      isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, /* pageContainer, */ pageTags, mutateIsEnabledUnsavedWarning,
    } = this.props;
    // disable unsaved warning
    mutateIsEnabledUnsavedWarning(false);
    // save
    const currentOptionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantGroupId, grantGroupName, pageTags);
    const optionsToSave = Object.assign(currentOptionsToSave, {
      overwriteScopesOfDescendants: true,
    });
    // pageContainer.saveAndReload(optionsToSave, this.props.editorMode);
  }

  render() {

    const {
      t, /* pageContainer, */ isAclEnabled, grant, grantGroupId, grantGroupName,
    } = this.props;

    // const isRootPage = pageContainer.state.path === '/';
    // const labelSubmitButton = pageContainer.state.pageId == null ? t('Create') : t('Update');
    // const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

    return (
      <div className="d-flex align-items-center form-inline flex-nowrap">

        {isAclEnabled
          && (
            <div className="mr-2">
              <GrantSelector
                // disabled={isRootPage}
                grant={grant}
                grantGroupId={grantGroupId}
                grantGroupName={grantGroupName}
                onUpdateGrant={this.updateGrantHandler}
              />
            </div>
          )
        }

        <UncontrolledButtonDropdown direction="up">
          <Button id="caret" color="primary" className="btn-submit" onClick={this.save}>
          labelSubmitButton
            {/* {labelSubmitButton} */}
          </Button>
          <DropdownToggle caret color="primary" />
          <DropdownMenu right>
            <DropdownItem onClick={this.saveAndOverwriteScopesOfDescendants}>
            labelOverwriteScopes
              {/* {labelOverwriteScopes} */}
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
// const SavePageControlsHOCWrapper = withUnstatedContainers(SavePageControls, [PageContainer]);

const SavePageControlsWrapper = (props) => {
  const { t } = useTranslation();
  const { data: isEditable } = useIsEditable();
  const { data: editorMode } = useEditorMode();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grant, mutate: mutateGrant } = useSelectedGrant();
  const { data: grantGroupId, mutate: mutateGrantGroupId } = useSelectedGrantGroupId();
  const { data: grantGroupName, mutate: mutateGrantGroupName } = useSelectedGrantGroupName();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags } = usePageTagsForEditors(pageId);
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();


  if (isEditable == null || editorMode == null || isAclEnabled == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  return (
    // <SavePageControlsHOCWrapper
    <SavePageControls
      t={t}
      {...props}
      editorMode={editorMode}
      isAclEnabled={isAclEnabled}
      grant={grant}
      grantGroupId={grantGroupId}
      grantGroupName={grantGroupName}
      mutateGrant={mutateGrant}
      mutateGrantGroupId={mutateGrantGroupId}
      mutateGrantGroupName={mutateGrantGroupName}
      mutateIsEnabledUnsavedWarning={mutateIsEnabledUnsavedWarning}
      pageTags={pageTags}
    />
  );
};

SavePageControls.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  // TODO: remove this when omitting unstated is completed
  editorMode: PropTypes.string.isRequired,
  isSlackEnabled: PropTypes.bool.isRequired,
  slackChannels: PropTypes.string.isRequired,
  pageTags: PropTypes.arrayOf(PropTypes.string),
  isAclEnabled: PropTypes.bool.isRequired,
  grant: PropTypes.number.isRequired,
  grantGroupId: PropTypes.string,
  grantGroupName: PropTypes.string,
  mutateGrant: PropTypes.func,
  mutateGrantGroupId: PropTypes.func,
  mutateGrantGroupName: PropTypes.func,
  mutateIsEnabledUnsavedWarning: PropTypes.func,
};

export default SavePageControlsWrapper;
