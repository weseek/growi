import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';


type Props = {
  isOpen: boolean,
  onClose: () => void,
  onExcludeUsersHome?: () => void,
  onExcludeTrash?: () => void,
}

// todo: implement filtering search result
// refs: https://redmine.weseek.co.jp/issues/81845
const FilterOptionModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('');

  const onClose = () => {
    if (props.onClose != null) {
      props.onClose();
    }
  };

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={onClose} className="bg-primary text-light">
        Filter Option
      </ModalHeader>
      <ModalBody>
        <div className="d-flex justify-content-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center">
              <input
                className="mr-2"
                type="checkbox"
                onClick={props.onExcludeUsersHome}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
          <div className="border border-gray">
            <label className="px-3 py-2 mb-0 d-flex align-items-center">
              <input
                className="mr-2"
                type="checkbox"
                onClick={props.onExcludeTrash}
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
        >{t('search_result.narrow_donw')}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default FilterOptionModal;
