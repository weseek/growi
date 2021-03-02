import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

import { useCurrentUser } from '~/stores/context';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const NotAvailableForGuest = ({ children }) => {
  const { data: currentUser } = useCurrentUser();
  const isLoggedin = currentUser != null;

  if (isLoggedin) {
    return children;
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
  children: PropTypes.node.isRequired,
};

export default NotAvailableForGuest;
