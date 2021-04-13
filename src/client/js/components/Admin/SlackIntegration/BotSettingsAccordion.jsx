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
        <p className="mb-0 text-primary"><span className="mr-2">{props.itemNumber}</span>{props.title}</p>
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

BotSettingsAccordion.Item = BotSettingsAccordionItem;

BotSettingsAccordionItem.propTypes = {
  isActive: PropTypes.bool,
  itemNumber: PropTypes.string,
  title: PropTypes.string.isRequired,
  onToggleAccordionHandler: PropTypes.func,
  children: PropTypes.element.isRequired,
};

BotSettingsAccordion.propTypes = {
  children: PropTypes.element.isRequired,
};

export default BotSettingsAccordion;
