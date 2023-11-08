import { useCallback, useState } from 'react';

import { useDropzone, Accept } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

import { AcceptedUploadFileType } from '../../../consts';

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
    if (acceptedFileType === AcceptedUploadFileType.NONE) {
      return;
    }

    setIsUploading(true);
    onUpload(acceptedFiles);
    setIsUploading(false);

  }, [onUpload, setIsUploading, acceptedFileType]);

  const accept: Accept = {
  };
  accept[acceptedFileType] = [];

  const dzState = useDropzone({
    noKeyboard: true,
    noClick: true,
    onDrop: dropHandler,
    accept,
  });

  return {
    ...dzState,
    isUploading,
  };
};
