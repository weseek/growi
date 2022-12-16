import React, { useState } from 'react';

import Link from 'next/link';

import { apiv3Post } from '~/client/util/apiv3-client';
import { toastSuccess, toastError } from '~/client/util/toastr';
import { useSWRxPlugin } from '~/stores/plugin';

import styles from './PluginCard.module.scss';

type Props = {
  id: string,
  name: string,
  url: string,
  description: string,
}

export const PluginCard = (props: Props): JSX.Element => {

  const {
    id, name, url, description,
  } = props;

  const { data, mutate } = useSWRxPlugin(id);

  if (data == null) {
    return <></>;
  }

  const PluginCardButton = (): JSX.Element => {
    const [isEnabled, setState] = useState<boolean>(data.data.isEnabled);

    const onChangeHandler = async() => {
      const reqUrl = '/plugins/switch-isenabled';

      try {
        const res = await apiv3Post(reqUrl, { _id: id });
        setState(res.data.isEnabled);
        const pluginState = !isEnabled ? 'Enabled' : 'Disabled';
        toastSuccess(`${pluginState} Plugin `);
      }
      catch (err) {
        toastError('pluginIsEnabled', err);
      }
      finally {
        mutate();
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
      const reqUrl = '/plugins/deleted';

      try {
        await apiv3Post(reqUrl, { _id: id, name });
        toastSuccess(`${name} Deleted`);
      }
      catch (err) {
        toastError('pluginDelete', err);
      }
      finally {
        mutate();
      }
    };

    return (
      <div className="">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onClickPluginDeleteBtnHandler()}
        >
          Delete
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
              <Link href={`${url}`}>{name}</Link>
            </h2>
            <p className="card-text text-muted">{description}</p>
          </div>
          <div className='col-3'>
            <div>
              <PluginCardButton />
            </div>
            <div className="mt-4">
              <PluginDeleteButton />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12 d-flex flex-wrap gap-2">
            {/* {topics?.map((topic: string) => {
              return (
                <span key={`${name}-${topic}`} className="badge rounded-1 mp-bg-light-blue text-dark fw-normal">
                  {topic}
                </span>
              );
            })} */}
          </div>
        </div>
      </div>
      <div className="card-footer px-5 border-top-0 mp-bg-light-blue">
        <p className="d-flex justify-content-between align-self-center mb-0">
          <span>
            {/* {owner.login === 'weseek' ? <FontAwesomeIcon icon={faCircleCheck} className="me-1 text-primary" /> : <></>}

            <a href={owner.html_url} target="_blank" rel="noreferrer">
              {owner.login}
            </a> */}
          </span>
          {/* <span>
            <FontAwesomeIcon icon={faCircleArrowDown} className="me-1" /> {stargazersCount}
          </span> */}
        </p>
      </div>
    </div>
  );
};
