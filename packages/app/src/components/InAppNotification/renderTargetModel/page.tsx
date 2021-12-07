import React from 'react';

export const createSnapshot = (page): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
    lastUpdateUser: page.lastUpdateUser,
  });
};

export const renderHogeModelNotification = (): JSX.Element => {
  return (
    <div>Hello</div>
  );
};
