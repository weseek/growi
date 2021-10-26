
import React from 'react';
import { pagePathUtils } from '@growi/core';

import { InAppNotification as IInAppNotification } from '../../interfaces/in-app-notification';

const { path2name } = pagePathUtils;

interface Props {
  notification: IInAppNotification
}

export const PagePath = (props: Props): JSX.Element => {
  const { notification } = props;
  const pagePath = notification.target.path;
  const shortPath = path2name(pagePath);
  const pathPrefix = pagePath.slice(0, -shortPath.length);

  return (
    <>
      {pathPrefix}<strong>{shortPath}</strong>
    </>
  );

};
