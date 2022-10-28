import React, { useCallback, useState } from 'react';


import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { apiPost } from '~/client/util/apiv1-client';
import { PathAlreadyExistsError } from '~/server/models/errors';
import { usePutBackPageModal } from '~/stores/modal';

import ApiErrorMessageList from './PageManagement/ApiErrorMessageList';

const PutBackPageModal = () => {
  const { t } = useTranslation();

  const { data: pageDataToRevert, close: closePutBackPageModal } = usePutBackPageModal();
  const { isOpened, page } = pageDataToRevert;
  const { pageId, path } = page;
  const onPutBacked = pageDataToRevert.opts?.onPutBacked;

  const [errs, setErrs] = useState(null);
  const [targetPath, setTargetPath] = useState(null);

  const [isPutbackRecursively, setIsPutbackRecursively] = useState(true);

  function changeIsPutbackRecursivelyHandler() {
    setIsPutbackRecursively(!isPutbackRecursively);
  }

  async function putbackPageButtonHandler() {
    setErrs(null);

    try {
      // control flag
      // If is it not true, Request value must be `null`.
      const recursively = isPutbackRecursively ? true : null;

      const response = await apiPost('/pages.revertRemove', {
        page_id: pageId,
        recursively,
      });

      if (onPutBacked != null) {
        onPutBacked(response.page.path);
      }
      closePutBackPageModal();
    }
    catch (err) {
      setTargetPath(err.data);
      setErrs([err]);
    }
  }

  const closeModalHandler = useCallback(() => {
    closePutBackPageModal();
    setErrs(null);
  }, [closePutBackPageModal]);


  return (
    <Modal isOpen={isOpened} toggle={closeModalHandler} className="grw-create-page">
      <ModalHeader tag="h4" toggle={closeModalHandler} className="bg-info text-light">
        <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('modal_putback.label.Put Back Page') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>{t('modal_putback.label.Put Back Page')}:</label><br />
          <code>{path}</code>
        </div>
        <div className="custom-control custom-checkbox custom-checkbox-warning">
          <input
            className="custom-control-input"
            id="cbPutBackRecursively"
            type="checkbox"
            checked={isPutbackRecursively}
            onChange={changeIsPutbackRecursivelyHandler}
          />
          <label htmlFor="cbPutBackRecursively" className="custom-control-label">
            { t('modal_putback.label.recursively') }
          </label>
          <p className="form-text text-muted mt-0">
            <code>{ path }</code>{ t('modal_putback.help.recursively') }
          </p>
        </div>
      </ModalBody>
      <ModalFooter>
        <ApiErrorMessageList errs={errs} targetPath={targetPath} />
        <button type="button" className="btn btn-info" onClick={putbackPageButtonHandler}>
          <i className="icon-action-undo mr-2" aria-hidden="true"></i> { t('Put Back') }
        </button>
      </ModalFooter>
    </Modal>
  );

};

export default PutBackPageModal;
