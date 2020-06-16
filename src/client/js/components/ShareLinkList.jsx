import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';


class ShareLinkList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      activePage: 1,
      allShareLinks: [],

    };

    this.handlePageChange = this.handlePageChange.bind(this);
  }

  async componentDidMount() {
    await this.handlePageChange(this.state.activePage);
  }

  async handlePageChange() {
    const relatedPage = this.props.pageContainer.state.pageId;
    try {
      const res = await this.props.appContainer.apiv3Get('/share-links', { relatedPage });
      this.setState({
        allShareLinks: res.data.shareLinksResult,
      });
    }
    catch (err) {
      toastError(err);
    }
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
            { this.state.allShareLinks.map((shareLink) => {
              return (
                <tr key={shareLink._id} id={shareLink._id}>
                  <td>{shareLink._id}</td>
                  <td>{shareLink.expiredAt}</td>
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
      </div>
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
