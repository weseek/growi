import React from 'react';

import { SearchResultItem } from '~/models/SearchResultItem';
import { useInstalledPlugins } from '~/stores/useInstalledPlugins';

import Loading from './Loading';
import { PluginCard } from './PluginCard';
import { PluginInstallerForm } from './PluginInstallerForm';


// TODO: i18n

export const PluginsExtensionPageContents = (): JSX.Element => {
  const { data, error } = useInstalledPlugins();

  if (data == null) {
    return <Loading />;
  }

  return (
    <div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Plugins Installer</h2>
          <PluginInstallerForm />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Plugins</h2>
          <div className="d-grid gap-5">
            {/* {data?.items.map((item: SearchResultItem) => {
              return <PluginCard key={item.name} {...item} />;
            })} */}
          </div>
        </div>
      </div>

    </div>
  );
};
