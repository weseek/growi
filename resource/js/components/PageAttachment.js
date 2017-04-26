import React from 'react';

import Icon from './Common/Icon';
import PageAttachmentList from './PageAttachment/PageAttachmentList';
import DeleteAttachmentModal from './PageAttachment/DeleteAttachmentModal';

export default class PageAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      attachments: [],
      inUse: {},
      attachmentToDelete: null,
    };

    this.onAttachmentDeleteClicked = this.onAttachmentDeleteClicked.bind(this);
    this.onAttachmentDeleteClickedConfirm = this.onAttachmentDeleteClickedConfirm.bind(this);
  }

  componentDidMount() {
    const pageId = this.props.pageId;

    if (!pageId) {
      return ;
    }

    this.props.crowi.apiGet('/attachments.list', {page_id: pageId })
    .then(res => {
      const attachments = res.attachments;
      let inUse = {};

      for (let attachment in attachments.length) {
        inUse[attachment._id] = this.checkIfFileInUse(attachment);;
      }

      this.setState({
        attachments: attachments,
        inUse: inUse,
      });
      console.log(attachments);
    });
  }

  checkIfFileInUse(attachment) {
    // todo
    return true;
  }

  onAttachmentDeleteClicked(attachment) {
    this.setState({
      attachmentToDelete: attachment
    });
  }

  onAttachmentDeleteClickedConfirm(attachment) {
    const attachmentId = attachment._id;
    console.log('Do Delete!!', attachmentId);

    this.props.crowi.apiPost('/attachments.remove', {attachment_id: attachmentId})
    .then(res => {
      this.setState({
        attachments: this.state.attachments.filter((at) => {
          return at._id != attachmentId;
        }),
        attachmentToDelete: null,
      });
    }).catch(err => {
      console.log('error', err);
    });
  }

  render() {
    const attachmentToDelete = this.state.attachmentToDelete;
    let deleteModalClose = () => this.setState({ attachmentToDelete: null });
    let showModal = attachmentToDelete !== null;

    let deleteInUse = null;
    if (attachmentToDelete !== null) {
      deleteInUse = this.state.inUse[attachmentToDelete._id] || false;
    }

    return (
      <div>
        <p>Attachments</p>
        <PageAttachmentList
          attachments={this.state.attachments}
          inUse={this.state.inUse}
          onAttachmentDeleteClicked={this.onAttachmentDeleteClicked}
        />
        <DeleteAttachmentModal
          show={showModal}
          animation={false}
          onHide={deleteModalClose}

          attachmentToDelete={attachmentToDelete}
          inUse={deleteInUse}
          onAttachmentDeleteClickedConfirm={this.onAttachmentDeleteClickedConfirm}
        />
      </div>
    );
  }
}
