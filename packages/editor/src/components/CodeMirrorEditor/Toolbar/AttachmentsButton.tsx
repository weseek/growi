import { AcceptedUploadFileType } from '@growi/core';
import {
  DropdownItem,
} from 'reactstrap';

type Props = {
  onFileOpen: () => void,
  acceptedUploadFileType: AcceptedUploadFileType,
}

export const AttachmentsButton = (props: Props): JSX.Element => {

  const { onFileOpen, acceptedUploadFileType } = props;

  if (acceptedUploadFileType === AcceptedUploadFileType.ALL) {
    return (
      <>
        <DropdownItem className="d-flex gap-2 align-items-center" onClick={onFileOpen}>
          <span className="material-symbols-outlined fs-5">attach_file</span>
          Files
        </DropdownItem>
      </>
    );
  }
  if (acceptedUploadFileType === AcceptedUploadFileType.IMAGE) {
    return (
      <>
        <DropdownItem className="d-flex gap-2 align-items-center" onClick={onFileOpen}>
          <span className="material-symbols-outlined fs-5">image</span>
          Images
        </DropdownItem>
      </>
    );
  }

  return <></>;
};
