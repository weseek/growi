import React from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';

const Accordion = (props) => {
  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      {props.children}
    </div>
  );
};

const AccordionItem = (props) => {
  const onToggleAccordionHandler = () => {
    if (props.onToggleAccordionHandler != null) {
      props.onToggleAccordionHandler();
    }
  };

  return (
    <div className="card border-0 rounded-lg mb-0">
      <div
        className="card-header font-weight-normal py-3 d-flex justify-content-between"
        role="button"
        onClick={onToggleAccordionHandler}
      >
        <p className="mb-0 text-primary">{props.title}</p>
        {props.isActive
          ? <i className="fa fa-chevron-up" />
          : <i className="fa fa-chevron-down" />
        }
      </div>
      <Collapse isOpen={props.isActive}>
        <div className="card-body">
          {props.children}
        </div>
      </Collapse>
    </div>
  );
};

Accordion.Item = AccordionItem;

AccordionItem.propTypes = {
  title: PropTypes.node.isRequired,
  onToggleAccordionHandler: PropTypes.func,
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool,
};

AccordionItem.defaultProps = {
  isActive: true,
};

Accordion.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Accordion;
