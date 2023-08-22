import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { apiv3Delete, apiv3Put } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';

import styles from './PluginCard.module.scss';

type Props = {
  id: string,
  name: string,
  url: string,
  isEnalbed: boolean,
  mutate: () => void,
  desc?: string,
}

export const PluginCard = (props: Props): JSX.Element => {

  const {
    id, name, url, isEnalbed, desc, mutate,
  } = props;

  const { t } = useTranslation('admin');

  const PluginCardButton = (): JSX.Element => {
    const [isEnabled, setState] = useState<boolean>(isEnalbed);

    const onChangeHandler = async() => {
      try {
        if (isEnabled) {
          const reqUrl = `/plugins/${id}/deactivate`;
          const res = await apiv3Put(reqUrl);
          setState(!isEnabled);
          const pluginName = res.data.pluginName;
          toastSuccess(t('toaster.deactivate_plugin_success', { pluginName }));
        }
        else {
          const reqUrl = `/plugins/${id}/activate`;
          const res = await apiv3Put(reqUrl);
          setState(!isEnabled);
          const pluginName = res.data.pluginName;
          toastSuccess(t('toaster.activate_plugin_success', { pluginName }));
        }
      }
      catch (err) {
        toastError(err);
      }
    };

    return (
      <div className={`${styles.plugin_card}`}>
        <div className="switch">
          <label className="switch__label">
            <input
              type="checkbox"
              className="switch__input"
              onChange={() => onChangeHandler()}
              checked={isEnabled}
            />
            <span className="switch__content"></span>
            <span className="switch__circle"></span>
          </label>
        </div>
      </div>
    );
  };

  const PluginDeleteButton = (): JSX.Element => {

    const onClickPluginDeleteBtnHandler = async() => {
      const reqUrl = `/plugins/${id}/remove`;

      try {
        const res = await apiv3Delete(reqUrl);
        const pluginName = res.data.pluginName;
        toastSuccess(t('toaster.remove_plugin_success', { pluginName }));
      }
      catch (err) {
        toastError(err);
      }
      finally {
        mutate();
      }
    };

    return (
      <div>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onClickPluginDeleteBtnHandler()}
        >
          {t('plugins.delete')}
        </button>
      </div>
    );
  };

  return (
    <div className="card shadow border-0" key={name}>
      <div className="card-body px-5 py-4 mt-3">
        <div className="row mb-3">
          <div className="col-9">
            <h2 className="card-title h3 border-bottom pb-2 mb-3">
              <Link href={`${url}`} legacyBehavior>{name}</Link>
            </h2>
            <p className="card-text text-muted">{desc}</p>
          </div>
          <div className="col-3">
            <div>
              <PluginCardButton />
            </div>
            <div className="mt-4">
              <PluginDeleteButton />
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer px-5 border-top-0 mp-bg-light-blue">
        <p className="d-flex justify-content-between align-self-center mb-0">
        </p>
      </div>
    </div>
  );
};
