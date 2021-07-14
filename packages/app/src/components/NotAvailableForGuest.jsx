import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

import AppContainer from '../services/AppContainer';

import { withUnstatedContainers } from './UnstatedUtils';

const NotAvailableForGuest = (props) => {
  const { appContainer, children } = props;
  const isLoggedin = appContainer.currentUser != null;

  if (isLoggedin) {
    return props.children;
  }

  const id = children.props.id || `grw-not-available-for-guest-${Math.random().toString(32).substring(2)}`;

  // clone and add className
  const clonedChild = React.cloneElement(children, {
    id,
    className: `${children.props.className} grw-not-available-for-guest`,
    onClick: () => { /* do nothing */ },
  });

  return (
    <>
      { clonedChild }
      <UncontrolledTooltip placement="top" target={id}>Not available for guest</UncontrolledTooltip>
    </>
  );

};

NotAvailableForGuest.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  children: PropTypes.node.isRequired,
};

export default withUnstatedContainers(NotAvailableForGuest, [AppContainer]);
