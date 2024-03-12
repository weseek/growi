import React, { useCallback, useState } from 'react';

import {
  PageGrant, isPopulated, GroupType, type IGrantedGroup,
} from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,

  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { LoadingSpinner } from '~/components/LoadingSpinner';
import type { IPageGrantData } from '~/interfaces/page';
import { useCurrentUser } from '~/stores/context';

import { useMyUserGroups } from './use-my-user-groups';

const AVAILABLE_GRANTS = [
  {
    grant: PageGrant.GRANT_PUBLIC, iconName: 'group', btnStyleClass: 'outline-info', label: 'Public',
  },
  {
    grant: PageGrant.GRANT_RESTRICTED, iconName: 'link', btnStyleClass: 'outline-teal', label: 'Anyone with the link',
  },
  // { grant: 3, iconClass: '', label: 'Specified users only' },
  {
    grant: PageGrant.GRANT_OWNER, iconName: 'lock', btnStyleClass: 'outline-danger', label: 'Only me',
  },
  {
    grant: PageGrant.GRANT_USER_GROUP,
    iconName: 'more_horiz',
    btnStyleClass: 'outline-purple',
    label: 'Only inside the group',
    reselectLabel: 'Reselect the group',
  },
];


type Props = {
  disabled?: boolean,
  grant: PageGrant,
  userRelatedGrantedGroups?: {
    id: string,
    name: string,
    type: GroupType,
  }[]

  onUpdateGrant?: (grantData: IPageGrantData) => void,
}

/**
 * Page grant select component
 */
