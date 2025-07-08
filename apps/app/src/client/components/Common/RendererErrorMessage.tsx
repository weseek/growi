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
      <code>rendererOptions</code> is <code>null</code>
      . Make sure to call <code>useRendererConfig()</code> in your page component to initialize it properly.
    </p>
  );
};
