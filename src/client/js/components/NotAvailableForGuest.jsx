import React from 'react';
import PropTypes from 'prop-types';

import { UncontrolledTooltip } from 'reactstrap';

const NotAvailableForGuest = ({ children }) => {

  const id = `not-available-for-guest-${Math.random().toString(32).substring(2)}`;

  // clone and add className
  const clonedChildren = React.Children.map(children, child => (
    React.cloneElement(child, {
      id,
      className: `${child.props.className} grw-not-available-for-guest`,
      onClick: () => { /* do nothing */ },
    })
  ));

  return (
    <>
      { clonedChildren }
      {/* <UncontrolledTooltip placement="bottom" fade={false} target={id}>Not available for guest</UncontrolledTooltip> */}
    </>
  );

};

NotAvailableForGuest.propTypes = {
  children: PropTypes.array.length(1).isRequired,
};

export default NotAvailableForGuest;
