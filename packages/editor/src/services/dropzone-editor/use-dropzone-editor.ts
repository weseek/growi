import { useDropzone } from 'react-dropzone';
import type { DropzoneOptions, DropzoneState } from 'react-dropzone';

export const useDropzoneEditor = (props?: DropzoneOptions): DropzoneState => {
  return useDropzone(props);
};
