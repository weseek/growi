import { useCallback, useState } from 'react';

import { AcceptedUploadFileType } from '@growi/core';
import {
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
} from 'reactstrap';

import type { GlobalCodeMirrorEditorKey } from '../../../consts';

import { AttachmentsButton } from './AttachmentsButton';
import { LinkEditButton } from './LinkEditButton';

type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  acceptedUploadFileType: AcceptedUploadFileType,
  onMenuItemClicked: () => void,
}

export const AttachmentsDropup = (props: Props): JSX.Element => {
  const { onMenuItemClicked, acceptedUploadFileType, editorKey } = props;

  const [isOpen, setOpen] = useState(false);

  const itemClickedHandler = useCallback(() => {
    onMenuItemClicked();

    // Force close against react-dropzone's { noClick: true } option
    setOpen(false);
  }, [onMenuItemClicked]);

  return (
    <>
      <Dropdown isOpen={isOpen} toggle={() => setOpen(!isOpen)} direction="up" className="lh-1">
        <DropdownToggle className="btn-toolbar-button rounded-circle">
          <span className="material-symbols-outlined fs-6">add</span>
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem className="mt-1" header>
            Attachments
          </DropdownItem>
          <DropdownItem divider />
          <AttachmentsButton onItemClicked={itemClickedHandler} acceptedUploadFileType={acceptedUploadFileType} />
          <LinkEditButton editorKey={editorKey} />
        </DropdownMenu>
      </Dropdown>
    </>
  );
};
