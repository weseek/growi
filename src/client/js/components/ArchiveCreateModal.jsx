import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';

export default class ArchiveCreateModal extends React.PureComponet {

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      isIncludeComment: false,
      isIncludeFile: false,
      isCreateAllSubordinatedPage: false,
    };

    this.show = this.show.bind(this);
    this.cancel = this.cancel.bind(this);
    this.save = this.save.bind(this);

  }

  show() {

  }

  cancel() {
    this.hide();
  }

  hide() {
    this.setState({ show: false });
  }

  save() {

  }


  render() {
    return (
      <Modal isOpen={this.state.show} toggle={this.cancel} size="lg">
        <ModalHeader tag="h4" toggle={this.cancel} className="bg-primary text-light">
          アーカイブ作成
        </ModalHeader>

        <ModalBody className="container">
          <div className="custom-control">
            <button className="btn btn-outline-secondary d-block mx-auto px-5 mb-3" type="button">アーカイブを作成する</button>

            <input className="custom-control-input" type="checkbox" checked={this.state.isIncludeComment} />
            <label className="custom-control-label" onClick="this.">コメントもダウンロードする</label>

            <input className="custom-control-input" type="checkbox" checked={this.isIncludeFile} />
            <label className="custom-control-label" onClick="this.">添付ファイルもダウンロードする</label>

            <input className="custom-control-input" type="checkbox" checked={this.isCreateAllSubordinatedPage} />
            <label className="custom-control-label" onClick="this.">配下ページもダウンロードする</label>
          </div>
        </ModalBody>
      </Modal>
    );
  }
  ArchiveCreateModal.propTypes = {
    isOpen: Proptypes.bool.isRequired,
    onClose: PropTypes.cunc.isRequired,
  };
}
