import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import { AcceptedUploadFileType } from 'src/consts';

type Props = {
  onFileOpen: () => void,
  acceptedFileType?: AcceptedUploadFileType,
}

export const AttachmentsDropup = (props: Props): JSX.Element => {

  const { onFileOpen } = props;
  return (
    <>
      <UncontrolledDropdown direction="up" className="lh-1">
        <DropdownToggle className="btn-toolbar-button rounded-circle">
          <span className="material-icons fs-6">add</span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="d-flex gap-1 align-items-center" header>
            <span className="material-icons-outlined fs-5">add_circle_outline</span>
            Attachments
          </DropdownItem>
          <DropdownItem divider />
          <DropdownItem className="d-flex gap-1 align-items-center" onClick={onFileOpen}>
            <span className="material-icons-outlined fs-5">attach_file</span>
            Files
          </DropdownItem>
          <DropdownItem className="d-flex gap-1 align-items-center" onClick={onFileOpen}>
            <span className="material-icons-outlined fs-5">image</span>
            Images
          </DropdownItem>
          <DropdownItem className="d-flex gap-1 align-items-center">
            <span className="material-icons-outlined fs-5">link</span>
            Link
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};