export const GrantSelector = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    disabled,
    userRelatedGrantedGroups,
    onUpdateGrant,
    grant: currentGrant,
  } = props;


  const [isSelectGroupModalShown, setIsSelectGroupModalShown] = useState(false);

  const { data: currentUser } = useCurrentUser();

  const shouldFetch = isSelectGroupModalShown;
  const { data: myUserGroups, update: updateMyUserGroups } = useMyUserGroups(shouldFetch);

  const showSelectGroupModal = useCallback(() => {
    updateMyUserGroups();
    setIsSelectGroupModalShown(true);
  }, [updateMyUserGroups]);

  /**
   * change event handler for grant selector
   */
  const changeGrantHandler = useCallback((grant: PageGrant) => {
    // select group
    if (grant === 5) {
      showSelectGroupModal();
      return;
    }

    if (onUpdateGrant != null) {
      onUpdateGrant({ grant, userRelatedGrantedGroups: undefined });
    }
  }, [onUpdateGrant, showSelectGroupModal]);

  const groupListItemClickHandler = useCallback((grantGroup: IGrantedGroup) => {
    if (onUpdateGrant != null && isPopulated(grantGroup.item)) {
      let userRelatedGrantedGroupsCopy = userRelatedGrantedGroups != null ? [...userRelatedGrantedGroups] : [];
      const grantGroupInfo = { id: grantGroup.item._id, name: grantGroup.item.name, type: grantGroup.type };
      if (userRelatedGrantedGroupsCopy.find(group => group.id === grantGroupInfo.id) == null) {
        userRelatedGrantedGroupsCopy.push(grantGroupInfo);
      }
      else {
        userRelatedGrantedGroupsCopy = userRelatedGrantedGroupsCopy.filter(group => group.id !== grantGroupInfo.id);
      }
      onUpdateGrant({ grant: 5, userRelatedGrantedGroups: userRelatedGrantedGroupsCopy });
    }
  }, [onUpdateGrant, userRelatedGrantedGroups]);

  /**
   * Render grant selector DOM.
   */
  const renderGrantSelector = useCallback(() => {

    let dropdownToggleBtnColor;
    let dropdownToggleLabelElm;

    const dropdownMenuElems = AVAILABLE_GRANTS.map((opt) => {
      const label = ((opt.grant === 5 && opt.reselectLabel != null) && userRelatedGrantedGroups != null && userRelatedGrantedGroups.length > 0)
        ? opt.reselectLabel // when grantGroup is selected
        : opt.label;

      const labelElm = (
        <span>
          <span className="material-symbols-outlined me-2">{opt.iconName}</span>
          <span className="label">{t(label)}</span>
        </span>
      );

      // set dropdownToggleBtnColor, dropdownToggleLabelElm
      if (opt.grant === 1 || opt.grant === currentGrant) {
        dropdownToggleBtnColor = opt.btnStyleClass;
        dropdownToggleLabelElm = labelElm;
      }

      return <DropdownItem key={opt.grant} onClick={() => changeGrantHandler(opt.grant)}>{labelElm}</DropdownItem>;
    });

    // add specified group option
    if (userRelatedGrantedGroups != null && userRelatedGrantedGroups.length > 0) {
      const labelElm = (
        <span>
          <span className="material-symbols-outlined me-1">account_tree</span>
          <span className="label">
            {userRelatedGrantedGroups.length > 1
              ? (
                <span>
                  {`${userRelatedGrantedGroups[0].name}... `}
                  <span className="badge badge-purple">+{userRelatedGrantedGroups.length - 1}</span>
                </span>
              ) : userRelatedGrantedGroups[0].name}
          </span>
        </span>
      );

      // set dropdownToggleLabelElm
      dropdownToggleLabelElm = labelElm;

      dropdownMenuElems.push(<DropdownItem key="groupSelected">{labelElm}</DropdownItem>);
    }

    return (
      <div className="grw-grant-selector mb-0" data-testid="grw-grant-selector">
        <UncontrolledDropdown direction="up" size="sm">
          <DropdownToggle color={dropdownToggleBtnColor} caret className="d-flex justify-content-between align-items-center" disabled={disabled}>
            {dropdownToggleLabelElm}
          </DropdownToggle>
          <DropdownMenu container="body">
            {dropdownMenuElems}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }, [changeGrantHandler, currentGrant, disabled, userRelatedGrantedGroups, t]);

  /**
   * Render select grantgroup modal.
   */
  const renderSelectGroupModalContent = useCallback(() => {
    if (!shouldFetch) {
      return <></>;
    }

    // show spinner
    if (myUserGroups == null) {
      return (
        <div className="my-3 text-center">
          <LoadingSpinner className="mx-auto text-muted fs-4" />
        </div>
      );
    }

    if (myUserGroups.length === 0) {
      return (
        <div>
          <h4>{t('user_group.belonging_to_no_group')}</h4>
          { currentUser?.admin && (
            <p><a href="/admin/user-groups"><span className="material-symbols-outlined me-1">login</span>{t('user_group.manage_user_groups')}</a></p>
          ) }
        </div>
      );
    }

    return (
      <>
        { myUserGroups.map((group) => {
          const groupIsGranted = userRelatedGrantedGroups?.find(g => g.id === group.item._id) != null;
          const activeClass = groupIsGranted ? 'active' : '';

          return (
            <button
              className={`btn btn-outline-primary w-100 d-flex justify-content-start mb-3 align-items-center p-3 ${activeClass}`}
              type="button"
              key={group.item._id}
              onClick={() => groupListItemClickHandler(group)}
            >
              <span className="align-middle"><input type="checkbox" checked={groupIsGranted} /></span>
              <h5 className="d-inline-block ml-3">{group.item.name}</h5>
              {group.type === GroupType.externalUserGroup && <span className="ml-2 badge badge-pill badge-info">{group.item.provider}</span>}
              {/* TODO: Replace <div className="small">(TBD) List group members</div> */}
            </button>
          );
        }) }
        <button type="button" className="btn btn-primary mt-2 float-right" onClick={() => setIsSelectGroupModalShown(false)}>{t('Done')}</button>
      </>
    );

  }, [currentUser?.admin, groupListItemClickHandler, myUserGroups, shouldFetch, t, userRelatedGrantedGroups]);

  return (
    <>
      { renderGrantSelector() }

      {/* render modal */}
      { !disabled && currentUser != null && (
        <Modal
          isOpen={isSelectGroupModalShown}
          toggle={() => setIsSelectGroupModalShown(false)}
        >
          <ModalHeader tag="h4" toggle={() => setIsSelectGroupModalShown(false)} className="bg-purple text-light">
            {t('user_group.select_group')}
          </ModalHeader>
          <ModalBody>
            {renderSelectGroupModalContent()}
          </ModalBody>
        </Modal>
      ) }
    </>
  );
};
