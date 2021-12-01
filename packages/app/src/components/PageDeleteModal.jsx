import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { apiPost } from '~/client/util/apiv1-client';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

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

const PageDeleteModal = (props) => {
  const {
    t, isOpen, onClose, isDeleteCompletelyModal, pageId, revisionId, path, isAbleToDeleteCompletely,
  } = props;
  const [isDeleteRecursively, setIsDeleteRecursively] = useState(true);
  const [isDeleteCompletely, setIsDeleteCompletely] = useState(isDeleteCompletelyModal && isAbleToDeleteCompletely);
  const deleteMode = isDeleteCompletely ? 'completely' : 'temporary';

  const [errs, setErrs] = useState(null);

  function changeIsDeleteRecursivelyHandler() {
    setIsDeleteRecursively(!isDeleteRecursively);
  }

  function changeIsDeleteCompletelyHandler() {
    if (!isAbleToDeleteCompletely) {
      return;
    }
    setIsDeleteCompletely(!isDeleteCompletely);
  }

  async function deletePage() {
    setErrs(null);

    try {
      // control flag
      // If is it not true, Request value must be `null`.
      const recursively = isDeleteRecursively ? true : null;
      const completely = isDeleteCompletely ? true : null;

      const response = await apiPost('/pages.remove', {
        page_id: pageId,
        revision_id: revisionId,
        recursively,
        completely,
      });

      const trashPagePath = response.page.path;
      window.location.href = encodeURI(trashPagePath);
    }
    catch (err) {
      setErrs(err);
    }
  }

  async function deleteButtonHandler() {
    deletePage();
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

  // DeleteCompletely is currently disabled
  // TODO1 : Retrive isAbleToDeleteCompleltly state everywhere in the system via swr.
  // Story: https://redmine.weseek.co.jp/issues/82222

  // TODO2 : use toaster
  // TASK : https://redmine.weseek.co.jp/issues/82299
  function renderDeleteCompletelyForm() {
    return (
      <div className="custom-control custom-checkbox custom-checkbox-danger">
        <input
          className="custom-control-input"
          name="completely"
          id="deleteCompletely"
          type="checkbox"
          disabled
          checked={isDeleteCompletely}
          onChange={changeIsDeleteCompletelyHandler}
        />
        <label className="custom-control-label text-danger" htmlFor="deleteCompletely">
          { t('modal_delete.delete_completely')}
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

PageDeleteModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  pageId: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  isDeleteCompletelyModal: PropTypes.bool,
  isAbleToDeleteCompletely: PropTypes.bool,
};

PageDeleteModal.defaultProps = {
  isDeleteCompletelyModal: false,
};

export default withTranslation()(PageDeleteModal);
