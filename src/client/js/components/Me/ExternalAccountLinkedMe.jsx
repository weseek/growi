
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from '../UnstatedUtils';
import { toastError } from '../../util/apiNotification';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';
import ExternalAccountRow from './ExternalAccountRow';

class ExternalAccountLinkedMe extends React.Component {

  async componentDidMount() {
    try {
      await this.props.personalContainer.retrieveExternalAccounts();
    }
    catch (err) {
      toastError(err);
    }
  }

  render() {
    const { t, personalContainer } = this.props;
    const { externalAccounts } = personalContainer.state;

    return (
      <Fragment>
        <h2 className="border-bottom">
          <button type="button" className="btn btn-default btn-sm pull-right">
            <i className="icon-plus" aria-hidden="true" />
            Add
          </button>
          { t('External Accounts') }
        </h2>

        <div className="row">
          <div className="col-md-12">
            <table className="table table-bordered table-user-list">
              <thead>
                <tr>
                  <th width="120px">Authentication Provider</th>
                  <th>
                    <code>accountId</code>
                  </th>
                  <th width="200px">{ t('Created') }</th>
                  <th width="150px">{ t('Admin') }</th>
                </tr>
              </thead>
              <tbody>
                {externalAccounts !== 0 && externalAccounts.map(account => <ExternalAccountRow account={account} key={account._id} />)}
              </tbody>
            </table>
          </div>
        </div>
      </Fragment>
    );
  }

}

const ExternalAccountLinkedMeWrapper = (props) => {
  return createSubscribedElement(ExternalAccountLinkedMe, props, [AppContainer, PersonalContainer]);
};

ExternalAccountLinkedMe.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ExternalAccountLinkedMeWrapper);
