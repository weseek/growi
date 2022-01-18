import React from 'react';
import PropTypes from 'prop-types';
import Picker from 'emoji-mart';

import {
  Modal,
  ModalBody,
} from 'reactstrap';


import AppContainer from '~/client/services/AppContainer';
import PageContainer from '~/client/services/PageContainer';

import { withUnstatedContainers } from '../UnstatedUtils';


class EmojiPickerModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      show: false,
    };

    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.cancel = this.cancel.bind(this);
  }

  show() {
    this.setState({
      show: true,
    });
  }

  cancel() {
    this.hide();
  }

  hide() {
    this.setState({
      show: false,
    });
  }

  render() {
    return (
      <Modal className="link-edit-modal" isOpen={this.state.show} toggle={this.cancel} size="lg" autoFocus={false}>
        <ModalBody className="container">
          <div className="row">
            <div className="col-12">
              <Picker set="apple" />
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

}

EmojiPickerModal.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};
const EmojiPickerModalWrapper = withUnstatedContainers(EmojiPickerModal, [AppContainer, PageContainer]);

export default EmojiPickerModalWrapper;
