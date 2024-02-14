import { useCallback, useState } from 'react';

import { useDropzone, Accept } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

import { AcceptedUploadFileType, getMimeType } from '../../../consts';

type FileDropzoneState = DropzoneState & {
  isUploading: boolean,
}

type DropzoneEditor = {
  acceptedUploadFileType: AcceptedUploadFileType,
  onUpload?: (files: File[]) => void,
}

export const useFileDropzone = (props: DropzoneEditor): FileDropzoneState => {

  const { onUpload, acceptedUploadFileType } = props;

  const [isUploading, setIsUploading] = useState(false);

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    if (onUpload == null) {
      return;
    }
    if (acceptedUploadFileType === AcceptedUploadFileType.NONE) {
      return;
    }

    setIsUploading(true);
    onUpload(acceptedFiles);
    setIsUploading(false);

  }, [onUpload, setIsUploading, acceptedUploadFileType]);

  const accept: Accept = {
  };
  accept[getMimeType(acceptedUploadFileType)] = [];

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
