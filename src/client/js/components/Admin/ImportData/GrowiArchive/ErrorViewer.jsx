import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

import { createSubscribedElement } from '../../../UnstatedUtils';


class ErrorViewer extends React.Component {

  render() {
    const { errors } = this.props;

    let value = '(no errors)';
    if (errors != null && errors.length > 0) {
      const lines = errors.map((obj) => {
        return JSON.stringify(obj);
      });
      value = lines.join('\n');
    }

    return (
      <Modal isOpen={this.props.isOpen} toggle={this.props.onClose}>
        <ModalHeader tag="h4" toggle={this.props.onClose} className="bg-danger text-light">
          Errors
        </ModalHeader>
        <ModalBody>
          <textarea className="form-control" rows="8" readOnly wrap="off" defaultValue={value}></textarea>
        </ModalBody>
      </Modal>
    );
  }

}

ErrorViewer.propTypes = {
  t: PropTypes.func.isRequired, // i18next

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,

  errors: PropTypes.arrayOf(PropTypes.object),
};

/**
 * Wrapper component for using unstated
 */
const ErrorViewerWrapper = (props) => {
  return createSubscribedElement(ErrorViewer, props, []);
};

export default withTranslation()(ErrorViewerWrapper);
