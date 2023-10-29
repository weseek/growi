import { useCallback, useMemo, useState } from 'react';

import { useDropzone, Accept } from 'react-dropzone';
import type { DropzoneState } from 'react-dropzone';

import { AcceptedUploadFileType } from '../../consts';

type FileDropzoneState = DropzoneState & {
  isUploading: boolean,
  fileUploadState: string,
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

  const dzState = useDropzone({
    noKeyboard: true,
    noClick: true,
    onDrop: dropHandler,
    accept,
  });

  const fileUploadState = useMemo(() => {

    if (isUploading) {
      return 'dropzone-uploading';
    }

    switch (acceptedFileType) {
      case AcceptedUploadFileType.NONE:
        return 'dropzone-disabled';

      case AcceptedUploadFileType.IMAGE:
        if (dzState.isDragAccept) {
          return 'dropzone-accepted';
        }
        if (dzState.isDragReject) {
          return 'dropzone-mismatch-picture';
        }
        break;

      case AcceptedUploadFileType.ALL:
        if (dzState.isDragAccept) {
          return 'dropzone-accepted';
        }
        if (dzState.isDragReject) {
          return 'dropzone-rejected';
        }
        break;
    }

    return '';
  }, [isUploading, dzState.isDragAccept, dzState.isDragReject, acceptedFileType]);

  return {
    ...dzState,
    isUploading,
    fileUploadState,
  };
};
