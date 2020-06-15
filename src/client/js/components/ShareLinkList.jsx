import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from './UnstatedUtils';
import { toastSuccess, toastError } from '../util/apiNotification';

import AppContainer from '../services/AppContainer';


class ShareLinkList extends React.Component {

  constructor(props) {
    super();

    this.appContainer = props;

    this.state = {
      allShareLinks: '',

    };

    this.retriveShareLinks = this.retriveShareLinks.bind(this);
  }

  componentWillMount() {
  }

  async retriveShareLinks() {
    try {
      const res = await this.props.appContainer.apiv3.get('/share-links/');
      const { shareLinks } = res.data;
      this.setState({ allShareLinks: shareLinks });
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
            {this.state.allShareLinks.map(shareLink => (
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
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }

}


ShareLinkList.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

const ShareLinkListWrapper = withUnstatedContainers(ShareLinkList, [AppContainer]);

export default withTranslation()(ShareLinkListWrapper);
