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

const FilterOptionModal: FC<Props> = (props: Props) => {

  const { t } = useTranslation('');

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        Filter Option
      </ModalHeader>
      <ModalBody>
        <div className="d-flex align-items-center mr-3">
          <div className="border border-gray mr-3">
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckDefault">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckDefault"
                onClick={props.onExcludeUsersHome}
              />
              {t('Include Subordinated Target Page', { target: '/user' })}
            </label>
          </div>
          <div className="border border-gray">
            <label className="px-3 py-2 mb-0 d-flex align-items-center" htmlFor="flexCheckChecked">
              <input
                className="mr-2"
                type="checkbox"
                id="flexCheckChecked"
                onClick={props.onExcludeTrash}
              />
              {t('Include Subordinated Target Page', { target: '/trash' })}
            </label>
          </div>
        </div>

      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal>
  );
};

export default FilterOptionModal;
