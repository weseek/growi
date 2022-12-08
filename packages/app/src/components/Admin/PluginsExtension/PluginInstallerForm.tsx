import React, { useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import { toastSuccess, toastError } from '~/client/util/apiNotification';
import { apiv3Post } from '~/client/util/apiv3-client';

import AdminInstallButtonRow from '../Common/AdminUpdateButtonRow';
// TODO: error notification (toast, loggerFactory)
// TODO: i18n

export const PluginInstallerForm = (): JSX.Element => {
  // const { t } = useTranslation('admin');

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
      await apiv3Post('/plugins-extension', { pluginInstallerForm });
      toastSuccess('Plugin Install Successed!');
    }
    catch (err) {
      toastError(err);
      // logger.error(err);
    }
  }, []);

  return (
    <form role="form" onSubmit={submitHandler}>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">GitHub Repository URL</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            // defaultValue={adminAppContainer.state.title || ''}
            name="pluginInstallerForm[url]"
            placeholder="https://github.com/weseek/growi-plugin-lsx"
            required
          />
          <p className="form-text text-muted">You can install plugins by inputting the GitHub URL.</p>
          {/* <p className="form-text text-muted">{t('admin:app_setting.sitename_change')}</p> */}
        </div>
      </div>
      {/* <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">branch</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            name="pluginInstallerForm[ghBranch]"
            placeholder="main"
          />
          <p className="form-text text-muted">branch name</p>
        </div>
      </div>
      <div className='form-group row'>
        <label className="text-left text-md-right col-md-3 col-form-label">tag</label>
        <div className="col-md-6">
          <input
            className="form-control"
            type="text"
            name="pluginInstallerForm[ghTag]"
            placeholder="tags"
          />
          <p className="form-text text-muted">tag name</p>
        </div>
      </div> */}

      <div className="row my-3">
        <div className="mx-auto">
          <button type="submit" className="btn btn-primary">Install</button>
        </div>
      </div>
    </form>
  );
};
