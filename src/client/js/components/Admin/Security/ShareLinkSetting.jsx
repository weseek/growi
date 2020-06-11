import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../../UnstatedUtils';

import AppContainer from '../../../services/AppContainer';
import AdminGeneralSecurityContainer from '../../../services/AdminGeneralSecurityContainer';

class ShareLinkSetting extends React.Component {

  render() {
    return (
      <div className="container">
        <div className="form-inline mb-3">
          <h2 className="alert-anchor border-bottom">Shared Link List</h2>
        </div>
        <div>
            <button className="ml-auto btn btn-danger" type="button">Delete all links</button>
          </div>

        <div>
        <tr>
            <td>link</td>
            <td>pagePath</td>
            <td>expiration</td>
            <td>description</td>
            <td>
              <button className="btn btn-outline-warning" type="button">
                <i className="icon-trash"></i>Delete
              </button>
            </td>
          </tr>
        </div>
      </div>
    );
  }

}

ShareLinkSetting.propTypes = {
  adminGeneralSecurityContainer: PropTypes.instanceOf(AdminGeneralSecurityContainer).isRequired,
};

const ShareLinkSettingWrapper = (props) => {
  return createSubscribedElement(ShareLinkSetting, props, [AppContainer, AdminGeneralSecurityContainer]);
};

export default withTranslation()(ShareLinkSettingWrapper);
