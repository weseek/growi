import React from 'react';

export const PluginCard = (): JSX.Element => {
  return (
    <div>
      <div>
        <strong>Plugin Name</strong>
        <small>Discription</small>
        <span>version</span>
        <span>tags</span>
      </div>
      <div>
        <span>URL</span>
        <span>DeleteButton</span>
      </div>
    </div>
  );
};
