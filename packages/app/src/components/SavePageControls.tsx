import React from 'react';

import { pagePathUtils } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

// import PageContainer from '~/client/services/PageContainer';
import { getOptionsToSave } from '~/client/util/editor';
import { CustomWindow } from '~/interfaces/global';
import {
  useCurrentPagePath, useIsEditable, useCurrentPageId, useIsAclEnabled,
} from '~/stores/context';
import { usePageTagsForEditors, useIsEnabledUnsavedWarning } from '~/stores/editor';
import { useSWRxCurrentPage } from '~/stores/page';
import { useSelectedGrant } from '~/stores/ui';
import loggerFactory from '~/utils/logger';
import { IPageGrantData } from '~/interfaces/page';

import GrantSelector from './SavePageControls/GrantSelector';

// import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:SavePageControls');

type Props = {
  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  // TODO: remove this when omitting unstated is completed
  isSlackEnabled: boolean,
  slackChannels: string,
}

const { isTopPage } = pagePathUtils;

export const SavePageControls = (props: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: pageId } = useCurrentPageId();
  const { data: pageTags } = usePageTagsForEditors(pageId);
  const { mutate: mutateIsEnabledUnsavedWarning } = useIsEnabledUnsavedWarning();


  if (isEditable == null || isAclEnabled == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  const grant = grantData?.grant || 1;
  const grantedGroup = grantData?.grantedGroup;

  const {
    isSlackEnabled, slackChannels,
    // pageContainer,
  } = props;

  const updateGrantHandler = (grantData: IPageGrantData): void => {
    mutateGrant(grantData);
  };

  const save = async(): Promise<void> => {
    // disable unsaved warning
    mutateIsEnabledUnsavedWarning(false);

    try {
      // save
      (window as CustomWindow).globalEmitter.emit('saveAndReload');
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
  };

  const saveAndOverwriteScopesOfDescendants = () => {
    // disable unsaved warning
    mutateIsEnabledUnsavedWarning(false);
    // save
    // const currentOptionsToSave = getOptionsToSave(isSlackEnabled, slackChannels, grant, grantedGroup?.id, grantedGroup?.name, pageTags || []);
    // const optionsToSave = Object.assign(currentOptionsToSave, {
    //   overwriteScopesOfDescendants: true,
    // });
    (window as CustomWindow).globalEmitter.emit('saveAndReload', { overwriteScopesOfDescendants: true });
    // pageContainer.saveAndReload(optionsToSave, this.props.editorMode);
  };

  const isRootPage = isTopPage(currentPagePath ?? '');
  const labelSubmitButton = pageId == null ? t('Create') : t('Update');
  const labelOverwriteScopes = t('page_edit.overwrite_scopes', { operation: labelSubmitButton });

  return (
    <div className="d-flex align-items-center form-inline flex-nowrap">

      {isAclEnabled
          && (
            <div className="mr-2">
              <GrantSelector
                grant={grant}
                disabled={isRootPage}
                grantGroupId={grantedGroup?.id}
                grantGroupName={grantedGroup?.name}
                onUpdateGrant={updateGrantHandler}
              />
            </div>
          )
      }

      <UncontrolledButtonDropdown direction="up">
        <Button id="caret" color="primary" className="btn-submit" onClick={save}>
          {labelSubmitButton}
        </Button>
        <DropdownToggle caret color="primary" />
        <DropdownMenu right>
          <DropdownItem onClick={saveAndOverwriteScopesOfDescendants}>
            {labelOverwriteScopes}
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

    </div>
  );
};

export default SavePageControls;
