import React from 'react';

import type { SearchResultItem } from '~/interfaces/github-api';
import { useInstalledPlugins } from '~/stores/useInstalledPlugins';

import Loading from './Loading';
import { PluginCard } from './PluginCard';
import { PluginInstallerForm } from './PluginInstallerForm';


// TODO: i18n

export const PluginsExtensionPageContents = (): JSX.Element => {
  // const { data, error } = useInstalledPlugins();

  // if (data == null) {
  //   return <Loading />;
  // }

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
          <h2 className="admin-setting-header">Plugins</h2>
          <div className="d-grid gap-5">
            <PluginCard
              name={'growi-plugin-templates-for-office'}
              url={'https://github.com/weseek/growi-plugin-templates-for-office'}
              description={'GROWI markdown templates for office.'}
            />
            {/* <PluginCard
              name={'growi-plugin-theme-welcome-to-fumiya-room'}
              url={'https://github.com/weseek/growi-plugin-theme-welcome-to-fumiya-room'}
              description={'Welcome to fumiya\'s room! This is very very "latest" design...'}
            /> */}
            <PluginCard
              name={'growi-plugin-copy-code-to-clipboard'}
              url={'https://github.com/weseek/growi-plugin-copy-code-to-clipboard'}
              description={'Add copy button on code blocks.'}
            />
            {/* {data?.items.map((item: SearchResultItem) => {
              return <PluginCard key={item.name} {...item} />;
            })} */}
          </div>
        </div>
      </div>

    </div>
  );
};
