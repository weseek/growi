import React from 'react';

type Props = {
  fileName: string,
  url: string,
};

const PageAttachmentPresentation = (props: Props): JSX.Element => {
  // TODO: add use props
  const { fileName, url } = props;

  // TODO: format [icon name, date, byte, ...]
  // EXAMPLE
  // iconNameByFormat(format) {
  //   if (format.match(/image\/.+/i)) {
  //     return 'icon-picture';
  //   }
  //   return 'icon-doc';
  // }

  // TODO: Delete method
  // EXAMPLE
  // _onAttachmentDeleteClicked(event) {
  //   if (this.props.onAttachmentDeleteClicked != null) {
  //     this.props.onAttachmentDeleteClicked(this.props.attachment);
  //   }
  // }

  // TODO: create Download button
  // EXAMPLE
  // const btnDownload = (this.props.isUserLoggedIn);
  // ? (
  //   <a className="attachment-download" href={attachment.downloadPathProxied}>
  //     <i className="icon-cloud-download" />
  //   </a>
  // )
  // : '';

  // TODO: create Trash button
  // EXAMPLE
  // const btnTrash = (this.props.isUserLoggedIn);
  //   ? (
  //     /* eslint-disable-next-line */
  //     <a className="text-danger attachment-delete" onClick={this._onAttachmentDeleteClicked}>
  //       <i className="icon-trash" />
  //     </a>
  //   )
  //   : '';

  // TODO: Need implement fileInUse?
  // EXAMPLE
  // let fileInUse = '';
  // if (this.props.inUse) {
  //   fileInUse = <span className="attachment-in-use badge badge-pill badge-info">In Use</span>;
  // }

  // TODO: create rich attachemnt layout
  return (
    <div className="mt-4 card border-primary">
      <div className="card-body">
        <a className="bg-info text-white" href={url}>{fileName}</a>
        <ul>
          {/* TODO: Attachemnt picture */}
          {/* TODO: User picture */}
          {/* <UserPicture user={attachment.creator} size="sm"></UserPicture> */}
          {/* TODO: Date */}
          {/* TODO: Data byte */}
          {/* TODO: Trash button */}
          {/* TODO: Download button */}
        </ul>
      </div>
    </div>
  );
};

export default PageAttachmentPresentation;
