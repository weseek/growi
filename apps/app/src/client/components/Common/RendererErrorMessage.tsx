import React from 'react';

export const RendererErrorMessage: React.FC = () => {
  return (
    <p
      style={{
        color: 'red',
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '4px',
      }}
    >
      ⚠️ <strong>Developer Warning:</strong>{' '}
      Required renderer configuration is missing. Ensure <code>useRendererConfig()</code> is properly called in the component.
    </p>
  );
};
