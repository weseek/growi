import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/es/Modal';

import { createSubscribedElement } from '../../UnstatedUtils';


class ErrorViewer extends React.Component {

  render() {
    const { errors } = this.props;

    let value = '(no errors)';
    if (errors != null) {
      const lines = errors.map((obj) => {
        return JSON.stringify(obj);
      });
      value = lines.join('\n');
    }

    return (
      <Modal show={this.props.isOpen} onHide={this.props.onClose}>
        <Modal.Header closeButton className="bg-danger">
          <Modal.Title className="text-white">Errors</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea className="form-control" rows="8" readOnly wrap="off" defaultValue={value}></textarea>
        </Modal.Body>
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
