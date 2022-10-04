import React, { useCallback } from 'react';

import { pagePathUtils, PageGrant } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledButtonDropdown, Button,
  DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

// import PageContainer from '~/client/services/PageContainer';
import { CustomWindow } from '~/interfaces/global';
import { IPageGrantData } from '~/interfaces/page';
import {
  useCurrentPagePath, useIsEditable, useCurrentPageId, useIsAclEnabled,
} from '~/stores/context';
import { useIsEnabledUnsavedWarning } from '~/stores/editor';
import { useSelectedGrant } from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import GrantSelector from './SavePageControls/GrantSelector';

// import { withUnstatedContainers } from './UnstatedUtils';

const logger = loggerFactory('growi:SavePageControls');

type Props = {
  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
}

const { isTopPage } = pagePathUtils;

export const SavePageControls = (props: Props): JSX.Element | null => {
  const { t } = useTranslation();
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: isEditable } = useIsEditable();
  const { data: isAclEnabled } = useIsAclEnabled();
  const { data: grantData, mutate: mutateGrant } = useSelectedGrant();
  const { data: pageId } = useCurrentPageId();


  const updateGrantHandler = useCallback((grantData: IPageGrantData): void => {
    mutateGrant(grantData);
  }, [mutateGrant]);

  const save = useCallback(async(): Promise<void> => {
    // save
    (window as CustomWindow).globalEmitter.emit('saveAndReturnToView');
  }, []);

  const saveAndOverwriteScopesOfDescendants = useCallback(() => {
    // save
    (window as CustomWindow).globalEmitter.emit('saveAndReturnToView', { overwriteScopesOfDescendants: true });
  }, []);


  if (isEditable == null || isAclEnabled == null || grantData == null) {
    return null;
  }

  if (!isEditable) {
    return null;
  }

  const { grant, grantedGroup } = grantData;

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
        <Button data-testid="save-page-btn" id="caret" color="primary" className="btn-submit" onClick={save}>
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
