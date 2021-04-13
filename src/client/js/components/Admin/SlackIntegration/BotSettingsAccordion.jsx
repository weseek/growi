import React from 'react';
import { Collapse } from 'reactstrap';
import PropTypes from 'prop-types';

const BotSettingsAccordion = (props) => {
  if (props.onToggleAccordionHandler != null) {
    onToggleAccordionHandler = props.onToggleAccordionHandler;
  }  

  return (
    <div className="card border-0 rounded-lg shadow overflow-hidden">

      <div className="card border-0 rounded-lg mb-0">
        <div
          className="card-header font-weight-normal py-3 d-flex justify-content-between"
          role="button"
          onClick={onToggleAccordionHandler}
        >
          <p className="mb-0 text-primary"><span className="mr-2">①</span>{props.title}</p>
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



    </div>
  );

};

BotSettingsAccordion.propTypes = {
  isActive: PropTypes.bool,
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  onToggleAccordionHandler: PropTypes.func,
};

export default BotSettingsAccordion;
