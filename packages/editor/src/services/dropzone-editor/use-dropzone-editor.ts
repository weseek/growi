import { useCallback } from 'react';

import { useDropzone } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

type DropzoneEditor = {
  onUpload?: (args: File | File[]) => void,
}

export const useDropzoneEditor = (props: DropzoneEditor): DropzoneState => {

  const { onUpload } = props;

  const dropHandler = useCallback((acceptedFiles: File[]) => {
    if (onUpload == null) {
      return;
    }
    onUpload(acceptedFiles);
  }, [onUpload]);

  return useDropzone({
    noKeyboard: true,
    noClick: true,
    onDrop: dropHandler,
  });

};
