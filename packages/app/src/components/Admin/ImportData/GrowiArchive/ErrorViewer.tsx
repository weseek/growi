import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

type ErrorViewerProps = {
  isOpen: boolean,
  errors: any[],
  onClose: () => void,
}
const ErrorViewer = (props: ErrorViewerProps): JSX.Element => {
  const { t } = useTranslation();

  const { errors } = props;

  let value = '(no errors)';
  if (errors != null && errors.length > 0) {
    const lines = errors.map((obj) => {
      return JSON.stringify(obj);
    });
    value = lines.join('\n');
  }

  return (
    <Modal isOpen={props.isOpen} toggle={props.onClose} size="lg">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-danger text-light">
        Errors
      </ModalHeader>
      <ModalBody>
        <textarea className="form-control" rows={8} readOnly wrap="off" defaultValue={value}></textarea>
      </ModalBody>
    </Modal>
  );
};

ErrorViewer.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  errors: PropTypes.arrayOf(PropTypes.object),
};

export default ErrorViewer;
