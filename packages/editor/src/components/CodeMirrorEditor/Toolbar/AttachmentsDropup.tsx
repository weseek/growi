import { useCallback } from 'react';

import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

import type { GlobalCodeMirrorEditorKey } from '../../../consts';
import { AcceptedUploadFileType } from '../../../consts/accepted-upload-file-type';
import { getMarkdownLink, replaceFocusedMarkdownLinkWithEditor } from '../../../services/link-util/markdown-link-util';
import { useCodeMirrorEditorIsolated } from '../../../stores';
import { useLinkEditModal } from '../../../stores/use-link-edit-modal';

import { AttachmentsButton } from './AttachmentsButton';

type Props = {
  editorKey: string | GlobalCodeMirrorEditorKey,
  onFileOpen: () => void,
  acceptedFileType: AcceptedUploadFileType,
}

export const AttachmentsDropup = (props: Props): JSX.Element => {
  const { onFileOpen, acceptedFileType, editorKey } = props;

  const { open: openLinkEditModal } = useLinkEditModal();
  const { data: codeMirrorEditor } = useCodeMirrorEditorIsolated(editorKey);

  const onClickOpenLinkEditModal = useCallback(() => {
    const editor = codeMirrorEditor?.view;
    if (editor == null) {
      return;
    }
    const onSubmit = (linkText: string) => {
      replaceFocusedMarkdownLinkWithEditor(editor, linkText);
      return;
    };

    const defaultMarkdownLink = getMarkdownLink(editor);

    openLinkEditModal(defaultMarkdownLink, onSubmit);
  }, [codeMirrorEditor?.view, openLinkEditModal]);

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
          <DropdownItem className="d-flex gap-1 align-items-center" onClick={onClickOpenLinkEditModal}>
            <span className="material-symbols-outlined fs-5">link</span>
            Link
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </>
  );
};
