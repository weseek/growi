import { useCallback, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

type FileDropzoneState = DropzoneState & {
  isUploading: boolean,
}

type DropzoneEditor = {
  onUpload?: (files: File[]) => void,
}

export const useFileDropzone = (props: DropzoneEditor): FileDropzoneState => {

  const { onUpload } = props;

  const [isUploading, setIsUploading] = useState(false);

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    if (onUpload == null) {
      return;
    }

    setIsUploading(true);
    onUpload(acceptedFiles);
    setIsUploading(false);

  }, [onUpload, setIsUploading]);

  const dropzoneState = useDropzone({
    noKeyboard: true,
    noClick: true,
    onDrop: dropHandler,
  });

  return {
    ...dropzoneState,
    isUploading,
  };
};
