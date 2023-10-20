import {
  DropdownItem,
} from 'reactstrap';

import { AcceptedUploadFileType } from '../../../consts/accepted-upload-file-type';

type Props = {
  onFileOpen: () => void,
  acceptedFileType: AcceptedUploadFileType,
}

export const AttachmentsButton = (props: Props): JSX.Element => {

  const { onFileOpen, acceptedFileType } = props;

  if (acceptedFileType === AcceptedUploadFileType.ALL) {
    return (
      <>
        <DropdownItem className="d-flex gap-1 align-items-center" onClick={onFileOpen}>
          <span className="material-icons-outlined fs-5">attach_file</span>
          Files
        </DropdownItem>
      </>
    );
  }
  if (acceptedFileType === AcceptedUploadFileType.IMAGE) {
    return (
      <>
        <DropdownItem className="d-flex gap-1 align-items-center" onClick={onFileOpen}>
          <span className="material-icons-outlined fs-5">image</span>
          Images
        </DropdownItem>
      </>
    );
  }

  return <></>;
};
