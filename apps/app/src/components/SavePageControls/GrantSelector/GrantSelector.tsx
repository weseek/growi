import React, { useCallback, useState } from 'react';

import { isPopulated, GroupType, type IGrantedGroup } from '@growi/core';
import { useTranslation } from 'next-i18next';
import {
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,

  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import type { IPageGrantData } from '~/interfaces/page';
import { useCurrentUser } from '~/stores/context';

import { useMyUserGroups } from './use-my-user-groups';

const AVAILABLE_GRANTS = [
  {
    grant: 1, iconClass: 'icon-people', btnStyleClass: 'outline-info', label: 'Public',
  },
  {
    grant: 2, iconClass: 'icon-link', btnStyleClass: 'outline-teal', label: 'Anyone with the link',
  },
  // { grant: 3, iconClass: '', label: 'Specified users only' },
  {
    grant: 4, iconClass: 'icon-lock', btnStyleClass: 'outline-danger', label: 'Only me',
  },
  {
    grant: 5, iconClass: 'icon-options', btnStyleClass: 'outline-purple', label: 'Only inside the group', reselectLabel: 'Reselect the group',
  },
];


type Props = {
  disabled?: boolean,
  grant: number,
  grantedGroups?: {
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
    grantedGroups,
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
  const changeGrantHandler = useCallback((grant: number) => {
    // select group
    if (grant === 5) {
      showSelectGroupModal();
      return;
    }

    if (onUpdateGrant != null) {
      onUpdateGrant({ grant, grantedGroups: undefined });
    }
  }, [onUpdateGrant, showSelectGroupModal]);

  const groupListItemClickHandler = useCallback((grantGroup: IGrantedGroup) => {
    if (onUpdateGrant != null && isPopulated(grantGroup.item)) {
      onUpdateGrant({ grant: 5, grantedGroups: [{ id: grantGroup.item._id, name: grantGroup.item.name, type: grantGroup.type }] });
    }

    // hide modal
    setIsSelectGroupModalShown(false);
  }, [onUpdateGrant]);

  /**
   * Render grant selector DOM.
   */
  const renderGrantSelector = useCallback(() => {

    let dropdownToggleBtnColor;
    let dropdownToggleLabelElm;

    const dropdownMenuElems = AVAILABLE_GRANTS.map((opt) => {
      const label = ((opt.grant === 5 && opt.reselectLabel != null) && grantedGroups != null && grantedGroups.length > 0)
        ? opt.reselectLabel // when grantGroup is selected
        : opt.label;

      const labelElm = (
        <span>
          <i className={`icon icon-fw ${opt.iconClass}`}></i>
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
    if (grantedGroups != null && grantedGroups.length > 0) {
      const labelElm = (
        <span>
          <i className="icon icon-fw icon-organization"></i>
          <span className="label">{grantedGroups[0].name}</span>
        </span>
      );

      // set dropdownToggleLabelElm
      dropdownToggleLabelElm = labelElm;

      dropdownMenuElems.push(<DropdownItem key="groupSelected">{labelElm}</DropdownItem>);
    }

    return (
      <div className="form-group grw-grant-selector mb-0" data-testid="grw-grant-selector">
        <UncontrolledDropdown direction="up">
          <DropdownToggle color={dropdownToggleBtnColor} caret className="d-flex justify-content-between align-items-center" disabled={disabled}>
            {dropdownToggleLabelElm}
          </DropdownToggle>
          <DropdownMenu>
            {dropdownMenuElems}
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }, [changeGrantHandler, currentGrant, disabled, grantedGroups, t]);

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
          <i className="fa fa-lg fa-spinner fa-pulse mx-auto text-muted"></i>
        </div>
      );
    }

    if (myUserGroups.length === 0) {
      return (
        <div>
          <h4>{t('user_group.belonging_to_no_group')}</h4>
          { currentUser?.admin && (
            <p><a href="/admin/user-groups"><i className="icon icon-fw icon-login"></i>{t('user_group.manage_user_groups')}</a></p>
          ) }
        </div>
      );
    }

    return (
      <div className="list-group">
        { myUserGroups.map((group) => {
          return (
            <button key={group.item._id} type="button" className="list-group-item list-group-item-action" onClick={() => groupListItemClickHandler(group)}>
              <h5 className="d-inline-block">{group.item.name}</h5>
              {group.type === GroupType.externalUserGroup && <span className="ml-2 badge badge-pill badge-info">{group.item.provider}</span>}
              {/* TODO: Replace <div className="small">(TBD) List group members</div> */}
            </button>
          );
        }) }
      </div>
    );

  }, [currentUser?.admin, groupListItemClickHandler, myUserGroups, shouldFetch, t]);

  return (
    <>
      { renderGrantSelector() }

      {/* render modal */}
      { !disabled && currentUser != null && (
        <Modal
          className="select-grant-group"
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
