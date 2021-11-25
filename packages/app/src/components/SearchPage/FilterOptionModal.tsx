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
  switchExcludingUnderUserPage?: () => void,
  switchExcludingUnderTrashPage?: () => void,
  onClickFilteringSearchResultButton?: () => void,
}

const FilterOptionModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('');

  const {
    isOpen, onClose, switchExcludingUnderUserPage, switchExcludingUnderTrashPage,
    excludeUnderUserPage, excludeUnderTrashPage,
  } = props;

  const onCloseModal = () => {
    if (onClose != null) {
      onClose();
    }
  };

  const onClickFilteringSearchResultButton = () => {
    if (props.onClickFilteringSearchResultButton != null) {
      props.onClickFilteringSearchResultButton();
      onCloseModal();
    }
  };

  return (
    <Modal size="lg" isOpen={isOpen} toggle={onCloseModal} autoFocus={false}>
      <ModalHeader tag="h4" toggle={onCloseModal} className="bg-primary text-light">
        Filter Option
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center">
              <input
                className="mr-2"
                type="checkbox"
                onClick={switchExcludingUnderUserPage}
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
                onClick={switchExcludingUnderTrashPage}
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
          onClick={onClickFilteringSearchResultButton}
        >{t('search_result.narrow_donw')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default FilterOptionModal;
