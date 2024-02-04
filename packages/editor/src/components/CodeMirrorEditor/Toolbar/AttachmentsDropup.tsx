import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import type { GlobalCodeMirrorEditorKey } from '../../../consts';
import { AcceptedUploadFileType } from '../../../consts/accepted-upload-file-type';

import { AttachmentsButton } from './AttachmentsButton';
import { LinkEditButton } from './LinkEditButton';

type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  onFileOpen: () => void,
  acceptedFileType: AcceptedUploadFileType,
}

export const AttachmentsDropup = (props: Props): JSX.Element => {
  const { onFileOpen, acceptedFileType, editorKey } = props;

  return (
    <>
      <UncontrolledDropdown direction="up" className="lh-1">
        <DropdownToggle className="btn-toolbar-button rounded-circle">
          <span className="material-symbols-outlined fs-6">add</span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="d-flex gap-1 align-items-center" header>
            <span className="material-symbols-outlined fs-5">add_circle_outline</span>
            Attachments
          </DropdownItem>
          <DropdownItem divider />
          <AttachmentsButton onFileOpen={onFileOpen} acceptedFileType={acceptedFileType} />
          <LinkEditButton editorKey={editorKey} />
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};
