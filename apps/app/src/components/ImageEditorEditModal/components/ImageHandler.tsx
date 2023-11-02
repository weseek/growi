import React, { useCallback } from 'react';

export function ImageHandler(props: {
  onBase64ImageLoaded: (image: HTMLImageElement) => void,
}) {
  const { onBase64ImageLoaded } = props;

  const handleFileChange = useCallback((event) => {
    const [file] = event.target.files;
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      const binaryStr = String(reader.result);
      const base64 = binaryStr.split(',')[1];

      const image = new Image();
      image.src = `data:image/png;base64,${base64}`;
      image.onload = () => onBase64ImageLoaded(image);
    };

    reader.readAsDataURL(file);
  }, [props]);

  return (
    <Input
      type="file"
      style={{ display: 'none' }}
      onChange={handleFileChange}
      id="add-image"
      accept="image/*"
    />
  );
}
