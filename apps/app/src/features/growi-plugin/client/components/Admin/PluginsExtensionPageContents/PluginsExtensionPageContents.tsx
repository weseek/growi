import React from 'react';

import { useTranslation } from 'next-i18next';
import { Spinner } from 'reactstrap';

import { usePluginDeleteModal } from '~/stores/modal';

import { useSWRxAdminPlugins } from '../../../stores/admin-plugins';

import { PluginCard } from './PluginCard';
import { PluginInstallerForm } from './PluginInstallerForm';

const Loading = (): JSX.Element => {
  return (
    <Spinner className='d-flex justify-content-center aligh-items-center'>
      Loading...
    </Spinner>
  );
};

export const PluginsExtensionPageContents = (): JSX.Element => {
  const { t } = useTranslation('admin');

  const { data, mutate } = useSWRxAdminPlugins();

  const { open: openPluginDeleteModal } = usePluginDeleteModal();

  return (
    <div>
      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">{t('plugins.plugin_installer')}</h2>
          <PluginInstallerForm />
        </div>
      </div>

      <div className="row mb-5">
        <div className="col-lg-12">
          <h2 className="admin-setting-header">
            {t('plugins.plugin_card')}
            <button type="button" className="btn btn-sm ml-auto grw-btn-reload" onClick={() => mutate()}>
              <i className="icon icon-reload"></i>
            </button>
          </h2>
          {data?.plugins == null
            ? <Loading />
            : (
              <div className="d-grid gap-5">
                { data.plugins.length === 0 && (
                  <div>{t('plugins.plugin_is_not_installed')}</div>
                )}
                {data.plugins.map((plugin) => {
                  const pluginId = plugin._id;
                  const pluginName = plugin.meta.name;
                  const pluginUrl = plugin.origin.url;
                  const pluginIsEnabled = plugin.isEnabled;
                  const pluginDiscription = plugin.meta.desc;
                  const onDeleteClicked = () => {
                    openPluginDeleteModal({
                      _id: pluginId,
                      meta: { name: pluginName, types: [], desc: pluginDiscription },
                      origin: { url: pluginUrl },
                      isEnabled: pluginIsEnabled,
                      installedPath: '',
                      organizationName: '',
                    });
                  };
                  return (
                    <PluginCard
                      key={pluginId}
                      id={pluginId}
                      name={pluginName}
                      url={pluginUrl}
                      isEnalbed={pluginIsEnabled}
                      desc={pluginDiscription}
                      onDelete={onDeleteClicked}
                    />
                  );
                })}
              </div>
            )}
        </div>
      </div>

    </div>
  );
};
