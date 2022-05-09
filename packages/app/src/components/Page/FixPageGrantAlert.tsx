import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

import { useCurrentPageId } from '~/stores/context';
import { useSWRxIsGrantNormalized } from '~/stores/page';

type ModalProps = {
  isOpen: boolean
  close?(): Promise<void> | void
  submit?(): Promise<void> | void
}

const FixPageGrantModal = (props: ModalProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    isOpen, close, submit,
  } = props;

  return (
    <Modal size="lg" isOpen={isOpen} toggle={close} className="grw-create-page">
      <ModalHeader tag="h4" toggle={close} className="bg-primary text-light">
        { t('fix_page_grant.modal.title') }
      </ModalHeader>
      <ModalBody>
        <div className="form-group grw-scrollable-modal-body pb-1">
          <label>{ t('fix_page_grant.modal.converting_pages') }:</label><br />
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-primary" onClick={submit}>
          <i className="icon-fw icon-refresh" aria-hidden="true"></i>
          { t('fix_page_grant.modal.button_label') }
        </button>
      </ModalFooter>
    </Modal>
  );
};

const FixPageGrantAlert = (): JSX.Element => {
  const { t } = useTranslation();

  const [isOpen, setOpen] = useState<boolean>(false);

  const { data: pageId } = useCurrentPageId();
  const { data } = useSWRxIsGrantNormalized(pageId);

  if (data?.isGrantNormalized == null || data.isGrantNormalized) {
    return <></>;
  }

  return (
    <>
      <div className="alert alert-warning py-3 pl-4 d-flex flex-column flex-lg-row">
        <div className="flex-grow-1">
          <i className="icon-fw icon-exclamation ml-1" aria-hidden="true" />
          {t('fix_page_grant.alert.description')}
        </div>
        <div className="d-flex align-items-end align-items-lg-center">
          <button type="button" className="btn btn-info btn-sm rounded-pill" onClick={() => setOpen(true)}>
            {t('fix_page_grant.alert.btn_label')}
          </button>
        </div>
      </div>

      <FixPageGrantModal
        isOpen={isOpen}
        close={() => setOpen(false)}
        submit={() => {}} // TODO: update grant
      />
    </>
  );
};

export default FixPageGrantAlert;
