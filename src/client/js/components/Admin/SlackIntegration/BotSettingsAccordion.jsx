import React from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';

const BotSettingsAccordion = (props) => {
  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">
      {props.children}
    </div>
  );
};

const BotSettingsAccordionItem = (props) => {
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

BotSettingsAccordion.item = BotSettingsAccordionItem;

BotSettingsAccordionItem.propTypes = {
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  onToggleAccordionHandler: PropTypes.func,
};

BotSettingsAccordion.propTypes = {
  children: PropTypes.element.isRequired,
};

export default BotSettingsAccordion;
