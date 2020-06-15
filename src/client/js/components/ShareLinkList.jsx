import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';


class ShareLinkList extends React.Component {

  constructor(props) {
    super();

    this.state = {
      allShareLinks: [],

    };

    // this.retriveShareLinks = this.retriveShareLinks.bind(this);
  }

  async getDerivedStateFormProps() {
    const { res } = await this.appContainer.apiv3.get('/share-links/' /* { relatedPage: this.pageContainer.state.pageId } */);
    // this.setState({ allShareLinks: { link: 'hoge', expiration: 'fuga', description: 'piyo' } });
    this.setState({ allShareLinks: res });
  }

  async deleteLinkHandler(shareLinkId) {
    try {
      const res = await this.appContainer.apiv3Delete(`/share-links/${shareLinkId}`);
      const { deletedShareLink } = res.data;
      toastSuccess('remove_share_link_success', { shareLinkId: deletedShareLink._id });
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {

    return (
      <Fragment className="table-responsive">
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
            {this.state.allShareLinks.map((shareLink) => {
              return (
                <tr>
                  <td>{shareLink.link}</td>
                  <td>{shareLink.expiration}</td>
                  <td>{shareLink.description}</td>
                  <td>
                    <button className="btn btn-outline-warning" type="button" onClick={() => this.deleteLinkHandler(shareLink._id)}>
                      <i className="icon-trash"></i>Delete
                    </button>
                  </td>
                </tr>

              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }

}


ShareLinkList.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

const ShareLinkListWrapper = withUnstatedContainers(ShareLinkList, [AppContainer, PageContainer]);

export default withTranslation()(ShareLinkListWrapper);
