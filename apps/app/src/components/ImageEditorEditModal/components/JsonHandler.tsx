import React, { useCallback } from 'react';
import { styled } from '@mui/material/styles';
import { ShapeConfig } from 'konva/lib/Shape';

const Input = styled('input')({
  display: 'none',
});

export function JsonHandler(props: {
  jsonLoaded: (shapes: ShapeConfig[]) => void,
}) {
  const { jsonLoaded } = props;

  const handleFileChange = useCallback((event) => {
    const [file] = event.target.files;
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading has failed');
    reader.onload = () => {
      const result = JSON.parse(JSON.parse(String(reader.result)));
      const formatted = result.children.map((shape) => shape.attrs);
      jsonLoaded(formatted);
    };

    reader.readAsText(file);
  }, [props]);

  return (
    <Input
      type="file"
      onChange={handleFileChange}
      id="deserialize"
      accept="application/json"
    />
  );
}
