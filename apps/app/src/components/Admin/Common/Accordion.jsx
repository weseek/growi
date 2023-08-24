import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { Collapse } from 'reactstrap';

const Accordion = (props) => {
  const [isOpen, setIsOpen] = useState(props.isOpenDefault);
  return (
    <div className="card border-0 rounded-3 mb-0">
      <div
        className="card-header fw-normal py-3 d-flex justify-content-between"
        role="button"
        onClick={() => setIsOpen(prevState => !prevState)}
      >
        <p className="mb-0">{props.title}</p>
        {isOpen
          ? <i className="fa fa-chevron-up" />
          : <i className="fa fa-chevron-down" />
        }
      </div>
      <Collapse isOpen={isOpen}>
        <div className="card-body">
          {props.children}
        </div>
      </Collapse>
    </div>
  );
};

Accordion.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  isOpenDefault: PropTypes.bool,
};

Accordion.defaultProps = {
  isOpenDefault: false,
};

export default Accordion;
