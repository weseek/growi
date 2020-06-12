import React from 'react';
import * as toastr from 'toastr';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import CopyDropdown from './Page/CopyDropdown';

const ShareLinkList = (props) => {

  function deleteLinkHandler(shareLink) {
    try {
      // call api
      toastr.success(`Successfully deleted ${shareLink._id}`);
    }
    catch (err) {
      toastr.error(new Error(`Failed to delete ${shareLink._id}`));
    }
  }

  function GetShareLinkList() {
    // dummy data
    const dummyDate = new Date().toString();
    const shareLinks = [
      {
        _id: '507f1f77bcf86cd799439011', link: '/507f1f77bcf86cd799439011', expiration: dummyDate, description: 'foobar',
      },
      {
        _id: '52fcebd19a5c4ea066dbfa12', link: '/52fcebd19a5c4ea066dbfa12', expiration: dummyDate, description: 'test',
      },
      {
        _id: '54759eb3c090d83494e2d804', link: '/54759eb3c090d83494e2d804', expiration: dummyDate, description: 'hoge',
      },
      {
        _id: '5349b4ddd2781d08c09890f3', link: '/5349b4ddd2781d08c09890f3', expiration: dummyDate, description: 'fuga',
      },
      {
        _id: '5349b4ddd2781d08c09890f4', link: '/5349b4ddd2781d08c09890f4', expiration: dummyDate, description: 'piyo',
      },
    ];

    return (
      <>
        {shareLinks.map(shareLink => (
          <tr>
            <td>
              {shareLink.link}
              <CopyDropdown isShareLinkMode="true" shareLink={shareLink} />
            </td>
            <td>{shareLink.expiration}</td>
            <td>{shareLink.description}</td>
            <td>
              <button className="btn btn-outline-warning" type="button" onClick={() => deleteLinkHandler(shareLink)}>
                <i className="icon-trash"></i>Delete
              </button>
            </td>
          </tr>
        ))}
      </>
    );
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
          <GetShareLinkList />
        </tbody>
      </table>
    </div>
  );
};

const ShareLinkListWrapper = withUnstatedContainers(ShareLinkList, [AppContainer]);

export default withTranslation()(ShareLinkListWrapper);
