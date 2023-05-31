import React, { useCallback } from 'react';

import { useTranslation } from 'next-i18next';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';

import { useSWRxPlugins } from '../../../stores/growi-plugin';

export const PluginInstallerForm = (): JSX.Element => {
  const { mutate } = useSWRxPlugins();
  const { t } = useTranslation('admin');

  const submitHandler = useCallback(async(e) => {
    e.preventDefault();

    const formData = e.target.elements;

    const {
      'pluginInstallerForm[url]': { value: url },
      // 'pluginInstallerForm[ghBranch]': { value: ghBranch },
      // 'pluginInstallerForm[ghTag]': { value: ghTag },
    } = formData;

    const pluginInstallerForm = {
      url,
      // ghBranch,
      // ghTag,
    };

    try {
      const res = await apiv3Post('/plugins', { pluginInstallerForm });
      const pluginName = res.data.pluginName;
      toastSuccess(t('toaster.install_plugin_success', { pluginName }));
    }
    catch (e) {
      toastError(e);
    }
    finally {
      mutate();
    }
  }, [mutate, t]);

  return (
    <form role="form" onSubmit={submitHandler}>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">{t('plugins.repository_url')}</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            name="pluginInstallerForm[url]"
            placeholder="https://github.com/growi/plugins"
            required
          />
          <p className="form-text text-muted">{t('plugins.description')}</p>
        </div>
      </div>

      <div className="row my-3">
        <div className="mx-auto">
          <button type="submit" className="btn btn-primary">{t('plugins.install')}</button>
        </div>
      </div>
    </form>
  );
};
