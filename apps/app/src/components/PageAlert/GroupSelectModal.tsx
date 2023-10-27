import { useState } from 'react';

import { GroupType } from '@growi/core';
import { useTranslation } from 'react-i18next';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';

export const GroupSelectModal = (): JSX.Element => {
  const { t } = useTranslation();
  const [isSelectGroupModalShown, setIsSelectGroupModalShown] = useState(false);

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
        <>
          { myUserGroups.map((group) => {
            const groupIsGranted = grantedGroups?.find(g => g.id === group.item._id) != null;
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
      </ModalBody>
    </Modal>
  );
};
