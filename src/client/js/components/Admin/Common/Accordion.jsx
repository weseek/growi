import React, { useState } from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';

const Accordion = (props) => {
  const [isActive, setIsActive] = useState(props.defaultIsActive);

  return (
    <div className="card border-0 rounded-lg mb-0">
      <div
        className="card-header font-weight-normal py-3 d-flex justify-content-between"
        role="button"
        onClick={setIsActive(prevState => !prevState)}
      >
        <p className="mb-0 text-primary">{props.title}</p>
        {isActive
          ? <i className="fa fa-chevron-up" />
          : <i className="fa fa-chevron-down" />
        }
      </div>
      <Collapse isOpen={isActive}>
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
  defaultIsActive: PropTypes.bool,
};

export default Accordion;
