import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TagsList from '../TagsList';
import AppContainer from '../../client/services/AppContainer';
import NavigationContainer from '../../client/services/NavigationContainer';

type Props = {
  appContainer: AppContainer,
  navigationContainer: NavigationContainer,
};

const Tag: FC<Props> = (props:Props) => {
  const { t } = useTranslation('');
  const { appContainer, navigationContainer } = props;
  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button
          type="button"
          className="btn btn-sm ml-auto grw-btn-reload-rc"
          onClick={() => {
            // TODO: consider how to reload tags
            console.log('reload tag');
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
            navigationContainer.selectSidebarContents('recent');
            window.location.href = '/tags';
          }}
        >
          {t('Check All tags')}
        </button>
      </div>
      <div className="grw-container-convertible mb-5 pb-5">
        <TagsList crowi={appContainer} />
      </div>
    </>
  );

};

export default Tag;
