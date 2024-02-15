import { ReactNode } from 'react';

import { AcceptedUploadFileType } from '@growi/core';
import {
  DropdownItem,
} from 'reactstrap';

import { useFileDropzone } from '../../../services';

type Props = {
  acceptedUploadFileType: AcceptedUploadFileType,
  children?: ReactNode,
  onUpload?: (files: File[]) => void,
}

export const AttachmentsDropdownItem = (props: Props): JSX.Element => {

  const {
    acceptedUploadFileType,
    children,
    onUpload,
  } = props;

  const {
    getRootProps,
    getInputProps,
    open,
  } = useFileDropzone({ onUpload, acceptedUploadFileType });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <DropdownItem className="d-flex gap-2 align-items-center" onClick={open}>
        {children}
      </DropdownItem>
    </div>
  );
};
