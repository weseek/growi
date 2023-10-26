import { useCallback, useState } from 'react';

import { useDropzone, Accept } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

import { AcceptedUploadFileType } from '../../consts';

type FileDropzoneState = DropzoneState & {
  isUploading: boolean,
}

type DropzoneEditor = {
  onUpload?: (files: File[]) => void,
  acceptedFileType: AcceptedUploadFileType,
}

export const useFileDropzone = (props: DropzoneEditor): FileDropzoneState => {

  const { onUpload, acceptedFileType } = props;

  const [isUploading, setIsUploading] = useState(false);

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    if (onUpload == null) {
      return;
    }

    setIsUploading(true);
    onUpload(acceptedFiles);
    setIsUploading(false);

  }, [onUpload, setIsUploading]);

  const accept: Accept = {
    acceptedFileType: [],
  };

  const disabled = acceptedFileType === AcceptedUploadFileType.NONE;

  const dropzoneState = useDropzone({
    noKeyboard: true,
    noClick: true,
    disabled,
    onDrop: dropHandler,
    accept,
  });

  return {
    ...dropzoneState,
    isUploading,
  };
};
