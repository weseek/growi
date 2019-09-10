import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Page from '../../PageList/Page';
import { createSubscribedElement } from '../../UnstatedUtils';
import AppContainer from '../../../services/AppContainer';
import UserGroupDetailContainer from '../../../services/UserGroupDetailContainer';

class UserGroupPageList extends React.Component {

  render() {
    const { t, userGroupDetailContainer } = this.props;

    return (
      <Fragment>
        <ul className="page-list-ul page-list-ul-flat">
          {userGroupDetailContainer.state.relatedPages.map((page) => { return <Page key={page._id} page={page} /> })}
        </ul>
        {userGroupDetailContainer.state.relatedPages.length === 0 ? <p>{ t('user_group_management.no_pages') }</p> : null}
      </Fragment>
    );
  }

}

UserGroupPageList.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  userGroupDetailContainer: PropTypes.instanceOf(UserGroupDetailContainer).isRequired,
};

/**
 * Wrapper component for using unstated
 */
const UserGroupPageListWrapper = (props) => {
  return createSubscribedElement(UserGroupPageList, props, [AppContainer, UserGroupDetailContainer]);
};

export default withTranslation()(UserGroupPageListWrapper);
