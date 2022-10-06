import React from 'react';

import { PluginCard } from './PluginCard';
import { PluginInstallerForm } from './PluginInstallerForm';

// TODO: i18n

export const PluginsExtensionPageContents = (): JSX.Element => {
  return (
    <div>
      <div className="row">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Plugins Installer</h2>
          <PluginInstallerForm />
        </div>
      </div>
      <div>
        <PluginCard />
      </div>
    </div>
  );
};
