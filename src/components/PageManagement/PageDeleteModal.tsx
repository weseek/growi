import React, { useState, FC } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';
import { useTranslation } from '~/i18n';

// import { withUnstatedContainers } from './UnstatedUtils';
// import PageContainer from '../services/PageContainer';

import { ApiErrorMessageList } from '~/components/PageManagement/ApiErrorMessageList';

const deleteIconAndKey = {
  completely: {
    color: 'danger',
    icon: 'fire',
    translationKey: 'completely',
  },
  temporary: {
    color: 'primary',
    icon: 'trash',
    translationKey: 'page',
  },
};


type Props = {
  isOpen: boolean;
  path?: string;
  isAbleToDeleteCompletely?: boolean;
  isDeleteCompletely?: boolean;
  onClose:() => void;
}

// TODO-5055 impl modal
export const PageDeleteModal:FC<Props> = (props:Props) => {
  const { t } = useTranslation();
  const { isDeleteCompletely = false } = props;
  const [errs, setErrs] = useState([]);

  const deleteMode = isDeleteCompletely ? 'completely' : 'temporary';


  const deletePage = async() => {
    setErrs([]);

    try {
      // const response = await pageContainer.deletePage(isDeleteRecursively, isDeleteCompletely);
      // const trashPagePath = response.page.path;
      // window.location.href = encodeURI(trashPagePath);
    }
    catch (err) {
      setErrs(err);
    }
  };

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} autoFocus={false}>
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">
        { t('modal_delete.delete_page') }
      </ModalHeader>
      <ModalBody>
        <ApiErrorMessageList errs={errs} />
        <button type="button" className={`btn btn-${deleteIconAndKey[deleteMode].color}`} onClick={deletePage}>
          <i className={`icon-${deleteIconAndKey[deleteMode].icon}`} aria-hidden="true"></i>
          { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
        </button>
      </ModalBody>
    </Modal>
  );
};


const DeprecatedPageDeleteModal = (props) => {
  const {
    t, pageContainer, isOpen, onClose, isDeleteCompletelyModal, path, isAbleToDeleteCompletely,
  } = props;
  const [isDeleteRecursively, setIsDeleteRecursively] = useState(true);
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(isDeleteCompletelyModal && isAbleToDeleteCompletely);
  const deleteMode = isDeleteCompletely ? 'completely' : 'temporary';

  const [errs, setErrs] = useState([]);

  function changeIsDeleteRecursivelyHandler() {
    setIsDeleteRecursively(!isDeleteRecursively);
  }

  function changeIsDeleteCompletelyHandler() {
    if (!isAbleToDeleteCompletely) {
      return;
    }
    setIsDeleteCompletely(!isDeleteCompletely);
  }


  function renderDeleteRecursivelyForm() {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-warning">
        <input
          className="custom-control-input"
          id="deleteRecursively"
          type="checkbox"
          checked={isDeleteRecursively}
          onChange={changeIsDeleteRecursivelyHandler}
        />
        <label className="custom-control-label" htmlFor="deleteRecursively">
          { t('modal_delete.delete_recursively') }
          <p className="form-text text-muted mt-0"><code>{path}</code> { t('modal_delete.recursively') }</p>
        </label>
      </div>
    );
  }

  function renderDeleteCompletelyForm() {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-danger">
        <input
          className="custom-control-input"
          name="completely"
          id="deleteCompletely"
          type="checkbox"
          disabled={!isAbleToDeleteCompletely}
          checked={isDeleteCompletely}
          onChange={changeIsDeleteCompletelyHandler}
        />
        <label className="custom-control-label text-danger" htmlFor="deleteCompletely">
          { t('modal_delete.delete_completely') }
          <p className="form-text text-muted mt-0"> { t('modal_delete.completely') }</p>
        </label>
        {!isAbleToDeleteCompletely
        && (
        <p className="alert alert-warning p-2 my-0">
          <i className="icon-ban icon-fw"></i>{ t('modal_delete.delete_completely_restriction') }
        </p>
        )}
      </div>
    );
  }

  return (
    <Modal size="lg" isOpen={isOpen} toggle={onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={onClose} className={`bg-${deleteIconAndKey[deleteMode].color} text-light`}>
        <i className={`icon-fw icon-${deleteIconAndKey[deleteMode].icon}`}></i>
        { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{ t('modal_delete.deleting_page') }:</label><br />
          <code>{ path }</code>
        </div>
        {renderDeleteRecursivelyForm()}
        {!isDeleteCompletelyModal && renderDeleteCompletelyForm()}
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} />
        <button type="button" className={`btn btn-${deleteIconAndKey[deleteMode].color}`} onClick={deleteButtonHandler}>
          <i className={`icon-${deleteIconAndKey[deleteMode].icon}`} aria-hidden="true"></i>
          { t(`modal_delete.delete_${deleteIconAndKey[deleteMode].translationKey}`) }
        </button>
      </ModalFooter>
    </Modal>

  );
};
