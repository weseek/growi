import React, { FC, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TagsList from '../TagsList';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  appContainer: AppContainer,
};

const Tag: FC<Props> = (props:Props) => {
  const { t } = useTranslation('');
  const [isOnReload, setIsOnReload] = useState<boolean>(false);
  const { appContainer } = props;

  useEffect(() => {
    setIsOnReload(false);
  }, [isOnReload]);

  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button
          type="button"
          className="btn btn-sm ml-auto grw-btn-reload-rc"
          onClick={() => {
            setIsOnReload(true);
          }}
        >
          <i className="icon icon-reload"></i>
        </button>
      </div>
      <div className="d-flex justify-content-center">
        <button
          className="btn btn-primary my-4"
          type="button"
          onClick={() => {
            window.location.href = '/tags';
          }}
        >
          {t('Check All tags')}
        </button>
      </div>
      <div className="grw-container-convertible mb-5 pb-5">
        <TagsList crowi={appContainer} isOnReload={isOnReload} />
      </div>
    </>
  );

};

export default Tag;
