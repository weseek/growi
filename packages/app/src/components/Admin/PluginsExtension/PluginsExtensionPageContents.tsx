import React from 'react';

import { useSWRxPlugins } from '~/stores/plugin';

import { Loading } from './Loading';
import { PluginCard } from './PluginCard';
import { PluginInstallerForm } from './PluginInstallerForm';
// TODO: i18n

export const PluginsExtensionPageContents = (): JSX.Element => {
  const { data, mutate } = useSWRxPlugins();

  if (data?.data?.plugins == null) {
    return (
      <>
        <div className="row mb-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">Plugin Installer</h2>
            <PluginInstallerForm />
          </div>
        </div>
        <div className="row mb-5">
          <div className="col-lg-12">
            <h2 className="admin-setting-header">Plugins
              <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => mutate()}>
                <i className="icon icon-reload"></i>
              </button>
            </h2>
            <Loading />
          </div>
        </div>
      </>

    );
  }

  return (
    <div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Plugin Installer</h2>
          <PluginInstallerForm />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">Plugins
            <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => mutate()}>
              <i className="icon icon-reload"></i>
            </button>
          </h2>
          <div className="d-grid gap-5">
            { data?.data?.plugins.length === 0 && (
              <div>Plugin is not installed</div>
            )}
            { data?.data?.plugins.map((item) => {
              const pluginId = item[0]._id;
              const pluginName = item[0].meta.name;
              const pluginUrl = item[0].origin.url;
              const pluginDiscription = item[0].meta.desc;
              return (
                <PluginCard
                  key={pluginId}
                  id={pluginId}
                  name={pluginName}
                  url={pluginUrl}
                  description={pluginDiscription}
                />
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
