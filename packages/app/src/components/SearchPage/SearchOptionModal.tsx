import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


type Props = {
  isOpen: boolean,
  excludeUnderUserPage: boolean,
  excludeUnderTrashPage: boolean,
  onClose?: () => void,
  onSwitchExcludingUserPagesInvoked?: () => void,
  onSwitchExcludingTrashPagesInvoked?: () => void,
  onClickFilteringSearchResult?: () => void,
}

const SearchOptionModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('');

  const {
    isOpen, onClose, onSwitchExcludingUserPagesInvoked, onSwitchExcludingTrashPagesInvoked,
    excludeUnderUserPage, excludeUnderTrashPage,
  } = props;

  const onCloseModal = () => {
    if (onClose != null) {
      onClose();
    }
  };

  const onClickFilteringSearchResult = () => {
    if (props.onClickFilteringSearchResult != null) {
      props.onClickFilteringSearchResult();
      onCloseModal();
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={onCloseModal} autoFocus={false}>
      <ModalHeader tag="h4" toggle={onCloseModal} className="bg-primary text-light">
        Search Option
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center">
              <input
                className="mr-2"
                type="checkbox"
                onClick={onSwitchExcludingUserPagesInvoked}
                checked={!excludeUnderUserPage}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
          <div className="border border-gray">
            <label className="px-3 py-2 mb-0 d-flex align-items-center">
              <input
                className="mr-2"
                type="checkbox"
                onClick={onSwitchExcludingTrashPagesInvoked}
                checked={!excludeUnderTrashPage}
              />
              {t('Include Subordinated Target Page', { target: '/trash' })}
            </label>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClickFilteringSearchResult}
        >{t('search_result.search_again')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default SearchOptionModal;
