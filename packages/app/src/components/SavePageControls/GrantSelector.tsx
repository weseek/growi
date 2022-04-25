import React, { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  UncontrolledDropdown,
  DropdownToggle, DropdownMenu, DropdownItem,

  Modal, ModalHeader, ModalBody,
} from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import { apiGet } from '~/client/util/apiv1-client';
import { IUserGroupHasId } from '~/interfaces/user';
import { useCurrentUser } from '~/stores/context';

import { withUnstatedContainers } from '../UnstatedUtils';


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
  appContainer: AppContainer,

  disabled?: boolean,
  grant: number,
  grantGroupId?: string,
  grantGroupName?: string,

  onUpdateGrant?: (args: { grant: number, grantGroupId?: string | null, grantGroupName?: string | null }) => void,
}

/**
 * Page grant select component
 */
const GrantSelector = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const {
    disabled,
    grantGroupName,
    onUpdateGrant,
  } = props;


  const [userRelatedGroups, setUserRelatedGroups] = useState<IUserGroupHasId[]>([]);
  const [isSelectGroupModalShown, setIsSelectGroupModalShown] = useState(false);

  const { data: currentUser } = useCurrentUser();

  /**
   * Retrieve user-group-relations data from backend
   */
  const retrieveUserGroupRelations = async() => {
    const res = await apiGet('/me/user-group-relations') as any;
    const userRelatedGroups = res.userGroupRelations.map((relation) => {
      return relation.relatedGroup;
    });
    setUserRelatedGroups(userRelatedGroups);
  };

  const showSelectGroupModal = useCallback(() => {
    retrieveUserGroupRelations();
    setIsSelectGroupModalShown(true);
  }, []);

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
      onUpdateGrant({ grant, grantGroupId: null, grantGroupName: null });
    }
  }, [onUpdateGrant, showSelectGroupModal]);

  const groupListItemClickHandler = useCallback((grantGroup: IUserGroupHasId) => {
    if (onUpdateGrant != null) {
      onUpdateGrant({ grant: 5, grantGroupId: grantGroup._id, grantGroupName: grantGroup.name });
    }

    // hide modal
    setIsSelectGroupModalShown(false);
  }, [onUpdateGrant]);

  /**
   * Render grant selector DOM.
   */
  const renderGrantSelector = useCallback(() => {
    const { grant: currentGrant, grantGroupId } = props;

    let dropdownToggleBtnColor;
    let dropdownToggleLabelElm;

    const dropdownMenuElems = AVAILABLE_GRANTS.map((opt) => {
      const label = ((opt.grant === 5 && opt.reselectLabel != null) && grantGroupId != null)
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
    if (grantGroupId != null) {
      const labelElm = (
        <span>
          <i className="icon icon-fw icon-organization"></i>
          <span className="label">{grantGroupName}</span>
        </span>
      );

      // set dropdownToggleLabelElm
      dropdownToggleLabelElm = labelElm;

      dropdownMenuElems.push(<DropdownItem key="groupSelected">{labelElm}</DropdownItem>);
    }

    return (
      <div className="form-group grw-grant-selector mb-0">
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
  }, [changeGrantHandler, disabled, grantGroupName, props, t]);

  /**
   * Render select grantgroup modal.
   */
  const renderSelectGroupModal = useCallback(() => {
    if (currentUser == null) {
      return <></>;
    }

    const generateGroupListItems = () => {
      return userRelatedGroups.map((group) => {
        return (
          <button key={group._id} type="button" className="list-group-item list-group-item-action" onClick={() => groupListItemClickHandler(group)}>
            <h5>{group.name}</h5>
            {/* TODO: Replace <div className="small">(TBD) List group members</div> */}
          </button>
        );
      });
    };

    const content = userRelatedGroups.length === 0
      ? (
        <div>
          <h4>{t('user_group.belonging_to_no_group')}</h4>
          { currentUser.admin && (
            <p><a href="/admin/user-groups"><i className="icon icon-fw icon-login"></i>{t('user_group.manage_user_groups')}</a></p>
          ) }
        </div>
      )
      : (
        <div className="list-group">
          {generateGroupListItems()}
        </div>
      );

    return (
      <Modal
        className="select-grant-group"
        isOpen={isSelectGroupModalShown}
        toggle={() => setIsSelectGroupModalShown(false)}
      >
        <ModalHeader tag="h4" toggle={() => setIsSelectGroupModalShown(false)} className="bg-purple text-light">
          {t('user_group.select_group')}
        </ModalHeader>
        <ModalBody>
          {content}
        </ModalBody>
      </Modal>
    );
  }, [currentUser, groupListItemClickHandler, isSelectGroupModalShown, t, userRelatedGroups]);

  return (
    <React.Fragment>
      { renderGrantSelector() }
      { !disabled && renderSelectGroupModal() }
    </React.Fragment>
  );

};

/**
 * Wrapper component for using unstated
 */
const GrantSelectorWrapper = withUnstatedContainers(GrantSelector, [AppContainer]);

export default GrantSelectorWrapper;
