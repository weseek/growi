import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import TagsList from '../TagsList';
import AppContainer from '../../client/services/AppContainer';

type Props = {
  appContainer: AppContainer,
};


const Tag: FC<Props> = (props:Props) => {
  const { t } = useTranslation('');
  const { appContainer } = props;
  return (
    <>
      <div className="grw-sidebar-content-header p-3 d-flex">
        <h3 className="mb-0">{t('Tags')}</h3>
        <button type="button" className="btn btn-sm ml-auto grw-btn-reload-rc" onClick={() => { window.location.href = '/tags' }}>
          <i className="icon icon-reload"></i>
        </button>
      </div>
      <div className="d-flex justify-content-center">
        <button className="btn btn-primary my-4" type="button" onClick={() => { window.location.href = '/tags' }}>check all tags</button>
      </div>
      <TagsList crowi={appContainer} />
    </>
  );

};

export default Tag;
