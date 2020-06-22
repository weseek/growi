import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../../UnstatedUtils';

import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class ShareLinkSetting extends React.Component {

  render() {
    return (
      <>
        <div className="mb-3">
          <h2 className="alert-anchor border-bottom">Shared Link List</h2>
        </div>
        <button className="pull-right btn btn-danger" type="button">Delete all links</button>

        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Link</th>
                <th>PagePath</th>
                <th>Expiration</th>
                <th>Description</th>
                <th>Order</th>
              </tr>
            </thead>
            <tbody>
              {/* ShareLinkListを参考に */}
            </tbody>
          </table>
        </div>

      </>
    );
  }

}

const ShareLinkSettingWrapper = withUnstatedContainers(ShareLinkSetting, [AdminGeneralSecurityContainer]);

ShareLinkSetting.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

export default withTranslation()(ShareLinkSettingWrapper);
