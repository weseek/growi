import React from 'react';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';

const ShareLinkList = (props) => {

  function getShareLinkList() {
    return ['Replace with API'];
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Link</th>
            <th>Expiration</th>
            <th>Description</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          {
            getShareLinkList().map((shareLink) => {
              return (
                <>
                  <td>{ shareLink }</td>
                  <td>{ shareLink }</td>
                  <td>{ shareLink }</td>
                  <td>{ shareLink }</td>
                </>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
};

const ShareLinkListWrapper = (props) => {
  return createSubscribedElement(ShareLinkList, props, [AppContainer]);
};

export default withTranslation()(ShareLinkListWrapper);
