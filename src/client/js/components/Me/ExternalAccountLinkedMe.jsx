
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { withUnstatedContainers } from '../UnstatedUtils';
import { toastError } from '../../util/apiNotification';

import AppContainer from '../../services/AppContainer';
import PersonalContainer from '../../services/PersonalContainer';
import ExternalAccountRow from './ExternalAccountRow';
import AssociateModal from './AssociateModal';
import DisassociateModal from './DisassociateModal';

class ExternalAccountLinkedMe extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isAssociateModalOpen: false,
      isDisassociateModalOpen: false,
      accountForDisassociate: null,
    };

    this.openAssociateModal = this.openAssociateModal.bind(this);
    this.closeAssociateModal = this.closeAssociateModal.bind(this);
    this.openDisassociateModal = this.openDisassociateModal.bind(this);
    this.closeDisassociateModal = this.closeDisassociateModal.bind(this);
  }

  async componentDidMount() {
    try {
      await this.props.personalContainer.retrieveExternalAccounts();
    }
    catch (err) {
      toastError(err);
    }
  }

  openAssociateModal() {
    this.setState({ isAssociateModalOpen: true });
  }

  closeAssociateModal() {
    this.setState({ isAssociateModalOpen: false });
  }

  /**
   * open disassociate modal, and props account
   * @param {object} account
   */
  openDisassociateModal(account) {
    this.setState({
      isDisassociateModalOpen: true,
      accountForDisassociate: account,
    });
  }

  closeDisassociateModal() {
    this.setState({ isDisassociateModalOpen: false });
  }

  render() {
    const { t, personalContainer } = this.props;
    const { externalAccounts } = personalContainer.state;

    return (
      <Fragment>
        <div className="container-fluid my-4">
          <h2 className="border-bottom">
            <button type="button" className="btn btn-outline-secondary btn-sm pull-right" onClick={this.openAssociateModal}>
              <i className="icon-plus" aria-hidden="true" />
            Add
            </button>
            { t('admin:user_management.external_accounts') }
          </h2>
        </div>

        <table className="table table-bordered table-user-list">
          <thead>
            <tr>
              <th width="120px">{ t('admin:user_management.authentication_provider') }</th>
              <th>
                <code>accountId</code>
              </th>
              <th width="200px">{ t('Created') }</th>
              <th width="150px">{ t('Admin') }</th>
            </tr>
          </thead>
          <tbody>
            {externalAccounts !== 0 && externalAccounts.map(account => (
              <ExternalAccountRow
                account={account}
                key={account._id}
                openDisassociateModal={this.openDisassociateModal}
              />
                ))}
          </tbody>
        </table>

        <AssociateModal
          isOpen={this.state.isAssociateModalOpen}
          onClose={this.closeAssociateModal}
        />

        {this.state.accountForDisassociate != null
        && (
        <DisassociateModal
          isOpen={this.state.isDisassociateModalOpen}
          onClose={this.closeDisassociateModal}
          accountForDisassociate={this.state.accountForDisassociate}
        />
        )}

      </Fragment>
    );
  }

}

const ExternalAccountLinkedMeWrapper = withUnstatedContainers(ExternalAccountLinkedMe, [AppContainer, PersonalContainer]);

ExternalAccountLinkedMe.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  personalContainer: PropTypes.instanceOf(PersonalContainer).isRequired,
};

export default withTranslation()(ExternalAccountLinkedMeWrapper);
